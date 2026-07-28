'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getSignedUrl } from '@/lib/storage'

interface Doc {
  id: string
  petName: string
  source: 'vaccine' | 'lab_exam'
  title: string
  date: string
  filePath: string
  fileName: string
  isPdf: boolean
}

const SOURCE_META = {
  vaccine: { label: 'Vacuna', icon: 'vaccines' },
  lab_exam: { label: 'Examen', icon: 'biotech' },
} as const

export default function DocumentosPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Doc['source'] | 'all'>('all')
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: vaccines }, { data: labExams }] = await Promise.all([
        supabase
          .from('vaccines')
          .select('id, name, administered_date, file_url, pets(name)')
          .not('file_url', 'is', null)
          .order('administered_date', { ascending: false }),
        supabase
          .from('lab_exams')
          .select('id, name, exam_date, file_url, pets(name)')
          .not('file_url', 'is', null)
          .order('exam_date', { ascending: false }),
      ])

      const toDoc = (
        r: { id: string; name: string; file_url: string | null; pets: { name: string } | null },
        source: Doc['source'],
        date: string
      ): Doc => ({
        id: `${source}-${r.id}`,
        petName: r.pets?.name ?? '',
        source,
        title: r.name,
        date,
        filePath: r.file_url!,
        fileName: r.file_url!.split('/').pop() ?? r.file_url!,
        isPdf: r.file_url!.toLowerCase().endsWith('.pdf'),
      })

      const all: Doc[] = [
        ...(vaccines ?? []).map((r) => toDoc(r, 'vaccine', r.administered_date)),
        ...(labExams ?? []).map((r) => toDoc(r, 'lab_exam', r.exam_date)),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setDocs(all)
      setLoading(false)
    }
    load()
  }, [])

  async function openDoc(doc: Doc) {
    setOpeningId(doc.id)
    setError(null)
    try {
      const url = await getSignedUrl(supabase, doc.filePath)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('No se pudo abrir el documento. Intenta de nuevo.')
    } finally {
      setOpeningId(null)
    }
  }

  const filtered = filter === 'all' ? docs : docs.filter((d) => d.source === filter)

  return (
    <main className="pt-24 px-6 max-w-2xl mx-auto pb-32">
      {/* Header */}
      <section className="mb-8">
        <span className="text-primary font-bold text-sm tracking-wider uppercase">Archivos</span>
        <h2 className="text-4xl font-headline font-extrabold text-on-surface mt-1 tracking-tight">
          Documentos
        </h2>
        <p className="text-on-surface-variant text-lg mt-1">
          Todos los archivos adjuntos de tus mascotas en un solo lugar.
        </p>
      </section>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 pb-4">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
            filter === 'all' ? 'signature-gradient text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Todos
        </button>
        {(Object.keys(SOURCE_META) as Doc['source'][]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
              filter === s ? 'signature-gradient text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{SOURCE_META[s].icon}</span>
            {SOURCE_META[s].label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-error text-sm mb-4 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-container-low rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-outline-variant mb-3 block">folder_open</span>
          <p className="text-on-surface-variant font-medium">Sin documentos aún</p>
          <p className="text-outline text-sm mt-1">
            Los archivos que adjuntes a vacunas y exámenes aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-surface-container-lowest rounded-xl p-4 ambient-shadow flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                  doc.isPdf ? 'bg-error-container/15' : 'bg-primary-container/20'
                }`}
              >
                <span className={`material-symbols-outlined text-2xl ${doc.isPdf ? 'text-error' : 'text-primary'}`}>
                  {doc.isPdf ? 'picture_as_pdf' : 'image'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary-container text-on-secondary-container">
                    {doc.petName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container text-on-surface-variant">
                    {SOURCE_META[doc.source].label}
                  </span>
                </div>
                <p className="font-headline font-bold text-on-surface truncate">{doc.title}</p>
                <p className="text-xs text-outline truncate">
                  {doc.fileName} · {new Date(doc.date + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => openDoc(doc)}
                disabled={openingId === doc.id}
                className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary hover:bg-primary-container/40 transition-colors shrink-0 disabled:opacity-50"
                title="Abrir documento"
              >
                <span className="material-symbols-outlined text-base">
                  {openingId === doc.id ? 'hourglass_empty' : 'open_in_new'}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
