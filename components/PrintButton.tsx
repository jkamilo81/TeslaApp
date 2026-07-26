'use client'

export default function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label text-sm font-semibold text-on-primary transition-transform active:scale-95"
    >
      <span className="material-symbols-outlined text-base" aria-hidden="true">
        print
      </span>
      {label}
    </button>
  )
}
