'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCOP } from '@/lib/format'

interface Payer {
  id: string
  name: string
  is_default: boolean | null
}

interface PaymentSplitProps {
  totalCost: number
  distributions: { payer_id: string; amount: number }[]
  onChange: (distributions: { payer_id: string; amount: number }[]) => void
}

export default function PaymentSplit({ totalCost, distributions, onChange }: PaymentSplitProps) {
  const [payers, setPayers] = useState<Payer[]>([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    async function fetchPayers() {
      const { data } = await supabase
        .from('payers')
        .select('id, name, is_default')
        .order('is_default', { ascending: false })
      if (data) {
        setPayers(data)
      }
      setLoading(false)
    }
    fetchPayers()
  }, [])

  // Assign 100% to default payer when payers load and no distributions exist yet
  useEffect(() => {
    if (payers.length === 0 || initialized) return

    if (distributions.length === 0) {
      const defaultPayer = payers.find(p => p.is_default) || payers[0]
      onChange([{ payer_id: defaultPayer.id, amount: totalCost }])
    }
    setInitialized(true)
  }, [payers, initialized, distributions.length, totalCost, onChange])

  // Update default payer amount when totalCost changes and only one payer has the full amount
  useEffect(() => {
    if (!initialized || distributions.length === 0) return

    // If there's exactly one distribution and it was the full previous amount, update it
    if (distributions.length === 1) {
      const current = distributions[0]
      if (current.amount !== totalCost) {
        onChange([{ payer_id: current.payer_id, amount: totalCost }])
      }
    }
  }, [totalCost, initialized, distributions, onChange])

  function handleAmountChange(payerId: string, value: string) {
    const num = value === '' ? 0 : Number(value)
    if (isNaN(num) || num < 0) return

    const existing = distributions.find(d => d.payer_id === payerId)
    let updated: { payer_id: string; amount: number }[]

    if (existing) {
      updated = distributions.map(d =>
        d.payer_id === payerId ? { ...d, amount: num } : d
      )
    } else {
      updated = [...distributions, { payer_id: payerId, amount: num }]
    }

    // Remove zero-amount entries (except if it's the only one)
    updated = updated.filter(d => d.amount > 0 || updated.length === 1)

    onChange(updated)
  }

  function getAmount(payerId: string): number {
    return distributions.find(d => d.payer_id === payerId)?.amount ?? 0
  }

  const sum = distributions.reduce((acc, d) => acc + d.amount, 0)
  const difference = totalCost - sum
  const hasError = Math.abs(difference) > 0.01

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-surface-container-high rounded w-1/3" />
        <div className="h-10 bg-surface-container-high rounded" />
      </div>
    )
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">group</span>
          Distribución de pago
        </span>
      </label>

      <div className="space-y-2">
        {payers.map(payer => (
          <div key={payer.id} className="flex items-center gap-3">
            <span className="text-sm text-on-surface font-body min-w-[80px] truncate">
              {payer.name}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={getAmount(payer.id) || ''}
              onChange={e => handleAmountChange(payer.id, e.target.value)}
              placeholder="$0"
              className="flex-1 bg-surface-container rounded-sm px-4 py-2.5 text-on-surface text-sm font-body focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
            />
            <span className="text-xs text-outline min-w-[80px] text-right">
              {formatCOP(getAmount(payer.id))}
            </span>
          </div>
        ))}
      </div>

      {hasError && (
        <p className="text-error text-xs mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">error</span>
          La distribución no coincide con el costo total. Diferencia: {formatCOP(Math.abs(difference))}
        </p>
      )}

      {!hasError && distributions.length > 0 && (
        <p className="text-secondary text-xs mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">check_circle</span>
          Distribución completa
        </p>
      )}
    </div>
  )
}
