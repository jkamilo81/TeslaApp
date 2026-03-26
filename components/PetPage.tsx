'use client'
import { useState, useCallback } from 'react'
import RecordCard from './RecordCard'
import Modal from './Modal'
import CostInput from './CostInput'
import PaymentSplit from './PaymentSplit'
import FileUpload from './FileUpload'
import { supabase } from '@/lib/supabase'
import { formatCOP } from '@/lib/format'
import { buildStoragePath, deleteFile } from '@/lib/storage'

type Section = 'insurance' | 'vaccines' | 'parasite_control' | 'service_certificates' | 'vet_appointments' | 'lab_exams' | 'food_purchases'

interface PetPageProps {
  petId: string
  petName: string
  petType: 'dog' | 'cat'
  insurance: any[]
  vaccines: any[]
  parasites: any[]
  certs: any[]
  appointments: any[]
  labExams?: any[]
  foodPurchases?: any[]
}

const SECTIONS: { key: Section; label: string; icon: string; showFor?: 'dog' | 'cat' }[] = [
  { key: 'insurance', label: 'Seguro', icon: 'shield' },
  { key: 'vaccines', label: 'Vacunas', icon: 'vaccines' },
  { key: 'parasite_control', label: 'Parásitos', icon: 'bug_report' },
  { key: 'service_certificates', label: 'Certificado', icon: 'workspace_premium', showFor: 'dog' },
  { key: 'vet_appointments', label: 'Citas', icon: 'medical_services' },
  { key: 'lab_exams', label: 'Exámenes', icon: 'biotech' },
  { key: 'food_purchases', label: 'Alimento', icon: 'pet_supplies' },
]

export default function PetPage({ petId, petName, petType, insurance, vaccines, parasites, certs, appointments, labExams, foodPurchases }: PetPageProps) {
  const [activeSection, setActiveSection] = useState<Section>('insurance')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [costCop, setCostCop] = useState<number | null>(null)
  const [distributions, setDistributions] = useState<{ payer_id: string; amount: number }[]>([])
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  const handleDistributionsChange = useCallback((d: { payer_id: string; amount: number }[]) => {
    setDistributions(d)
  }, [])

  const sections = SECTIONS.filter((s) => !s.showFor || s.showFor === petType)

  const dataMap: Record<Section, any[]> = {
    insurance,
    vaccines,
    parasite_control: parasites,
    service_certificates: certs,
    vet_appointments: appointments,
    lab_exams: labExams ?? [],
    food_purchases: foodPurchases ?? [],
  }

  function openAdd() {
    setEditItem(null)
    setForm({})
    setCostCop(activeSection === 'food_purchases' ? 0 : null)
    setDistributions([])
    setFileUrl(null)
    setShowModal(true)
  }

  async function openEdit(item: any) {
    setEditItem(item)
    setForm(item)
    setCostCop(item.cost_cop != null ? Number(item.cost_cop) : null)
    setFileUrl(item.file_url ?? null)
    // Load existing distributions for this record
    const { data: dists } = await supabase
      .from('payment_distributions')
      .select('payer_id, amount')
      .eq('record_table', activeSection)
      .eq('record_id', item.id)
    setDistributions(dists?.map(d => ({ payer_id: d.payer_id as string, amount: Number(d.amount) })) ?? [])
    setShowModal(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este registro?')) return
    // Delete associated file from Storage if present
    const record = dataMap[activeSection].find((item) => item.id === id)
    if (record?.file_url) {
      try {
        await deleteFile(supabase, record.file_url)
      } catch {
        // Ignore delete errors
      }
    }
    // Delete associated payment distributions first
    await supabase
      .from('payment_distributions')
      .delete()
      .eq('record_table', activeSection)
      .eq('record_id', id)
    await supabase.from(activeSection).delete().eq('id', id)
    window.location.reload()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload: Record<string, any> = { ...form, pet_id: petId }

    // Include cost_cop in payload
    if (activeSection === 'food_purchases') {
      payload.cost_cop = costCop ?? 0
    } else {
      payload.cost_cop = costCop
    }

    // Include file_url for sections that support it
    if (activeSection === 'lab_exams' || activeSection === 'vaccines') {
      payload.file_url = fileUrl
    }

    let recordId: string | null = null

    if (editItem) {
      await supabase.from(activeSection).update(payload as any).eq('id', editItem.id)
      recordId = editItem.id
    } else {
      const { data } = await supabase.from(activeSection).insert(payload as any).select('id').single()
      recordId = data?.id ?? null
    }

    // Save payment distributions if there's a cost and distributions
    if (recordId && costCop != null && costCop > 0 && distributions.length > 0) {
      // Delete old distributions first
      await supabase
        .from('payment_distributions')
        .delete()
        .eq('record_table', activeSection)
        .eq('record_id', recordId)

      // Insert new distributions
      const distRows = distributions
        .filter(d => d.amount > 0)
        .map(d => ({
          record_table: activeSection,
          record_id: recordId,
          payer_id: d.payer_id,
          amount: d.amount,
        }))
      if (distRows.length > 0) {
        await supabase.from('payment_distributions').insert(distRows)
      }
    } else if (recordId && (costCop == null || costCop === 0)) {
      // If cost was removed, clean up any existing distributions
      await supabase
        .from('payment_distributions')
        .delete()
        .eq('record_table', activeSection)
        .eq('record_id', recordId)
    }

    setLoading(false)
    setShowModal(false)
    window.location.reload()
  }

  const fields = getFields(activeSection)

  return (
    <main className="pt-24 px-6 max-w-2xl mx-auto">
      {/* Editorial Header */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-primary font-bold text-sm tracking-wider uppercase">Registros de Salud</span>
            <h2 className="text-4xl font-headline font-extrabold text-on-surface mt-1 tracking-tight">
              Cuidado de {petName}
            </h2>
          </div>
          <div className="bg-secondary-container px-4 py-2 rounded-full flex items-center gap-2">
            <span
              className="material-symbols-outlined text-on-secondary-container text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {petType === 'dog' ? 'pets' : 'cruelty_free'}
            </span>
            <span className="text-on-secondary-container font-label text-sm font-semibold">
              {petType === 'dog' ? 'Perro' : 'Gato'}
            </span>
          </div>
        </div>
        <p className="text-on-surface-variant text-lg">Historial detallado y próximas citas de cuidado.</p>
      </section>

      {/* Section tabs — river stone chips */}
      <div className="flex flex-wrap gap-2 pb-4">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${
              activeSection === s.key
                ? 'signature-gradient text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Records list */}
      <div className="space-y-4 mb-8 mt-4">
        {dataMap[activeSection].length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant mb-3 block">
              {sections.find((s) => s.key === activeSection)?.icon}
            </span>
            <p className="text-on-surface-variant font-medium">Sin registros aún</p>
            <p className="text-outline text-sm mt-1">Toca abajo para agregar el primero</p>
          </div>
        ) : (
          dataMap[activeSection].map((item) => (
            <RecordCard
              key={item.id}
              title={getTitle(activeSection, item)}
              subtitle={getSubtitle(activeSection, item)}
              expiryDate={getExpiry(activeSection, item)}
              meta={getMeta(activeSection, item)}
              onEdit={() => openEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          ))
        )}
      </div>

      {/* Add button — signature gradient */}
      <button
        onClick={openAdd}
        className="w-full signature-gradient text-on-primary font-bold py-4 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all ambient-shadow-lg"
      >
        <span className="material-symbols-outlined text-lg">add</span>
        Agregar {sections.find((s) => s.key === activeSection)?.label}
      </button>

      {showModal && (
        <Modal
          title={`${editItem ? 'Editar' : 'Agregar'} ${sections.find((s) => s.key === activeSection)?.label}`}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  {f.label}
                </label>
                <input
                  type={f.type || 'text'}
                  value={form[f.key] || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  required={f.required}
                  className="w-full bg-surface-container rounded-sm px-4 py-3 text-on-surface text-sm font-body focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                />
              </div>
            ))}

            {/* FileUpload for lab_exams and vaccines */}
            {activeSection === 'lab_exams' && (
              <FileUpload
                currentFileUrl={fileUrl}
                accept="image/*,.pdf"
                maxSizeMB={10}
                storagePath={buildStoragePath(petId, 'lab_exams', editItem?.id ?? 'new', '')}
                onUpload={(url) => setFileUrl(url)}
                onRemove={() => setFileUrl(null)}
              />
            )}
            {activeSection === 'vaccines' && (
              <FileUpload
                currentFileUrl={fileUrl}
                accept="image/jpeg,image/png"
                maxSizeMB={10}
                storagePath={buildStoragePath(petId, 'vaccines', editItem?.id ?? 'new', '')}
                onUpload={(url) => setFileUrl(url)}
                onRemove={() => setFileUrl(null)}
              />
            )}

            {/* Cost Input */}
            {activeSection === 'food_purchases' ? (
              <CostInput value={costCop ?? 0} onChange={(v) => setCostCop(v ?? 0)} />
            ) : (
              <CostInput value={costCop} onChange={setCostCop} />
            )}

            {/* Payment Split — shown when cost > 0 */}
            {costCop != null && costCop > 0 && (
              <PaymentSplit
                totalCost={costCop}
                distributions={distributions}
                onChange={handleDistributionsChange}
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full signature-gradient text-on-primary font-bold py-3.5 rounded-full mt-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </Modal>
      )}
    </main>
  )
}


function getFields(section: Section): { key: string; label: string; type?: string; required?: boolean }[] {
  switch (section) {
    case 'insurance':
      return [
        { key: 'provider', label: 'Proveedor', required: true },
        { key: 'policy_number', label: 'Número de Póliza' },
        { key: 'start_date', label: 'Fecha de Inicio', type: 'date', required: true },
        { key: 'expiry_date', label: 'Fecha de Vencimiento', type: 'date', required: true },
        { key: 'notes', label: 'Notas' },
      ]
    case 'vaccines':
      return [
        { key: 'name', label: 'Nombre de Vacuna', required: true },
        { key: 'administered_date', label: 'Fecha de Aplicación', type: 'date', required: true },
        { key: 'next_due_date', label: 'Próxima Fecha', type: 'date' },
        { key: 'vet_name', label: 'Veterinario' },
        { key: 'notes', label: 'Notas' },
      ]
    case 'parasite_control':
      return [
        { key: 'type', label: 'Tipo (pulga/garrapata/gusano/combinado)', required: true },
        { key: 'product_name', label: 'Nombre del Producto', required: true },
        { key: 'administered_date', label: 'Fecha de Aplicación', type: 'date', required: true },
        { key: 'next_due_date', label: 'Próxima Fecha', type: 'date' },
        { key: 'notes', label: 'Notas' },
      ]
    case 'service_certificates':
      return [
        { key: 'certificate_type', label: 'Tipo de Certificado', required: true },
        { key: 'issued_date', label: 'Fecha de Emisión', type: 'date', required: true },
        { key: 'expiry_date', label: 'Fecha de Vencimiento', type: 'date' },
        { key: 'issuing_authority', label: 'Autoridad Emisora' },
        { key: 'certificate_number', label: 'Número de Certificado' },
        { key: 'notes', label: 'Notas' },
      ]
    case 'vet_appointments':
      return [
        { key: 'reason', label: 'Motivo', required: true },
        { key: 'appointment_date', label: 'Fecha y Hora', type: 'datetime-local', required: true },
        { key: 'vet_name', label: 'Veterinario' },
        { key: 'clinic_name', label: 'Clínica' },
        { key: 'notes', label: 'Notas' },
      ]
    case 'lab_exams':
      return [
        { key: 'name', label: 'Nombre del Examen', required: true },
        { key: 'exam_date', label: 'Fecha del Examen', type: 'date', required: true },
        { key: 'vet_name', label: 'Veterinario' },
        { key: 'notes', label: 'Notas' },
      ]
    case 'food_purchases':
      return [
        { key: 'brand', label: 'Marca', required: true },
        { key: 'quantity', label: 'Cantidad', type: 'number', required: true },
        { key: 'quantity_unit', label: 'Unidad (kg o unidades)', required: true },
        { key: 'purchase_date', label: 'Fecha de Compra', type: 'date', required: true },
        { key: 'notes', label: 'Notas' },
      ]
  }
}

function getTitle(section: Section, item: any): string {
  switch (section) {
    case 'insurance': return item.provider
    case 'vaccines': return item.name
    case 'parasite_control': return item.product_name
    case 'service_certificates': return item.certificate_type
    case 'vet_appointments': return item.reason
    case 'lab_exams': return item.name
    case 'food_purchases': return item.brand
  }
}

function getSubtitle(section: Section, item: any): string | null {
  switch (section) {
    case 'insurance': return item.policy_number ? `Póliza: ${item.policy_number}` : null
    case 'vaccines': return item.vet_name ? `Vet: ${item.vet_name}` : null
    case 'parasite_control': return item.type
    case 'service_certificates': return item.issuing_authority ?? null
    case 'vet_appointments': return item.clinic_name ?? null
    case 'lab_exams': return item.vet_name ? `Vet: ${item.vet_name}` : null
    case 'food_purchases': return `${item.quantity} ${item.quantity_unit}`
  }
}

function getExpiry(section: Section, item: any): string | null {
  switch (section) {
    case 'insurance': return item.expiry_date
    case 'vaccines': return item.next_due_date
    case 'parasite_control': return item.next_due_date
    case 'service_certificates': return item.expiry_date
    case 'vet_appointments': return item.appointment_date
    case 'lab_exams': return item.exam_date
    case 'food_purchases': return item.purchase_date
  }
}

function getMeta(section: Section, item: any): string | null {
  const parts: string[] = []

  switch (section) {
    case 'vaccines':
      if (item.administered_date) parts.push(`Aplicada: ${item.administered_date}`)
      if (item.file_url) parts.push('📎 Foto adjunta')
      break
    case 'parasite_control':
      if (item.administered_date) parts.push(`Aplicado: ${item.administered_date}`)
      break
    case 'service_certificates':
      if (item.certificate_number) parts.push(`#${item.certificate_number}`)
      break
    case 'lab_exams':
      if (item.exam_date) parts.push(`Fecha: ${item.exam_date}`)
      if (item.file_url) parts.push('📎 Archivo adjunto')
      break
    case 'food_purchases':
      if (item.purchase_date) parts.push(`Compra: ${item.purchase_date}`)
      break
  }

  if (item.cost_cop != null) {
    parts.push(formatCOP(Number(item.cost_cop)))
  }

  return parts.length > 0 ? parts.join(' · ') : null
}
