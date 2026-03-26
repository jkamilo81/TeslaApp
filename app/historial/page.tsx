'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface TimelineEntry {
  id: string
  petName: string
  type: 'vaccine' | 'insurance' | 'parasite' | 'certificate' | 'appointment' | 'lab_exam' | 'food_purchase'
  title: string
  subtitle: string | null
  date: string
  icon: string
  chipBg: string
  chipText: string
}

const TYPE_META: Record<TimelineEntry['type'], { label: string; icon: string; chipBg: string; chipText: string }> = {
  vaccine: { label: 'Vacuna', icon: 'vaccines', chipBg: 'bg-primary-container', chipText: 'text-on-primary-container' },
  insurance: { label: 'Seguro', icon: 'shield', chipBg: 'bg-secondary-container', chipText: 'text-on-secondary-container' },
  parasite: { label: 'Parásitos', icon: 'bug_report', chipBg: 'bg-tertiary-container/30', chipText: 'text-on-tertiary-container' },
  certificate: { label: 'Certificado', icon: 'workspace_premium', chipBg: 'bg-tertiary-fixed/20', chipText: 'text-tertiary' },
  appointment: { label: 'Cita', icon: 'medical_services', chipBg: 'bg-primary-container/30', chipText: 'text-primary' },
  lab_exam: { label: 'Examen', icon: 'biotech', chipBg: 'bg-tertiary-container/20', chipText: 'text-on-tertiary-container' },
  food_purchase: { label: 'Alimento', icon: 'pet_supplies', chipBg: 'bg-secondary-container/20', chipText: 'text-on-secondary-container' },
}

export default function HistorialPage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TimelineEntry['type'] | 'all'>('all')

  useEffect(() => {
    async function load() {
      const [{ data: vaccines }, { data: insurance }, { data: parasites }, { data: certs }, { data: appointments }, { data: labExams }, { data: foodPurchases }] =
        await Promise.all([
          supabase.from('vaccines').select('*, pets(name)').order('administered_date', { ascending: false }),
          supabase.from('insurance').select('*, pets(name)').order('start_date', { ascending: false }),
          supabase.from('parasite_control').select('*, pets(name)').order('administered_date', { ascending: false }),
          supabase.from('service_certificates').select('*, pets(name)').order('issued_date', { ascending: false }),
          supabase.from('vet_appointments').select('*, pets(name)').order('appointment_date', { ascending: false }),
          supabase.from('lab_exams').select('*, pets(name)').order('exam_date', { ascending: false }),
          supabase.from('food_purchases').select('*, pets(name)').order('purchase_date', { ascending: false }),
        ])

      const all: TimelineEntry[] = [
        ...(vaccines ?? []).map((r) => ({
          id: r.id,
          petName: (r.pets as any)?.name ?? '',
          type: 'vaccine' as const,
          title: r.name,
          subtitle: r.vet_name ? `Vet: ${r.vet_name}` : null,
          date: r.administered_date,
          ...TYPE_META.vaccine,
        })),
        ...(insurance ?? []).map((r) => ({
          id: r.id,
          petName: (r.pets as any)?.name ?? '',
          type: 'insurance' as const,
          title: r.provider,
          subtitle: r.policy_number ? `Póliza: ${r.policy_number}` : null,
          date: r.start_date,
          ...TYPE_META.insurance,
        })),
        ...(parasites ?? []).map((r) => ({
          id: r.id,
          petName: (r.pets as any)?.name ?? '',
          type: 'parasite' as const,
          title: r.product_name,
          subtitle: r.type,
          date: r.administered_date,
          ...TYPE_META.parasite,
        })),
        ...(certs ?? []).map((r) => ({
          id: r.id,
          petName: (r.pets as any)?.name ?? '',
          type: 'certificate' as const,
          title: r.certificate_type,
          subtitle: r.issuing_authority ?? null,
          date: r.issued_date,
          ...TYPE_META.certificate,
        })),
        ...(appointments ?? []).map((r) => ({
          id: r.id,
          petName: (r.pets as any)?.name ?? '',
          type: 'appointment' as const,
          title: r.reason,
          subtitle: r.clinic_name ?? null,
          date: r.appointment_date.split('T')[0],
          ...TYPE_META.appointment,
        })),
        ...(labExams ?? []).map((r) => ({
          id: r.id,
          petName: (r.pets as any)?.name ?? '',
          type: 'lab_exam' as const,
          title: r.name,
          subtitle: r.vet_name ? `Vet: ${r.vet_name}` : null,
          date: r.exam_date,
          ...TYPE_META.lab_exam,
        })),
        ...(foodPurchases ?? []).map((r) => ({
          id: r.id,
          petName: (r.pets as any)?.name ?? '',
          type: 'food_purchase' as const,
          title: r.brand,
          subtitle: `${r.quantity} ${r.quantity_unit}`,
          date: r.purchase_date,
          ...TYPE_META.food_purchase,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setEntries(all)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.type === filter)

  // Group by month
  const grouped: Record<string, TimelineEntry[]> = {}
  filtered.forEach((e) => {
    const d = new Date(e.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(e)
  })

  return (
    <main className="pt-24 px-6 max-w-2xl mx-auto">
      {/* Header */}
      <section className="mb-8">
        <span className="text-primary font-bold text-sm tracking-wider uppercase">Línea de Tiempo</span>
        <h2 className="text-4xl font-headline font-extrabold text-on-surface mt-1 tracking-tight">
          Historial Médico
        </h2>
        <p className="text-on-surface-variant text-lg mt-1">Todos los registros de Tesla y Figo.</p>
      </section>

      {/* Filter chips */}
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 pb-4">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
            filter === 'all' ? 'signature-gradient text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Todos
        </button>
        {(Object.keys(TYPE_META) as TimelineEntry['type'][]).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
              filter === t ? 'signature-gradient text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{TYPE_META[t].icon}</span>
            {TYPE_META[t].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-container-low rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-outline-variant mb-3 block">history</span>
          <p className="text-on-surface-variant font-medium">Sin registros aún</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([monthKey, items]) => {
            const d = new Date(monthKey + '-01')
            const monthLabel = d.toLocaleDateString('es', { month: 'long', year: 'numeric' })
            return (
              <section key={monthKey}>
                <h3 className="font-headline font-bold text-sm text-on-surface-variant uppercase tracking-widest mb-4">
                  {monthLabel}
                </h3>
                <div className="relative pl-8 space-y-4">
                  {/* Timeline line */}
                  <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-surface-container-highest" />

                  {items.map((entry) => (
                    <div key={entry.id} className="relative">
                      {/* Dot */}
                      <div className="absolute -left-8 top-4 w-[18px] h-[18px] rounded-full bg-surface-container-lowest ambient-shadow flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>

                      <div className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${entry.chipBg} ${entry.chipText}`}>
                                {entry.petName}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container text-on-surface-variant`}>
                                {TYPE_META[entry.type].label}
                              </span>
                            </div>
                            <p className="font-headline font-bold text-on-surface">{entry.title}</p>
                            {entry.subtitle && <p className="text-sm text-on-surface-variant">{entry.subtitle}</p>}
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-xs text-outline font-medium">
                              {new Date(entry.date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </main>
  )
}
