'use client'
import { ReactNode } from 'react'

export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-on-surface/30 p-4">
      <div className="bg-surface-container-lowest rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto ambient-shadow-lg">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-headline text-lg font-bold text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>
  )
}
