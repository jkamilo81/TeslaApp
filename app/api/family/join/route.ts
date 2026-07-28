import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createAdminSupabase } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code } = await request.json()

  const serviceClient = createAdminSupabase()

  // Look up the invitation by code
  const { data: invitation } = await serviceClient
    .from('family_invitations')
    .select('id, family_id, expires_at')
    .eq('code', code)
    .limit(1)
    .single()

  if (!invitation) {
    return NextResponse.json({ error: 'Código de invitación no válido' }, { status: 404 })
  }

  if (new Date(invitation.expires_at) <= new Date()) {
    return NextResponse.json({ error: 'El código de invitación ha expirado' }, { status: 410 })
  }

  // Check if user is already a member of this family
  const { data: existingMember } = await serviceClient
    .from('family_members')
    .select('id')
    .eq('family_id', invitation.family_id)
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (existingMember) {
    return NextResponse.json({ error: 'Ya eres miembro de esta familia' }, { status: 409 })
  }

  const { error } = await serviceClient
    .from('family_members')
    .insert({
      family_id: invitation.family_id,
      user_id: user.id,
      role: 'member',
    })

  if (error) {
    console.error('[family/join] Error inserting member:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }

  // Create a payer entry for the new member
  const userName = user.user_metadata?.full_name
    || user.user_metadata?.name
    || user.email?.split('@')[0]
    || 'Usuario'

  await serviceClient
    .from('payers')
    .insert({ name: userName, family_id: invitation.family_id, user_id: user.id, is_default: false })

  return NextResponse.json({ ok: true })
}
