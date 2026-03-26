'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/login') return null

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 glass-header">
      <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              pets
            </span>
          </div>
          <span className="font-headline font-extrabold tracking-tight text-xl text-primary">
            TeslaApp
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button className="text-on-surface-variant hover:text-primary transition-colors active:scale-95">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={handleSignOut}
            className="text-on-surface-variant hover:text-error transition-colors active:scale-95"
            title="Sign out"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
