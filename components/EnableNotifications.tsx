'use client'
import { useState } from 'react'
import { requestNotificationPermission, subscribeToPush } from '@/lib/notifications'

export default function EnableNotifications() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'denied'>('idle')

  async function enable() {
    setStatus('loading')
    const granted = await requestNotificationPermission()
    if (!granted) { setStatus('denied'); return }
    const sub = await subscribeToPush()
    if (sub) {
      const json = sub.toJSON()
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      })
      setStatus('done')
    }
  }

  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-sm font-semibold">
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
        Recordatorios activados
      </span>
    )
  }

  if (status === 'denied') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-error-container/20 text-error px-4 py-2 rounded-full text-sm font-semibold">
        Notificaciones bloqueadas en el navegador
      </span>
    )
  }

  return (
    <button
      onClick={enable}
      disabled={status === 'loading'}
      className="inline-flex items-center gap-1.5 bg-surface-container-highest text-on-surface px-4 py-2 rounded-full text-sm font-semibold hover:bg-surface-container-high active:scale-95 transition-all disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-sm">notifications</span>
      {status === 'loading' ? 'Activando...' : 'Activar recordatorios'}
    </button>
  )
}
