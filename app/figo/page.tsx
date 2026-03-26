import { createServerSupabase } from '@/lib/supabase-server'
import PetPage from '@/components/PetPage'

export const dynamic = 'force-dynamic'

async function getFigoData() {
  const supabase = await createServerSupabase()
  const { data: pet } = await supabase.from('pets').select('id').eq('name', 'Figo').single()
  if (!pet) return null
  const [{ data: insurance }, { data: vaccines }, { data: parasites }, { data: appointments }, { data: labExams }, { data: foodPurchases }] =
    await Promise.all([
      supabase.from('insurance').select('*').eq('pet_id', pet.id).order('expiry_date'),
      supabase.from('vaccines').select('*').eq('pet_id', pet.id).order('next_due_date'),
      supabase.from('parasite_control').select('*').eq('pet_id', pet.id).order('next_due_date'),
      supabase.from('vet_appointments').select('*').eq('pet_id', pet.id).order('appointment_date'),
      supabase.from('lab_exams').select('*').eq('pet_id', pet.id).order('exam_date', { ascending: false }),
      supabase.from('food_purchases').select('*').eq('pet_id', pet.id).order('purchase_date', { ascending: false }),
    ])
  return { petId: pet.id, insurance, vaccines, parasites, appointments, labExams, foodPurchases }
}

export default async function FigoPage() {
  const data = await getFigoData()
  if (!data) return <p className="p-8 text-red-400">Figo no encontrado en la base de datos.</p>
  return (
    <PetPage
      petId={data.petId}
      petName="Figo"
      petType="cat"
      insurance={data.insurance ?? []}
      vaccines={data.vaccines ?? []}
      parasites={data.parasites ?? []}
      certs={[]}
      appointments={data.appointments ?? []}
      labExams={data.labExams ?? []}
      foodPurchases={data.foodPurchases ?? []}
    />
  )
}
