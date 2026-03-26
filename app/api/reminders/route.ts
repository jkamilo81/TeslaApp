import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Service role client — bypasses RLS for cron job access to notification_log
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

webpush.setVapidDetails(
  'mailto:admin@pettracker.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

function formatDateES(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
}

function formatTimeES(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function getDateOnly(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Called by Vercel Cron daily at 8am
export async function GET() {
  const today = new Date()
  const todayStr = getDateOnly(today)

  const in3 = new Date(today)
  in3.setDate(today.getDate() + 3)
  const in3Str = getDateOnly(in3)

  const in1 = new Date(today)
  in1.setDate(today.getDate() + 1)
  const in1Str = getDateOnly(in1)

  const alerts: string[] = []

  // --- Existing alerts: insurance, vaccines, parasite control ---
  const in30 = new Date(today)
  in30.setDate(today.getDate() + 30)

  const { data: insurance } = await supabase
    .from('insurance')
    .select('*, pets(name, family_id)')
    .lte('expiry_date', in30.toISOString().split('T')[0])
    .gte('expiry_date', todayStr)

  insurance?.forEach((r) => {
    alerts.push(`El seguro de ${(r.pets as any)?.name} vence el ${r.expiry_date}`)
  })

  const { data: vaccines } = await supabase
    .from('vaccines')
    .select('*, pets(name, family_id)')
    .lte('next_due_date', in30.toISOString().split('T')[0])
    .gte('next_due_date', todayStr)

  vaccines?.forEach((r) => {
    alerts.push(`Vacuna ${r.name} de ${(r.pets as any)?.name} vence el ${r.next_due_date}`)
  })

  const { data: parasites } = await supabase
    .from('parasite_control')
    .select('*, pets(name, family_id)')
    .lte('next_due_date', in30.toISOString().split('T')[0])
    .gte('next_due_date', todayStr)

  parasites?.forEach((r) => {
    alerts.push(`${r.product_name} de ${(r.pets as any)?.name} vence el ${r.next_due_date}`)
  })

  // --- Vet appointment reminders: exactly 3 days and 1 day before ---
  // Query appointments that are exactly 3 days or 1 day from today, status = 'scheduled'
  const { data: appointments } = await supabase
    .from('vet_appointments')
    .select('*, pets(name, family_id)')
    .eq('status', 'scheduled')
    .in('appointment_date', [in3Str, in1Str])

  const appointmentNotifications: { appointmentId: string; type: string; body: string }[] = []

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

      const petName = (appt.pets as any)?.name || 'Tu mascota'
      const dateFormatted = formatDateES(apptDateStr)
      const body = `🐾 Recordatorio: ${petName} tiene cita veterinaria en ${daysLabel} (${dateFormatted}) por ${appt.reason}`

      appointmentNotifications.push({
        appointmentId: appt.id,
        type: notificationType,
        body,
      })

      alerts.push(body)
    }
  }

  // --- Collect family_ids from pets with alerts (insurance/vaccines/parasites) ---
  const alertFamilyIds = new Set<string>()
  insurance?.forEach((r) => { if ((r.pets as any)?.family_id) alertFamilyIds.add((r.pets as any).family_id) })
  vaccines?.forEach((r) => { if ((r.pets as any)?.family_id) alertFamilyIds.add((r.pets as any).family_id) })
  parasites?.forEach((r) => { if ((r.pets as any)?.family_id) alertFamilyIds.add((r.pets as any).family_id) })

  // --- Send push notifications ---
  if (alerts.length > 0) {
    // Build the set of family_ids to notify (alerts + appointment families)
    const notifyFamilyIds = new Set(alertFamilyIds)
    appointments?.forEach((appt) => { if ((appt.pets as any)?.family_id) notifyFamilyIds.add((appt.pets as any).family_id) })

    const familyIdList = Array.from(notifyFamilyIds)
    const { data: subs } = familyIdList.length > 0
      ? await supabase.from('push_subscriptions').select('*').in('family_id', familyIdList)
      : { data: [] }

    if (subs?.length) {
      const payload = JSON.stringify({
        title: '🐾 Recordatorio TeslaApp',
        body: alerts.slice(0, 3).join(' • '),
        url: '/',
      })

      const results = await Promise.allSettled(
        subs.map((sub) =>
          webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          )
        )
      )

      // Remove invalid subscriptions (410 Gone or 404 Not Found)
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        if (result.status === 'rejected') {
          const statusCode = (result.reason as any)?.statusCode
          if (statusCode === 410 || statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', subs[i].id)
          }
        }
      }
    }

    // Log successful appointment notifications
    for (const notif of appointmentNotifications) {
      await supabase.from('notification_log').insert({
        appointment_id: notif.appointmentId,
        notification_type: notif.type,
      })
    }
  }

  return NextResponse.json({ alerts })
}
