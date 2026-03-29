import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cookieStore = await cookies()

  // Authenticated client (uses RLS)
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

  // Service role client (bypasses RLS)
  const serviceClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Query pets with RLS (as authenticated user)
  const { data: petsRLS, error: petsError } = await supabase
    .from('pets')
    .select('id, name, family_id')

  // Query pets without RLS (service role)
  const { data: petsAll } = await serviceClient
    .from('pets')
    .select('id, name, family_id')

  // Query family_members
  const { data: members } = await serviceClient
    .from('family_members')
    .select('user_id, family_id, role')

  return NextResponse.json({
    user_id: user?.id ?? null,
    user_email: user?.email ?? null,
    pets_via_rls: petsRLS,
    pets_rls_error: petsError?.message ?? null,
    pets_all: petsAll,
    family_members: members,
  })
}
