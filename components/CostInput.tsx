'use client'
import { useState } from 'react'
import { formatCOP } from '@/lib/format'

interface CostInputProps {
  value: number | null
  onChange: (value: number | null) => void
}

export default function CostInput({ value, onChange }: CostInputProps) {
  const [focused, setFocused] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayValue = focused
    ? (value !== null ? String(value) : '')
    : (value !== null ? formatCOP(value) : '')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      setError(null)
      onChange(null)
      return
    }
    const num = Number(raw)
    if (isNaN(num)) return
    if (num < 0) {
      setError('El costo debe ser un valor positivo o cero.')
      return
    }
    setError(null)
    onChange(num)
  }

  function handleFocus() {
    setFocused(true)
  }

  function handleBlur() {
    setFocused(false)
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">payments</span>
          Costo (COP)
        </span>
      </label>
      <input
        type={focused ? 'number' : 'text'}
        inputMode="numeric"
        min="0"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="$0"
        className="w-full bg-surface-container rounded-sm px-4 py-3 text-on-surface text-sm font-body focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
      />
      {error && (
        <p className="text-error text-xs mt-1.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">error</span>
          {error}
        </p>
      )}
    </div>
  )
}
