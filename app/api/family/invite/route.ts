import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerSupabase } from '@/lib/supabase-server'
import { createAdminSupabase } from '@/lib/supabase-admin'

export async function POST() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createAdminSupabase()

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
