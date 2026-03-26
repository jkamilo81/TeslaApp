import StatusBadge from './StatusBadge'

interface RecordCardProps {
  title: string
  subtitle?: string | null
  expiryDate?: string | null
  meta?: string | null
  onEdit?: () => void
  onDelete?: () => void
}

export default function RecordCard({ title, subtitle, expiryDate, meta, onEdit, onDelete }: RecordCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 ambient-shadow flex items-start justify-between gap-4 transition-all duration-300 hover:translate-y-[-2px]">
      <div className="flex-1 min-w-0">
        <p className="font-headline font-bold text-on-surface truncate">{title}</p>
        {subtitle && <p className="text-sm text-on-surface-variant truncate mt-0.5">{subtitle}</p>}
        {meta && <p className="text-xs text-outline mt-1">{meta}</p>}
        {expiryDate !== undefined && (
          <div className="mt-3">
            <StatusBadge date={expiryDate ?? null} />
          </div>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary hover:bg-primary-container/40 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-full bg-error-container/15 flex items-center justify-center text-error hover:bg-error-container/30 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        )}
      </div>
    </div>
  )
}
