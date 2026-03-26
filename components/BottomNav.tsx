'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', icon: 'home', label: 'Inicio' },
  { href: '/tesla', icon: 'monitor_heart', label: 'Tesla' },
  { href: '/figo', icon: 'cruelty_free', label: 'Figo' },
  { href: '/gastos', icon: 'payments', label: 'Gastos' },
  { href: '/historial', icon: 'clinical_notes', label: 'Historial' },
  { href: '/familia', icon: 'group', label: 'Familia' },
]

export default function BottomNav() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 glass-header rounded-t-[32px] md:hidden">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
              active
                ? 'bg-primary-container/30 text-primary rounded-full px-5 py-1.5'
                : 'text-outline hover:text-primary'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-label text-[11px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
