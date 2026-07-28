import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createAdminSupabase } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

function initVapid() {
  webpush.setVapidDetails(
    'mailto:admin@pettracker.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
}

function formatDateES(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
}

/** Today's calendar date in America/Bogota as YYYY-MM-DD (en-CA format). */
function bogotaToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
}

/** Add whole days to a YYYY-MM-DD string. */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split('T')[0]
}

// Called by Vercel Cron daily at 8am
export async function GET(req: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically
  // when the CRON_SECRET env var is set. Fail closed if it is missing.
  const authHeader = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  initVapid()
  const supabase = createAdminSupabase()
  // All date windows are computed against the calendar date in Colombia,
  // not the server's UTC clock, so "3 days before" means Bogota days.
  const todayStr = bogotaToday()
  const in3Str = addDays(todayStr, 3)
  const in1Str = addDays(todayStr, 1)

  // Alerts are grouped per family so each family only ever receives
  // notifications about its own pets.
  const alertsByFamily = new Map<string, string[]>()

  function addAlert(familyId: string | null | undefined, message: string) {
    if (!familyId) return
    const list = alertsByFamily.get(familyId) ?? []
    list.push(message)
    alertsByFamily.set(familyId, list)
  }

  // --- Existing alerts: insurance, vaccines, parasite control ---
  const in30Str = addDays(todayStr, 30)

  // `pets!inner` + archived_at filter keeps archived pets out of all reminders.
  // This runs with the service role, so RLS does not filter for us.
  const { data: insurance } = await supabase
    .from('insurance')
    .select('*, pets!inner(name, family_id, archived_at)')
    .is('pets.archived_at', null)
    .lte('expiry_date', in30Str)
    .gte('expiry_date', todayStr)

  insurance?.forEach((r) => {
    addAlert(r.pets?.family_id, `El seguro de ${r.pets?.name} vence el ${r.expiry_date}`)
  })

  const { data: vaccines } = await supabase
    .from('vaccines')
    .select('*, pets!inner(name, family_id, archived_at)')
    .is('pets.archived_at', null)
    .lte('next_due_date', in30Str)
    .gte('next_due_date', todayStr)

  vaccines?.forEach((r) => {
    addAlert(r.pets?.family_id, `Vacuna ${r.name} de ${r.pets?.name} vence el ${r.next_due_date}`)
  })

  const { data: parasites } = await supabase
    .from('parasite_control')
    .select('*, pets!inner(name, family_id, archived_at)')
    .is('pets.archived_at', null)
    .lte('next_due_date', in30Str)
    .gte('next_due_date', todayStr)

  parasites?.forEach((r) => {
    addAlert(r.pets?.family_id, `${r.product_name} de ${r.pets?.name} vence el ${r.next_due_date}`)
  })

  // --- Vet appointment reminders: exactly 3 days and 1 day before ---
  // Query appointments that are exactly 3 days or 1 day from today, status = 'scheduled'
  const { data: appointments } = await supabase
    .from('vet_appointments')
    .select('*, pets!inner(name, family_id, archived_at)')
    .is('pets.archived_at', null)
    .eq('status', 'scheduled')
    .in('appointment_date', [in3Str, in1Str])

  const appointmentNotifications: { appointmentId: string; type: string }[] = []

  if (appointments?.length) {
    for (const appt of appointments) {
      const apptDateStr = appt.appointment_date.split('T')[0]
      const notificationType = apptDateStr === in3Str ? '3_day' : '1_day'
      const daysLabel = notificationType === '3_day' ? '3 días' : '1 día'

      // Check notification_log for duplicates
      const { data: existing } = await supabase
        .from('notification_log')
        .select('id')
        .eq('appointment_id', appt.id)
        .eq('notification_type', notificationType)
        .limit(1)

      if (existing && existing.length > 0) {
        continue // Already sent this notification
      }

      const petName = appt.pets?.name || 'Tu mascota'
      const dateFormatted = formatDateES(apptDateStr)
      const body = `🐾 Recordatorio: ${petName} tiene cita veterinaria en ${daysLabel} (${dateFormatted}) por ${appt.reason}`

      appointmentNotifications.push({
        appointmentId: appt.id,
        type: notificationType,
      })

      addAlert(appt.pets?.family_id, body)
    }
  }

  // --- Send push notifications, one payload per family ---
  let sent = 0
  const familyIds = Array.from(alertsByFamily.keys())

  if (familyIds.length > 0) {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('family_id', familyIds)

    const targets = (subs ?? []).filter(
      (sub) => sub.family_id && alertsByFamily.has(sub.family_id)
    )

    if (targets.length) {
      const results = await Promise.allSettled(
        targets.map((sub) => {
          const familyAlerts = alertsByFamily.get(sub.family_id!) ?? []
          const payload = JSON.stringify({
            title: '🐾 Recordatorio TeslaApp',
            body: familyAlerts.slice(0, 3).join(' • '),
            url: '/',
          })
          return webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          )
        })
      )

      // Remove invalid subscriptions (410 Gone or 404 Not Found)
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        if (result.status === 'fulfilled') {
          sent++
        } else {
          const statusCode = (result.reason as any)?.statusCode
          if (statusCode === 410 || statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', targets[i].id)
          }
        }
      }
    }

    // Log appointment notifications so they are not sent again
    for (const notif of appointmentNotifications) {
      await supabase.from('notification_log').insert({
        appointment_id: notif.appointmentId,
        notification_type: notif.type,
      })
    }
  }

  // Counts only — alert text must not leak to the caller.
  const totalAlerts = familyIds.reduce((acc, id) => acc + (alertsByFamily.get(id)?.length ?? 0), 0)
  return NextResponse.json({ ok: true, families: familyIds.length, alerts: totalAlerts, sent })
}
