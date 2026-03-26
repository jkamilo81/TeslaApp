'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCOP } from '@/lib/format'

interface Pet {
  id: string
  name: string
}

interface CategoryTotal {
  key: string
  label: string
  icon: string
  total: number
}

interface PayerTotal {
  name: string
  total: number
}

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  insurance: { label: 'Seguro', icon: 'shield' },
  vaccines: { label: 'Vacunas', icon: 'vaccines' },
  parasite_control: { label: 'Parásitos', icon: 'bug_report' },
  service_certificates: { label: 'Certificados', icon: 'workspace_premium' },
  vet_appointments: { label: 'Citas', icon: 'medical_services' },
  lab_exams: { label: 'Exámenes', icon: 'biotech' },
  food_purchases: { label: 'Alimento', icon: 'pet_supplies' },
}

const TABLE_DATE_COLUMNS: Record<string, string> = {
  insurance: 'start_date',
  vaccines: 'administered_date',
  parasite_control: 'administered_date',
  service_certificates: 'issued_date',
  vet_appointments: 'appointment_date',
  lab_exams: 'exam_date',
  food_purchases: 'purchase_date',
}

function getDefaultDateRange() {
  const now = new Date()
  const end = now.toISOString().split('T')[0]
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0]
  return { start, end }
}

export default function GastosPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPet, setSelectedPet] = useState<string>('all')
  const [startDate, setStartDate] = useState(getDefaultDateRange().start)
  const [endDate, setEndDate] = useState(getDefaultDateRange().end)
  const [categories, setCategories] = useState<CategoryTotal[]>([])
  const [payers, setPayers] = useState<PayerTotal[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load pets on mount
  useEffect(() => {
    async function loadPets() {
      const { data } = await supabase.from('pets').select('id, name').order('name')
      setPets(data ?? [])
    }
    loadPets()
  }, [])

  const loadExpenses = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const petIds = selectedPet === 'all'
        ? pets.map((p) => p.id)
        : [selectedPet]

      if (petIds.length === 0) {
        setCategories([])
        setPayers([])
        setTotal(0)
        setLoading(false)
        return
      }

      // Query each table in parallel
      const tableNames = Object.keys(TABLE_DATE_COLUMNS)
      const queries = tableNames.map((table) => {
        const dateCol = TABLE_DATE_COLUMNS[table]
        let query = supabase
          .from(table as 'insurance')
          .select('id, cost_cop')
          .not('cost_cop', 'is', null)
          .gte(dateCol, startDate)
          .lte(dateCol, endDate)

        if (selectedPet !== 'all') {
          query = query.eq('pet_id', selectedPet)
        } else {
          query = query.in('pet_id', petIds)
        }

        return query
      })

      const results = await Promise.all(queries)

      // Build category totals and collect record IDs per table
      const allRecordIds: { table: string; id: string }[] = []
      let grandTotal = 0
      const catTotals: CategoryTotal[] = []

      results.forEach((result, idx) => {
        const table = tableNames[idx]
        const rows = result.data ?? []
        const meta = CATEGORY_META[table]
        let catTotal = 0

        rows.forEach((row: any) => {
          const cost = Number(row.cost_cop) || 0
          catTotal += cost
          grandTotal += cost
          allRecordIds.push({ table, id: row.id })
        })

        if (catTotal > 0) {
          catTotals.push({
            key: table,
            label: meta.label,
            icon: meta.icon,
            total: catTotal,
          })
        }
      })

      // Sort categories by total descending
      catTotals.sort((a, b) => b.total - a.total)

      setCategories(catTotals)
      setTotal(grandTotal)

      // Query payer breakdown from payment_distributions
      if (allRecordIds.length > 0) {
        // Group record IDs by table for efficient querying
        const idsByTable: Record<string, string[]> = {}
        allRecordIds.forEach(({ table, id }) => {
          if (!idsByTable[table]) idsByTable[table] = []
          idsByTable[table].push(id)
        })

        // Query payment_distributions for all record IDs
        const distQueries = Object.entries(idsByTable).map(([table, ids]) =>
          supabase
            .from('payment_distributions')
            .select('amount, payers(name)')
            .eq('record_table', table)
            .in('record_id', ids)
        )

        const distResults = await Promise.all(distQueries)
        const payerMap: Record<string, number> = {}

        distResults.forEach((result) => {
          (result.data ?? []).forEach((dist: any) => {
            const name = (dist.payers as any)?.name ?? 'Sin asignar'
            const amount = Number(dist.amount) || 0
            payerMap[name] = (payerMap[name] || 0) + amount
          })
        })

        const payerTotals: PayerTotal[] = Object.entries(payerMap)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)

        setPayers(payerTotals)
      } else {
        setPayers([])
      }
    } catch (err) {
      console.error('Error loading expenses:', err)
      setError('Error al cargar los gastos. Intenta de nuevo.')
    }

    setLoading(false)
  }, [pets, selectedPet, startDate, endDate])

  // Reload when filters change (and pets are loaded)
  useEffect(() => {
    if (pets.length > 0) {
      loadExpenses()
    }
  }, [pets, selectedPet, startDate, endDate, loadExpenses])

  const hasExpenses = categories.length > 0

  return (
    <main className="pt-24 px-6 max-w-2xl mx-auto pb-32">
      {/* Header */}
      <section className="mb-8">
        <span className="text-primary font-bold text-sm tracking-wider uppercase">Finanzas</span>
        <h2 className="text-4xl font-headline font-extrabold text-on-surface mt-1 tracking-tight">
          Gastos
        </h2>
        <p className="text-on-surface-variant text-lg mt-1">Control de gastos de Tesla y Figo.</p>
      </section>

      {/* Pet selector chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedPet('all')}
          className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
            selectedPet === 'all'
              ? 'signature-gradient text-on-primary'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Todos
        </button>
        {pets.map((pet) => (
          <button
            key={pet.id}
            onClick={() => setSelectedPet(pet.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
              selectedPet === pet.id
                ? 'signature-gradient text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-sm">pets</span>
            {pet.name}
          </button>
        ))}
      </div>

      {/* Date range selector */}
      <div className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-xl">date_range</span>
          <span className="font-headline font-bold text-sm text-on-surface">Rango de Fechas</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-surface-container rounded-lg px-3 py-2.5 text-sm text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-surface-container rounded-lg px-3 py-2.5 text-sm text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-error-container/20 rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-error mb-3 block">error</span>
          <p className="text-on-surface font-medium mb-4">{error}</p>
          <button
            onClick={loadExpenses}
            className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-sm active:scale-95 transition-all"
          >
            Reintentar
          </button>
        </div>
      ) : !hasExpenses ? (
        <div className="bg-surface-container-low rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-outline-variant mb-3 block">payments</span>
          <p className="text-on-surface-variant font-medium">No hay gastos registrados en este período</p>
          <p className="text-on-surface-variant text-sm mt-1">Ajusta el rango de fechas o selecciona otra mascota.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Total summary */}
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary-container/20 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Total del Período</span>
              </div>
              <p className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">
                {formatCOP(total)}
              </p>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-secondary text-xl">category</span>
              <span className="font-headline font-bold text-sm text-on-surface">Por Categoría</span>
            </div>
            <div className="space-y-3">
              {categories.map((cat) => {
                const pct = total > 0 ? (cat.total / total) * 100 : 0
                return (
                  <div key={cat.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant text-base">{cat.icon}</span>
                        </div>
                        <span className="text-sm font-semibold text-on-surface">{cat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-on-surface">{formatCOP(cat.total)}</span>
                    </div>
                    <div className="ml-[42px]">
                      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-medium">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payer breakdown */}
          {payers.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-tertiary text-xl">group</span>
                <span className="font-headline font-bold text-sm text-on-surface">Por Pagador</span>
              </div>
              <div className="space-y-3">
                {payers.map((payer) => {
                  const pct = total > 0 ? (payer.total / total) * 100 : 0
                  return (
                    <div key={payer.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-tertiary-container/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-tertiary-container text-base">person</span>
                          </div>
                          <span className="text-sm font-semibold text-on-surface">{payer.name}</span>
                        </div>
                        <span className="text-sm font-bold text-on-surface">{formatCOP(payer.total)}</span>
                      </div>
                      <div className="ml-[42px]">
                        <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full bg-tertiary rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-on-surface-variant font-medium">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
