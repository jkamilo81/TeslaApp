'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { petSlug } from '@/lib/pets'

const STATIC_ITEMS = {
  home: { href: '/', icon: 'home', label: 'Inicio' },
  rest: [
    { href: '/gastos', icon: 'payments', label: 'Gastos' },
    { href: '/historial', icon: 'clinical_notes', label: 'Historial' },
    { href: '/familia', icon: 'group', label: 'Familia' },
  ],
}

export default function BottomNav() {
  const pathname = usePathname()
  const [pets, setPets] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    let cancelled = false
    async function loadPets() {
      const { data } = await supabase
        .from('pets')
        .select('id, name')
        .is('archived_at', null)
        .order('name')
      if (!cancelled) setPets(data ?? [])
    }
    loadPets()
    return () => {
      cancelled = true
    }
  }, [])

  const NAV_ITEMS = [
    STATIC_ITEMS.home,
    ...pets.map((pet) => ({ href: `/${petSlug(pet.name)}`, icon: 'pets', label: pet.name })),
    ...STATIC_ITEMS.rest,
  ]

  // No app chrome on the login screen or on printable documents
  if (pathname === '/login' || pathname.startsWith('/certificado')) return null

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
