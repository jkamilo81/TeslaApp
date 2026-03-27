'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [signupDone, setSignupDone] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      // Ensure family is set up for this user
      await fetch('/api/family/setup', { method: 'POST' })
      router.push('/')
      router.refresh()
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setSignupDone(true)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
            <span
              className="material-symbols-outlined text-on-primary-container text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              pets
            </span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            TeslaApp
          </h1>
          <p className="text-on-surface-variant mt-1">
            {mode === 'login' ? 'Bienvenido de vuelta, Guardián.' : 'Únete a la familia.'}
          </p>
        </div>

        {signupDone ? (
          <div className="bg-secondary-container rounded-xl p-6 text-center">
            <span
              className="material-symbols-outlined text-on-secondary-container text-3xl mb-2 block"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              mark_email_read
            </span>
            <p className="font-headline font-bold text-on-secondary-container">Revisa tu correo</p>
            <p className="text-sm text-on-secondary-container/80 mt-1">
              Te enviamos un enlace de confirmación. Haz clic para activar tu cuenta.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-surface-container rounded-sm px-4 py-3 text-on-surface text-sm font-body focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                placeholder="tu@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
                className="w-full bg-surface-container rounded-sm px-4 py-3 text-on-surface text-sm font-body focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-error-container/20 text-error rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full signature-gradient text-on-primary font-bold py-3.5 rounded-full transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Un momento...' : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>

            <p className="text-center text-sm text-on-surface-variant">
              {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
                className="text-primary font-semibold hover:underline"
              >
                {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
