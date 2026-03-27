import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()

    // Regular client to exchange the code for a session
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Use service role client to bypass RLS for post-login setup
        const serviceClient = createServerClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            cookies: {
              getAll() { return [] },
              setAll() {},
            },
          }
        )

        try {
          // Check if user already belongs to a family
          const { data: existingMembership } = await serviceClient
            .from('family_members')
            .select('family_id')
            .eq('user_id', user.id)
            .limit(1)
            .single()

          if (!existingMembership) {
            // Create a new family for this user
            const { data: newFamily, error: familyError } = await serviceClient
              .from('families')
              .insert({ name: 'Mi Familia', created_by: user.id })
              .select('id')
              .single()

            if (familyError || !newFamily) {
              console.error('[auth/callback] Error creating family:', familyError)
            } else {
              // Add user as admin of the new family
              const { error: memberError } = await serviceClient
                .from('family_members')
                .insert({ family_id: newFamily.id, user_id: user.id, role: 'admin' })

              if (memberError) {
                console.error('[auth/callback] Error creating family member:', memberError)
              }

              // Assign any orphaned pets to the new family
              const { error: petsError } = await serviceClient
                .from('pets')
                .update({ family_id: newFamily.id })
                .is('family_id', null)

              if (petsError) {
                console.error('[auth/callback] Error assigning orphaned pets:', petsError)
              }

              // Create default payer for this user
              const userName = user.user_metadata?.full_name
                || user.user_metadata?.name
                || user.email?.split('@')[0]
                || 'Usuario'

              await serviceClient
                .from('payers')
                .insert({ name: userName, family_id: newFamily.id, user_id: user.id, is_default: true })

              // Also migrate any orphaned payers
              await serviceClient
                .from('payers')
                .update({ family_id: newFamily.id })
                .is('family_id', null)
            }
          }
        } catch (err) {
          console.error('[auth/callback] Unexpected error during family setup:', err)
        }
      }

      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
