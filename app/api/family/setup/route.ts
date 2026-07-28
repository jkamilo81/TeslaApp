import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createAdminSupabase } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createAdminSupabase()

  // Check if user already has a family
  const { data: existing } = await serviceClient
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (existing) {
    // Family exists — but still ensure orphaned pets are assigned
    await serviceClient
      .from('pets')
      .update({ family_id: existing.family_id })
      .is('family_id', null)

    return NextResponse.json({ family_id: existing.family_id, created: false })
  }

  // Create family
  const { data: newFamily, error: familyError } = await serviceClient
    .from('families')
    .insert({ name: 'Mi Familia', created_by: user.id })
    .select('id')
    .single()

  if (familyError || !newFamily) {
    console.error('[family/setup] Error creating family:', familyError)
    return NextResponse.json({ error: 'Failed to create family' }, { status: 500 })
  }

  // Add user as admin
  await serviceClient
    .from('family_members')
    .insert({ family_id: newFamily.id, user_id: user.id, role: 'admin' })

  // Assign orphaned pets
  await serviceClient
    .from('pets')
    .update({ family_id: newFamily.id })
    .is('family_id', null)

  // Create default payer
  const userName = user.user_metadata?.full_name
    || user.user_metadata?.name
    || user.email?.split('@')[0]
    || 'Usuario'

  await serviceClient
    .from('payers')
    .insert({ name: userName, family_id: newFamily.id, user_id: user.id, is_default: true })

  // Migrate orphaned payers
  await serviceClient
    .from('payers')
    .update({ family_id: newFamily.id })
    .is('family_id', null)

  return NextResponse.json({ family_id: newFamily.id, created: true })
}


// GET handler for easy browser testing — same logic as POST
export async function GET() {
  return POST()
}
