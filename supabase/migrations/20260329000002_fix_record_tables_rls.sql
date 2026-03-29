-- Fix RLS on all record tables to use get_my_family_ids() function
-- instead of direct subquery on family_members (which causes infinite recursion)

-- Helper: get pet IDs for the current user's family
CREATE OR REPLACE FUNCTION public.get_my_pet_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM pets WHERE family_id IN (SELECT public.get_my_family_ids());
$$;

-- ============================================================
-- insurance
-- ============================================================
DROP POLICY IF EXISTS "Family members can view insurance for their pets" ON insurance;
DROP POLICY IF EXISTS "Family members can insert insurance for their pets" ON insurance;
DROP POLICY IF EXISTS "Family members can update insurance for their pets" ON insurance;
DROP POLICY IF EXISTS "Family members can delete insurance for their pets" ON insurance;

CREATE POLICY "Family members can view insurance for their pets"
  ON insurance FOR SELECT TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can insert insurance for their pets"
  ON insurance FOR INSERT TO authenticated
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can update insurance for their pets"
  ON insurance FOR UPDATE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()))
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can delete insurance for their pets"
  ON insurance FOR DELETE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));

-- ============================================================
-- vaccines
-- ============================================================
DROP POLICY IF EXISTS "Family members can view vaccines for their pets" ON vaccines;
DROP POLICY IF EXISTS "Family members can insert vaccines for their pets" ON vaccines;
DROP POLICY IF EXISTS "Family members can update vaccines for their pets" ON vaccines;
DROP POLICY IF EXISTS "Family members can delete vaccines for their pets" ON vaccines;

CREATE POLICY "Family members can view vaccines for their pets"
  ON vaccines FOR SELECT TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can insert vaccines for their pets"
  ON vaccines FOR INSERT TO authenticated
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can update vaccines for their pets"
  ON vaccines FOR UPDATE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()))
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can delete vaccines for their pets"
  ON vaccines FOR DELETE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));

-- ============================================================
-- parasite_control
-- ============================================================
DROP POLICY IF EXISTS "Family members can view parasite_control for their pets" ON parasite_control;
DROP POLICY IF EXISTS "Family members can insert parasite_control for their pets" ON parasite_control;
DROP POLICY IF EXISTS "Family members can update parasite_control for their pets" ON parasite_control;
DROP POLICY IF EXISTS "Family members can delete parasite_control for their pets" ON parasite_control;

CREATE POLICY "Family members can view parasite_control for their pets"
  ON parasite_control FOR SELECT TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can insert parasite_control for their pets"
  ON parasite_control FOR INSERT TO authenticated
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can update parasite_control for their pets"
  ON parasite_control FOR UPDATE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()))
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can delete parasite_control for their pets"
  ON parasite_control FOR DELETE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));

-- ============================================================
-- service_certificates
-- ============================================================
DROP POLICY IF EXISTS "Family members can view service_certificates for their pets" ON service_certificates;
DROP POLICY IF EXISTS "Family members can insert service_certificates for their pets" ON service_certificates;
DROP POLICY IF EXISTS "Family members can update service_certificates for their pets" ON service_certificates;
DROP POLICY IF EXISTS "Family members can delete service_certificates for their pets" ON service_certificates;

CREATE POLICY "Family members can view service_certificates for their pets"
  ON service_certificates FOR SELECT TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can insert service_certificates for their pets"
  ON service_certificates FOR INSERT TO authenticated
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can update service_certificates for their pets"
  ON service_certificates FOR UPDATE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()))
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can delete service_certificates for their pets"
  ON service_certificates FOR DELETE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));

-- ============================================================
-- vet_appointments
-- ============================================================
DROP POLICY IF EXISTS "Family members can view vet_appointments for their pets" ON vet_appointments;
DROP POLICY IF EXISTS "Family members can insert vet_appointments for their pets" ON vet_appointments;
DROP POLICY IF EXISTS "Family members can update vet_appointments for their pets" ON vet_appointments;
DROP POLICY IF EXISTS "Family members can delete vet_appointments for their pets" ON vet_appointments;

CREATE POLICY "Family members can view vet_appointments for their pets"
  ON vet_appointments FOR SELECT TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can insert vet_appointments for their pets"
  ON vet_appointments FOR INSERT TO authenticated
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can update vet_appointments for their pets"
  ON vet_appointments FOR UPDATE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()))
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can delete vet_appointments for their pets"
  ON vet_appointments FOR DELETE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));

-- ============================================================
-- lab_exams
-- ============================================================
DROP POLICY IF EXISTS "Family members can view lab_exams for their pets" ON lab_exams;
DROP POLICY IF EXISTS "Family members can insert lab_exams for their pets" ON lab_exams;
DROP POLICY IF EXISTS "Family members can update lab_exams for their pets" ON lab_exams;
DROP POLICY IF EXISTS "Family members can delete lab_exams for their pets" ON lab_exams;

CREATE POLICY "Family members can view lab_exams for their pets"
  ON lab_exams FOR SELECT TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can insert lab_exams for their pets"
  ON lab_exams FOR INSERT TO authenticated
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can update lab_exams for their pets"
  ON lab_exams FOR UPDATE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()))
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can delete lab_exams for their pets"
  ON lab_exams FOR DELETE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));

-- ============================================================
-- food_purchases
-- ============================================================
DROP POLICY IF EXISTS "Family members can view food_purchases for their pets" ON food_purchases;
DROP POLICY IF EXISTS "Family members can insert food_purchases for their pets" ON food_purchases;
DROP POLICY IF EXISTS "Family members can update food_purchases for their pets" ON food_purchases;
DROP POLICY IF EXISTS "Family members can delete food_purchases for their pets" ON food_purchases;

CREATE POLICY "Family members can view food_purchases for their pets"
  ON food_purchases FOR SELECT TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can insert food_purchases for their pets"
  ON food_purchases FOR INSERT TO authenticated
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can update food_purchases for their pets"
  ON food_purchases FOR UPDATE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()))
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));
CREATE POLICY "Family members can delete food_purchases for their pets"
  ON food_purchases FOR DELETE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));

-- ============================================================
-- payment_distributions (via record tables → pets → family)
-- ============================================================
DROP POLICY IF EXISTS "Family members can view payment_distributions for their records" ON payment_distributions;
DROP POLICY IF EXISTS "Family members can insert payment_distributions for their records" ON payment_distributions;
DROP POLICY IF EXISTS "Family members can update payment_distributions for their records" ON payment_distributions;
DROP POLICY IF EXISTS "Family members can delete payment_distributions for their records" ON payment_distributions;

CREATE POLICY "Family members can view payment_distributions for their records"
  ON payment_distributions FOR SELECT TO authenticated
  USING (
    record_id IN (SELECT id FROM insurance WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM vaccines WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM parasite_control WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM service_certificates WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM vet_appointments WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM lab_exams WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM food_purchases WHERE pet_id IN (SELECT public.get_my_pet_ids()))
  );

CREATE POLICY "Family members can insert payment_distributions for their records"
  ON payment_distributions FOR INSERT TO authenticated
  WITH CHECK (
    record_id IN (SELECT id FROM insurance WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM vaccines WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM parasite_control WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM service_certificates WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM vet_appointments WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM lab_exams WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM food_purchases WHERE pet_id IN (SELECT public.get_my_pet_ids()))
  );

CREATE POLICY "Family members can update payment_distributions for their records"
  ON payment_distributions FOR UPDATE TO authenticated
  USING (
    record_id IN (SELECT id FROM insurance WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM vaccines WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM parasite_control WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM service_certificates WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM vet_appointments WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM lab_exams WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM food_purchases WHERE pet_id IN (SELECT public.get_my_pet_ids()))
  )
  WITH CHECK (
    record_id IN (SELECT id FROM insurance WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM vaccines WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM parasite_control WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM service_certificates WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM vet_appointments WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM lab_exams WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM food_purchases WHERE pet_id IN (SELECT public.get_my_pet_ids()))
  );

CREATE POLICY "Family members can delete payment_distributions for their records"
  ON payment_distributions FOR DELETE TO authenticated
  USING (
    record_id IN (SELECT id FROM insurance WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM vaccines WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM parasite_control WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM service_certificates WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM vet_appointments WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM lab_exams WHERE pet_id IN (SELECT public.get_my_pet_ids()))
    OR record_id IN (SELECT id FROM food_purchases WHERE pet_id IN (SELECT public.get_my_pet_ids()))
  );

-- ============================================================
-- storage.objects (pet-documents bucket)
-- ============================================================
DROP POLICY IF EXISTS "Family members can view files for their pets" ON storage.objects;
DROP POLICY IF EXISTS "Family members can upload files for their pets" ON storage.objects;
DROP POLICY IF EXISTS "Family members can update files for their pets" ON storage.objects;
DROP POLICY IF EXISTS "Family members can delete files for their pets" ON storage.objects;

CREATE POLICY "Family members can view files for their pets"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'pet-documents' AND (storage.foldername(name))[1]::uuid IN (SELECT public.get_my_pet_ids()));

CREATE POLICY "Family members can upload files for their pets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pet-documents' AND (storage.foldername(name))[1]::uuid IN (SELECT public.get_my_pet_ids()));

CREATE POLICY "Family members can update files for their pets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'pet-documents' AND (storage.foldername(name))[1]::uuid IN (SELECT public.get_my_pet_ids()));

CREATE POLICY "Family members can delete files for their pets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'pet-documents' AND (storage.foldername(name))[1]::uuid IN (SELECT public.get_my_pet_ids()));
