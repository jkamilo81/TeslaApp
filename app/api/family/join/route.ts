import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  // Authenticated client to get the session
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component context — ignore
          }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { code } = await request.json()

  // Service role client to bypass RLS
  const serviceClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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

  return NextResponse.json({ ok: true })
}
