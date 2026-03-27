import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const dynamic = 'force-dynamic'

export async function POST() {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* ignore */ }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check if user already has a family
  const { data: existing } = await serviceClient
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (existing) {
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
