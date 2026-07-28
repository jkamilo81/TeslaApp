-- Medication tracking: general medications (antibiotics, chronic treatments,
-- supplements) beyond parasite control.
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text,
  frequency text,
  start_date date NOT NULL,
  end_date date,
  vet_name text,
  cost_cop numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Same family-scoped pattern as the other record tables
-- (see 20260329000002_fix_record_tables_rls.sql).
CREATE POLICY "Family members can view medications for their pets"
  ON medications FOR SELECT TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));

CREATE POLICY "Family members can insert medications for their pets"
  ON medications FOR INSERT TO authenticated
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));

CREATE POLICY "Family members can update medications for their pets"
  ON medications FOR UPDATE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()))
  WITH CHECK (pet_id IN (SELECT public.get_my_pet_ids()));

CREATE POLICY "Family members can delete medications for their pets"
  ON medications FOR DELETE TO authenticated
  USING (pet_id IN (SELECT public.get_my_pet_ids()));
