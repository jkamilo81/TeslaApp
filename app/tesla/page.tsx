import { createServerSupabase } from '@/lib/supabase-server'
import PetPage from '@/components/PetPage'

export const dynamic = 'force-dynamic'

async function getTeslaData() {
  const supabase = await createServerSupabase()
  const { data: pet } = await supabase.from('pets').select('id').eq('name', 'Tesla').single()
  if (!pet) return null
  const [{ data: insurance }, { data: vaccines }, { data: parasites }, { data: certs }, { data: appointments }, { data: labExams }, { data: foodPurchases }] =
    await Promise.all([
      supabase.from('insurance').select('*').eq('pet_id', pet.id).order('expiry_date'),
      supabase.from('vaccines').select('*').eq('pet_id', pet.id).order('next_due_date'),
      supabase.from('parasite_control').select('*').eq('pet_id', pet.id).order('next_due_date'),
      supabase.from('service_certificates').select('*').eq('pet_id', pet.id).order('expiry_date'),
      supabase.from('vet_appointments').select('*').eq('pet_id', pet.id).order('appointment_date'),
      supabase.from('lab_exams').select('*').eq('pet_id', pet.id).order('exam_date', { ascending: false }),
      supabase.from('food_purchases').select('*').eq('pet_id', pet.id).order('purchase_date', { ascending: false }),
    ])
  return { petId: pet.id, insurance, vaccines, parasites, certs, appointments, labExams, foodPurchases }
}

export default async function TeslaPage() {
  const data = await getTeslaData()
  if (!data) return <p className="p-8 text-red-400">Tesla no encontrado en la base de datos.</p>
  return (
    <PetPage
      petId={data.petId}
      petName="Tesla"
      petType="dog"
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
