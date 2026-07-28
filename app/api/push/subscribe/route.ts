import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { endpoint, keys } = await req.json()

  if (typeof endpoint !== 'string' || !endpoint
    || typeof keys?.p256dh !== 'string' || typeof keys?.auth !== 'string') {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the user's family_id
  const { data: membership } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const family_id = membership?.family_id ?? null

  const { error } = await supabase.from('push_subscriptions').upsert(
    { endpoint, p256dh: keys.p256dh, auth: keys.auth, user_id: user.id, family_id },
    { onConflict: 'endpoint' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
