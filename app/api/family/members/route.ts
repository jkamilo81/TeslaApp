import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export async function GET() {
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

  // Get the user's family_id
  const { data: membership } = await serviceClient
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'No family found' }, { status: 404 })
  }

  // Get all members of the family
  const { data: members, error } = await serviceClient
    .from('family_members')
    .select('id, user_id, role')
    .eq('family_id', membership.family_id)

  if (error) {
    console.error('[family/members] Error fetching members:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }

  // Enrich each member with email and name from auth.users
  const enriched = await Promise.all(
    (members ?? []).map(async (member) => {
      const { data: { user: authUser } } = await serviceClient.auth.admin.getUserById(member.user_id!)
      return {
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        email: authUser?.email ?? null,
        name: authUser?.user_metadata?.name ?? authUser?.user_metadata?.full_name ?? null,
      }
    })
  )

  return NextResponse.json(enriched)
}
