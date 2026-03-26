import { getDaysUntil } from '@/lib/notifications'

function getBadgeStyle(days: number | null): { bg: string; text: string } {
  if (days === null) return { bg: 'bg-surface-container', text: 'text-outline' }
  if (days < 0) return { bg: 'bg-error-container/30', text: 'text-error' }
  if (days <= 30) return { bg: 'bg-tertiary-container/30', text: 'text-on-tertiary-container' }
  if (days <= 60) return { bg: 'bg-tertiary-fixed/20', text: 'text-tertiary' }
  return { bg: 'bg-secondary-container', text: 'text-on-secondary-container' }
}

function getLabel(days: number | null): string {
  if (days === null) return 'Sin fecha'
  if (days < 0) return `Venció hace ${Math.abs(days)}d`
  if (days === 0) return 'Vence hoy'
  return `${days}d restantes`
}

export default function StatusBadge({ date }: { date: string | null }) {
  const days = getDaysUntil(date)
  const style = getBadgeStyle(days)
  const label = getLabel(days)
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      {label}
    </span>
  )
}
