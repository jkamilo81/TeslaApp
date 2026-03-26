import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import type { Database } from '@/types/database.types'

export async function POST() {
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

  // Service role client to bypass RLS
  const serviceClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check user is an admin in their family
  const { data: membership } = await serviceClient
    .from('family_members')
    .select('family_id, role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .limit(1)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const code = crypto.randomBytes(4).toString('hex').toUpperCase()
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await serviceClient
    .from('family_invitations')
    .insert({
      family_id: membership.family_id,
      code,
      created_by: user.id,
      expires_at,
    })

  if (error) {
    console.error('[family/invite] Error inserting invitation:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }

  return NextResponse.json({ code })
}
