import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/** Escape text for ICS values (RFC 5545). */
function icsEscape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Format a date as UTC ICS timestamp: YYYYMMDDTHHMMSSZ */
function icsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

/**
 * Downloadable ICS calendar with the family's scheduled vet appointments.
 * Auth comes from the session cookie, so RLS scopes the query to the
 * caller's family. Anonymous requests get 401.
 */
export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: appointments } = await supabase
    .from('vet_appointments')
    .select('id, reason, appointment_date, vet_name, clinic_name, notes, pets!inner(name, archived_at)')
    .is('pets.archived_at', null)
    .eq('status', 'scheduled')
    .order('appointment_date')

  const now = new Date()
  const events = (appointments ?? [])
    .filter((a) => !isNaN(new Date(a.appointment_date).getTime()))
    .map((a) => {
      const start = new Date(a.appointment_date)
      const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hour
      const petName = (a.pets as { name: string } | null)?.name ?? 'Mascota'
      const summary = `🐾 ${petName} — ${a.reason}`
      const descriptionParts = [
        a.vet_name ? `Veterinario: ${a.vet_name}` : null,
        a.notes || null,
      ].filter(Boolean)

      return [
        'BEGIN:VEVENT',
        `UID:${a.id}@teslaapp`,
        `DTSTAMP:${icsDate(now)}`,
        `DTSTART:${icsDate(start)}`,
        `DTEND:${icsDate(end)}`,
        `SUMMARY:${icsEscape(summary)}`,
        a.clinic_name ? `LOCATION:${icsEscape(a.clinic_name)}` : null,
        descriptionParts.length ? `DESCRIPTION:${icsEscape(descriptionParts.join('\n'))}` : null,
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:${icsEscape(summary)}`,
        'END:VALARM',
        'END:VEVENT',
      ].filter(Boolean).join('\r\n')
    })

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TeslaApp//Pet Tracker//ES',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:Citas Veterinarias',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="citas-veterinarias.ics"',
    },
  })
}
