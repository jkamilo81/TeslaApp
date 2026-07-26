import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import PetPage from '@/components/PetPage'
import { petSlug } from '@/lib/pets'

export const dynamic = 'force-dynamic'

async function getPetData(slug: string) {
  const supabase = await createServerSupabase()

  // Resolve the slug against the family's active pets. RLS already limits this
  // to the caller's family, and archived pets have no profile page.
  const { data: pets } = await supabase
    .from('pets')
    .select('id, name, type')
    .is('archived_at', null)

  const pet = pets?.find((p) => petSlug(p.name) === slug)
  if (!pet) return null

  const [
    { data: insurance },
    { data: vaccines },
    { data: parasites },
    { data: certs },
    { data: appointments },
    { data: labExams },
    { data: foodPurchases },
  ] = await Promise.all([
    supabase.from('insurance').select('*').eq('pet_id', pet.id).order('expiry_date'),
    supabase.from('vaccines').select('*').eq('pet_id', pet.id).order('next_due_date'),
    supabase.from('parasite_control').select('*').eq('pet_id', pet.id).order('next_due_date'),
    supabase.from('service_certificates').select('*').eq('pet_id', pet.id).order('expiry_date'),
    supabase.from('vet_appointments').select('*').eq('pet_id', pet.id).order('appointment_date'),
    supabase.from('lab_exams').select('*').eq('pet_id', pet.id).order('exam_date', { ascending: false }),
    supabase.from('food_purchases').select('*').eq('pet_id', pet.id).order('purchase_date', { ascending: false }),
  ])

  return { pet, insurance, vaccines, parasites, certs, appointments, labExams, foodPurchases }
}

export async function generateMetadata({ params }: { params: Promise<{ pet: string }> }) {
  const { pet: slug } = await params
  const data = await getPetData(slug)
  return { title: data ? data.pet.name : 'Mascota no encontrada' }
}

export default async function Page({ params }: { params: Promise<{ pet: string }> }) {
  const { pet: slug } = await params
  const data = await getPetData(slug)
  if (!data) notFound()

  return (
    <PetPage
      petId={data.pet.id}
      petName={data.pet.name}
      petType={data.pet.type as 'dog' | 'cat'}
      insurance={data.insurance ?? []}
      vaccines={data.vaccines ?? []}
      parasites={data.parasites ?? []}
      certs={data.certs ?? []}
      appointments={data.appointments ?? []}
      labExams={data.labExams ?? []}
      foodPurchases={data.foodPurchases ?? []}
    />
  )
}
