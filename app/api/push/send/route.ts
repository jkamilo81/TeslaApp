import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createAdminSupabase } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

function getWebPush() {
  webpush.setVapidDetails(
    'mailto:admin@pettracker.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
  return webpush
}

export async function POST(req: NextRequest) {
  const wp = getWebPush()
  const supabase = createAdminSupabase()
  // Only allow calls from the cron job with the secret.
  // Fail closed: if CRON_SECRET is not configured, nobody can call this.
  const cronSecret = req.headers.get('x-cron-secret')
  if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, body, url } = await req.json()
  const { data: subs } = await supabase.from('push_subscriptions').select('*')
  if (!subs?.length) return NextResponse.json({ sent: 0 })

  const results = await Promise.allSettled(
    subs.map((sub) =>
      wp.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, url })
      )
    )
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  return NextResponse.json({ sent })
}
