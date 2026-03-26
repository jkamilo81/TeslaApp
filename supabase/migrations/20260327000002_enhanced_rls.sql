-- Enhanced RLS Policies for new tables
-- Follows the same pattern as 20260326000002_auth_and_rls.sql

-- ============================================================
-- ENABLE RLS
-- ============================================================

alter table lab_exams enable row level security;
alter table food_purchases enable row level security;
alter table payers enable row level security;
alter table payment_distributions enable row level security;
alter table notification_log enable row level security;

-- ============================================================
-- LAB EXAMS: access through pet ownership
-- ============================================================

create policy "Users can view lab_exams for their pets"
  on lab_exams for select
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can insert lab_exams for their pets"
  on lab_exams for insert
  to authenticated
  with check (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can update lab_exams for their pets"
  on lab_exams for update
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()))
  with check (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can delete lab_exams for their pets"
  on lab_exams for delete
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()));

-- ============================================================
-- FOOD PURCHASES: access through pet ownership
-- ============================================================

create policy "Users can view food_purchases for their pets"
  on food_purchases for select
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can insert food_purchases for their pets"
  on food_purchases for insert
  to authenticated
  with check (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can update food_purchases for their pets"
  on food_purchases for update
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()))
  with check (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can delete food_purchases for their pets"
  on food_purchases for delete
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()));

-- ============================================================
-- PAYERS: read-only for all authenticated users (shared table)
-- ============================================================

create policy "Authenticated users can view payers"
  on payers for select
  to authenticated
  using (true);

-- ============================================================
-- PAYMENT DISTRIBUTIONS: access via record ownership
-- The record_id must belong to a pet owned by the current user.
-- We check across all record tables that have pet_id.
-- ============================================================

create policy "Users can view payment_distributions for their records"
  on payment_distributions for select
  to authenticated
  using (
    record_id in (select id from lab_exams where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from food_purchases where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from insurance where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from vaccines where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from parasite_control where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from service_certificates where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from vet_appointments where pet_id in (select id from pets where user_id = auth.uid()))
  );

create policy "Users can insert payment_distributions for their records"
  on payment_distributions for insert
  to authenticated
  with check (
    record_id in (select id from lab_exams where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from food_purchases where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from insurance where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from vaccines where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from parasite_control where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from service_certificates where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from vet_appointments where pet_id in (select id from pets where user_id = auth.uid()))
  );

create policy "Users can update payment_distributions for their records"
  on payment_distributions for update
  to authenticated
  using (
    record_id in (select id from lab_exams where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from food_purchases where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from insurance where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from vaccines where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from parasite_control where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from service_certificates where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from vet_appointments where pet_id in (select id from pets where user_id = auth.uid()))
  )
  with check (
    record_id in (select id from lab_exams where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from food_purchases where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from insurance where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from vaccines where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from parasite_control where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from service_certificates where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from vet_appointments where pet_id in (select id from pets where user_id = auth.uid()))
  );

create policy "Users can delete payment_distributions for their records"
  on payment_distributions for delete
  to authenticated
  using (
    record_id in (select id from lab_exams where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from food_purchases where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from insurance where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from vaccines where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from parasite_control where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from service_certificates where pet_id in (select id from pets where user_id = auth.uid()))
    or record_id in (select id from vet_appointments where pet_id in (select id from pets where user_id = auth.uid()))
  );

-- ============================================================
-- NOTIFICATION LOG: service role only (no authenticated user access)
-- RLS is enabled but no policies for authenticated users.
-- Only the service role (used by the cron /api/reminders) bypasses RLS.
-- ============================================================

-- No policies created for notification_log.
-- The service role automatically bypasses RLS, so the cron job
-- using supabase-server.ts (service_role key) can read/write freely.
-- Authenticated users have no access to this table.
