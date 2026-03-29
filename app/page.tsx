'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getDaysUntil } from '@/lib/notifications'
import EnableNotifications from '@/components/EnableNotifications'

interface Alert {
  label: string
  date: string | null
  days: number | null
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [pets, setPets] = useState<{id: string, name: string, type: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string | null>(null)
  const [fabOpen, setFabOpen] = useState(false)
  const fabRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close FAB menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setFabOpen(false)
      }
    }
    if (fabOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [fabOpen])

  const FAB_ACTIONS = [
    { label: 'Tesla', icon: 'pets', href: '/tesla' },
    { label: 'Figo', icon: 'cruelty_free', href: '/figo' },
    { label: 'Gastos', icon: 'payments', href: '/gastos' },
  ]

  useEffect(() => {
    async function load() {
      try {
        // Get user name from auth session if available
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const name = user.user_metadata?.full_name
            || user.user_metadata?.name
            || user.email?.split('@')[0]
            || null
          setUserName(name)
        }
      } catch {
        // No auth session — that's fine when login is disabled
      }

      try {
        const { data: petsData } = await supabase.from('pets').select('id, name, type').order('name')
        setPets(petsData ?? [])
      } catch {
        // Pets query failed — show empty state
      }

      try {
        const results = await Promise.allSettled([
          supabase.from('insurance').select('*, pets(name)').order('expiry_date'),
          supabase.from('vaccines').select('*, pets(name)').order('next_due_date'),
          supabase.from('parasite_control').select('*, pets(name)').order('next_due_date'),
          supabase.from('service_certificates').select('*, pets(name)').order('expiry_date'),
          supabase
            .from('vet_appointments')
            .select('*, pets(name)')
            .eq('status', 'scheduled')
            .gte('appointment_date', new Date().toISOString())
            .order('appointment_date')
            .limit(5),
        ])

        const getData = (r: PromiseSettledResult<any>) => r.status === 'fulfilled' ? r.value.data ?? [] : []
        const insurance = getData(results[0])
        const vaccines = getData(results[1])
        const parasites = getData(results[2])
        const certs = getData(results[3])
        const appts = getData(results[4])

        const allAlerts: Alert[] = [
          ...insurance.map((r: any) => ({ label: `Seguro de ${r.pets?.name}`, date: r.expiry_date, days: getDaysUntil(r.expiry_date) })),
          ...vaccines.map((r: any) => ({ label: `${r.pets?.name} — ${r.name}`, date: r.next_due_date, days: getDaysUntil(r.next_due_date) })),
          ...parasites.map((r: any) => ({ label: `${r.pets?.name} — ${r.product_name}`, date: r.next_due_date, days: getDaysUntil(r.next_due_date) })),
          ...certs.map((r: any) => ({ label: `Certificado de ${r.pets?.name}`, date: r.expiry_date, days: getDaysUntil(r.expiry_date) })),
        ]
          .filter((a) => a.days !== null && a.days <= 60)
          .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))

        setAlerts(allAlerts)
        setAppointments(appts)
      } catch {
        // Dashboard data failed — show empty state
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <main className="pt-24 px-6 max-w-5xl mx-auto">
      {/* Editorial Welcome */}
      <section className="mb-10">
        <h1 className="font-headline text-5xl font-extrabold tracking-tight mb-2 text-on-surface">
          Hola{userName ? `, ${userName}` : ''}.
        </h1>
        <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
          {pets.length > 0
            ? `${pets.map(p => p.name).join(' y ')} van bien con sus metas de bienestar.`
            : 'Todo en orden hoy.'}
        </p>
        <div className="mt-4">
          <EnableNotifications />
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* Pet Profile Cards — Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pets.length === 0 ? (
                <div className="sm:col-span-2 flex items-center justify-center h-40 bg-surface-container-lowest rounded-xl ambient-shadow">
                  <p className="text-on-surface-variant text-sm">No hay mascotas registradas en tu familia</p>
                </div>
              ) : (
                pets.map((pet) => {
                  const isDog = pet.type === 'dog'
                  const colorClass = isDog ? 'primary' : 'tertiary'
                  const bgBlob = isDog ? 'bg-primary-container/20' : 'bg-tertiary-container/20'
                  const badgeBg = isDog ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-container text-on-tertiary-container'
                  const iconName = isDog ? 'pets' : 'cruelty_free'
                  const subtitle = isDog ? 'Tu compañero fiel' : 'Tu amigo gentil'
                  const subtitleIcon = isDog ? 'favorite' : 'cruelty_free'
                  const ringColor = isDog ? 'bg-secondary' : 'bg-tertiary'
                  const ringText = isDog ? 'text-on-secondary' : 'text-on-tertiary'
                  const typeLabel = isDog ? 'Perro' : 'Gato'
                  return (
                    <Link key={pet.id} href={`/${pet.name.toLowerCase()}`} className="group">
                      <div className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow flex flex-col justify-between relative overflow-hidden h-full transition-all duration-300 hover:translate-y-[-4px]">
                        <div className={`absolute -right-4 -top-4 w-32 h-32 ${bgBlob} rounded-full blur-2xl group-hover:scale-125 transition-transform`} />
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <span className={`${badgeBg} px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider`}>
                              {pet.name}
                            </span>
                            <span className={`material-symbols-outlined text-${colorClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                              {iconName}
                            </span>
                          </div>
                          <h2 className="font-headline text-2xl font-bold mb-1">{typeLabel}</h2>
                          <p className="text-on-surface-variant text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">{subtitleIcon}</span>
                            {subtitle}
                          </p>
                        </div>
                        <div className="mt-8 flex items-end justify-between relative z-10">
                          <div className="flex -space-x-2">
                            <div className={`w-8 h-8 rounded-full ${ringColor} flex items-center justify-center text-[10px] ${ringText} font-bold ring-2 ring-white`}>
                              <span className="material-symbols-outlined text-xs">shield</span>
                            </div>
                          </div>
                          <span className={`text-${colorClass} font-bold text-sm flex items-center gap-1`}>
                            Ver Perfil
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>

            {/* Side panel */}
            <div className="md:col-span-4 flex flex-col gap-6">
              {/* Health Logs shortcut */}
              <Link href="/historial" className="bg-secondary p-6 rounded-xl text-on-secondary relative overflow-hidden group cursor-pointer active:scale-95 transition-all block">
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-3xl mb-4">clinical_notes</span>
                  <h3 className="font-headline text-xl font-bold">Historial Médico</h3>
                  <p className="text-secondary-fixed/80 text-sm mt-1">Revisa todo el historial médico y cambios recientes.</p>
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[120px]">medical_information</span>
                </div>
              </Link>

              {/* Gastos shortcut */}
              <Link href="/gastos" className="bg-primary p-6 rounded-xl text-on-primary relative overflow-hidden group cursor-pointer active:scale-95 transition-all block">
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-3xl mb-4">payments</span>
                  <h3 className="font-headline text-xl font-bold">Centro de Gastos</h3>
                  <p className="text-primary-fixed/80 text-sm mt-1">Consulta gastos por mascota, categoría y pagador.</p>
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[120px]">account_balance_wallet</span>
                </div>
              </Link>

              {/* Upcoming Appointments */}
              {appointments.length > 0 && (
                <div className="bg-surface-container p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-headline font-bold">Próximas Citas</h3>
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Próximos 7 Días</span>
                  </div>
                  <div className="space-y-6">
                    {appointments.slice(0, 3).map((a) => (
                      <div key={a.id} className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-surface-container-lowest rounded-lg flex flex-col items-center justify-center ambient-shadow">
                          <span className="text-[10px] font-bold text-error uppercase">
                            {new Date(a.appointment_date).toLocaleDateString('es', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold font-headline">
                            {new Date(a.appointment_date).getDate()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-on-surface">{(a.pets as any)?.name} — {a.reason}</h4>
                          {a.clinic_name && <p className="text-xs text-on-surface-variant mb-1">{a.clinic_name}</p>}
                          <span className="text-[10px] bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full font-medium">
                            {new Date(a.appointment_date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-tertiary">notifications_active</span>
                <h3 className="font-headline font-bold text-lg">Próximos y Vencidos</h3>
              </div>
              <div className="space-y-3">
                {alerts.map((a, i) => (
                  <div key={i} className="bg-surface-container-low rounded-xl px-5 py-4 flex justify-between items-center">
                    <span className="text-sm text-on-surface font-medium">{a.label}</span>
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded-full ${
                        a.days !== null && a.days < 0
                          ? 'bg-error-container/30 text-error'
                          : a.days !== null && a.days <= 30
                          ? 'bg-tertiary-container/30 text-on-tertiary-container'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {a.days !== null && a.days < 0 ? `hace ${Math.abs(a.days)}d` : `${a.days}d`}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* FAB */}
      <div ref={fabRef} className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40">
        {/* Speed dial actions */}
        {fabOpen && (
          <div className="absolute bottom-20 right-0 flex flex-col items-end gap-3 mb-2">
            {FAB_ACTIONS.map((action) => (
              <button
                key={action.href}
                onClick={() => { setFabOpen(false); router.push(action.href) }}
                className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2"
              >
                <span className="bg-surface-container-lowest text-on-surface text-sm font-semibold px-4 py-2 rounded-full ambient-shadow whitespace-nowrap">
                  {action.label}
                </span>
                <span className="w-12 h-12 rounded-full bg-surface-container-lowest ambient-shadow flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">{action.icon}</span>
                </span>
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setFabOpen((prev) => !prev)}
          className={`w-16 h-16 rounded-full signature-gradient text-on-primary flex items-center justify-center hover:scale-110 active:scale-95 transition-all ambient-shadow-lg ${fabOpen ? 'rotate-45' : ''}`}
        >
          <span className="material-symbols-outlined text-3xl transition-transform" style={{ fontVariationSettings: "'wght' 600" }}>add</span>
        </button>
      </div>
    </main>
  )
}
