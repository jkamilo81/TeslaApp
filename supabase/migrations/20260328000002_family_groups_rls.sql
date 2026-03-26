-- Family Groups RLS Migration
-- Replaces all user_id-based RLS policies with family_id-based policies.
-- Uses DROP POLICY IF EXISTS for idempotency.

-- ============================================================
-- RE-ENABLE RLS (disabled by 20260326000003_disable_rls_temp.sql)
-- ============================================================

alter table pets enable row level security;
alter table insurance enable row level security;
alter table vaccines enable row level security;
alter table parasite_control enable row level security;
alter table service_certificates enable row level security;
alter table vet_appointments enable row level security;
alter table push_subscriptions enable row level security;

-- ============================================================
-- ENABLE RLS ON NEW TABLES
-- ============================================================

alter table families enable row level security;
alter table family_members enable row level security;
alter table family_invitations enable row level security;

-- ============================================================
-- DROP OLD POLICIES: pets
-- ============================================================

drop policy if exists "Users can view their own pets" on pets;
drop policy if exists "Users can insert their own pets" on pets;
drop policy if exists "Users can update their own pets" on pets;
drop policy if exists "Users can delete their own pets" on pets;

-- ============================================================
-- DROP OLD POLICIES: insurance
-- ============================================================

drop policy if exists "Users can view insurance for their pets" on insurance;
drop policy if exists "Users can insert insurance for their pets" on insurance;
drop policy if exists "Users can update insurance for their pets" on insurance;
drop policy if exists "Users can delete insurance for their pets" on insurance;

-- ============================================================
-- DROP OLD POLICIES: vaccines
-- ============================================================

drop policy if exists "Users can view vaccines for their pets" on vaccines;
drop policy if exists "Users can insert vaccines for their pets" on vaccines;
drop policy if exists "Users can update vaccines for their pets" on vaccines;
drop policy if exists "Users can delete vaccines for their pets" on vaccines;

-- ============================================================
-- DROP OLD POLICIES: parasite_control
-- ============================================================

drop policy if exists "Users can view parasite_control for their pets" on parasite_control;
drop policy if exists "Users can insert parasite_control for their pets" on parasite_control;
drop policy if exists "Users can update parasite_control for their pets" on parasite_control;
drop policy if exists "Users can delete parasite_control for their pets" on parasite_control;

-- ============================================================
-- DROP OLD POLICIES: service_certificates
-- ============================================================

drop policy if exists "Users can view service_certificates for their pets" on service_certificates;
drop policy if exists "Users can insert service_certificates for their pets" on service_certificates;
drop policy if exists "Users can update service_certificates for their pets" on service_certificates;
drop policy if exists "Users can delete service_certificates for their pets" on service_certificates;

-- ============================================================
-- DROP OLD POLICIES: vet_appointments
-- ============================================================

drop policy if exists "Users can view vet_appointments for their pets" on vet_appointments;
drop policy if exists "Users can insert vet_appointments for their pets" on vet_appointments;
drop policy if exists "Users can update vet_appointments for their pets" on vet_appointments;
drop policy if exists "Users can delete vet_appointments for their pets" on vet_appointments;

-- ============================================================
-- DROP OLD POLICIES: lab_exams
-- ============================================================

drop policy if exists "Users can view lab_exams for their pets" on lab_exams;
drop policy if exists "Users can insert lab_exams for their pets" on lab_exams;
drop policy if exists "Users can update lab_exams for their pets" on lab_exams;
drop policy if exists "Users can delete lab_exams for their pets" on lab_exams;

-- ============================================================
-- DROP OLD POLICIES: food_purchases
-- ============================================================

drop policy if exists "Users can view food_purchases for their pets" on food_purchases;
drop policy if exists "Users can insert food_purchases for their pets" on food_purchases;
drop policy if exists "Users can update food_purchases for their pets" on food_purchases;
drop policy if exists "Users can delete food_purchases for their pets" on food_purchases;

-- ============================================================
-- DROP OLD POLICIES: payment_distributions
-- ============================================================

drop policy if exists "Users can view payment_distributions for their records" on payment_distributions;
drop policy if exists "Users can insert payment_distributions for their records" on payment_distributions;
drop policy if exists "Users can update payment_distributions for their records" on payment_distributions;
drop policy if exists "Users can delete payment_distributions for their records" on payment_distributions;

-- ============================================================
-- DROP OLD POLICIES: payers
-- ============================================================

drop policy if exists "Authenticated users can view payers" on payers;

-- ============================================================
-- DROP OLD POLICIES: push_subscriptions
-- ============================================================

drop policy if exists "Users can view their own push subscriptions" on push_subscriptions;
drop policy if exists "Users can insert their own push subscriptions" on push_subscriptions;
drop policy if exists "Users can delete their own push subscriptions" on push_subscriptions;

-- ============================================================
-- DROP OLD POLICIES: storage.objects (pet-documents bucket)
-- ============================================================

drop policy if exists "Users can view files for their pets" on storage.objects;
drop policy if exists "Users can upload files for their pets" on storage.objects;
drop policy if exists "Users can update files for their pets" on storage.objects;
drop policy if exists "Users can delete files for their pets" on storage.objects;

-- ============================================================
-- NEW POLICIES: pets (filter by family membership)
-- ============================================================

create policy "Family members can view their pets"
  on pets for select
  to authenticated
  using (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );

create policy "Family members can insert pets"
  on pets for insert
  to authenticated
  with check (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );

create policy "Family members can update their pets"
  on pets for update
  to authenticated
  using (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  )
  with check (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );

create policy "Family members can delete their pets"
  on pets for delete
  to authenticated
  using (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );

-- ============================================================
-- NEW POLICIES: insurance (via pet → family)
-- ============================================================

create policy "Family members can view insurance for their pets"
  on insurance for select
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can insert insurance for their pets"
  on insurance for insert
  to authenticated
  with check (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can update insurance for their pets"
  on insurance for update
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  )
  with check (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can delete insurance for their pets"
  on insurance for delete
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- NEW POLICIES: vaccines (via pet → family)
-- ============================================================

create policy "Family members can view vaccines for their pets"
  on vaccines for select
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can insert vaccines for their pets"
  on vaccines for insert
  to authenticated
  with check (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can update vaccines for their pets"
  on vaccines for update
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  )
  with check (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can delete vaccines for their pets"
  on vaccines for delete
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- NEW POLICIES: parasite_control (via pet → family)
-- ============================================================

create policy "Family members can view parasite_control for their pets"
  on parasite_control for select
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can insert parasite_control for their pets"
  on parasite_control for insert
  to authenticated
  with check (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can update parasite_control for their pets"
  on parasite_control for update
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  )
  with check (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can delete parasite_control for their pets"
  on parasite_control for delete
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- NEW POLICIES: service_certificates (via pet → family)
-- ============================================================

create policy "Family members can view service_certificates for their pets"
  on service_certificates for select
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can insert service_certificates for their pets"
  on service_certificates for insert
  to authenticated
  with check (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can update service_certificates for their pets"
  on service_certificates for update
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  )
  with check (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can delete service_certificates for their pets"
  on service_certificates for delete
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- NEW POLICIES: vet_appointments (via pet → family)
-- ============================================================

create policy "Family members can view vet_appointments for their pets"
  on vet_appointments for select
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can insert vet_appointments for their pets"
  on vet_appointments for insert
  to authenticated
  with check (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can update vet_appointments for their pets"
  on vet_appointments for update
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  )
  with check (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can delete vet_appointments for their pets"
  on vet_appointments for delete
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- NEW POLICIES: lab_exams (via pet → family)
-- ============================================================

create policy "Family members can view lab_exams for their pets"
  on lab_exams for select
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can insert lab_exams for their pets"
  on lab_exams for insert
  to authenticated
  with check (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can update lab_exams for their pets"
  on lab_exams for update
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  )
  with check (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can delete lab_exams for their pets"
  on lab_exams for delete
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- NEW POLICIES: food_purchases (via pet → family)
-- ============================================================

create policy "Family members can view food_purchases for their pets"
  on food_purchases for select
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can insert food_purchases for their pets"
  on food_purchases for insert
  to authenticated
  with check (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can update food_purchases for their pets"
  on food_purchases for update
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  )
  with check (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can delete food_purchases for their pets"
  on food_purchases for delete
  to authenticated
  using (
    pet_id in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- NEW POLICIES: payment_distributions (via pet → family)
-- Uses the same pet_id subquery pattern across all record tables.
-- ============================================================

create policy "Family members can view payment_distributions for their records"
  on payment_distributions for select
  to authenticated
  using (
    record_id in (select id from lab_exams where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from food_purchases where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from insurance where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from vaccines where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from parasite_control where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from service_certificates where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from vet_appointments where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
  );

create policy "Family members can insert payment_distributions for their records"
  on payment_distributions for insert
  to authenticated
  with check (
    record_id in (select id from lab_exams where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from food_purchases where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from insurance where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from vaccines where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from parasite_control where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from service_certificates where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from vet_appointments where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
  );

create policy "Family members can update payment_distributions for their records"
  on payment_distributions for update
  to authenticated
  using (
    record_id in (select id from lab_exams where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from food_purchases where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from insurance where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from vaccines where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from parasite_control where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from service_certificates where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from vet_appointments where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
  )
  with check (
    record_id in (select id from lab_exams where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from food_purchases where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from insurance where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from vaccines where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from parasite_control where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from service_certificates where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from vet_appointments where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
  );

create policy "Family members can delete payment_distributions for their records"
  on payment_distributions for delete
  to authenticated
  using (
    record_id in (select id from lab_exams where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from food_purchases where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from insurance where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from vaccines where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from parasite_control where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from service_certificates where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
    or record_id in (select id from vet_appointments where pet_id in (select id from pets where family_id in (select family_id from family_members where user_id = auth.uid())))
  );

-- ============================================================
-- NEW POLICIES: payers (CRUD for family members)
-- ============================================================

create policy "Family members can view payers"
  on payers for select
  to authenticated
  using (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );

create policy "Family members can insert payers"
  on payers for insert
  to authenticated
  with check (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );

create policy "Family members can update payers"
  on payers for update
  to authenticated
  using (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  )
  with check (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );

create policy "Family members can delete payers"
  on payers for delete
  to authenticated
  using (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );

-- ============================================================
-- NEW POLICIES: push_subscriptions (each user manages their own)
-- ============================================================

create policy "Users can view their own push subscriptions"
  on push_subscriptions for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert their own push subscriptions"
  on push_subscriptions for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own push subscriptions"
  on push_subscriptions for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own push subscriptions"
  on push_subscriptions for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- NEW POLICIES: families (SELECT/UPDATE for members only)
-- ============================================================

create policy "Family members can view their family"
  on families for select
  to authenticated
  using (
    id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );

create policy "Family members can update their family"
  on families for update
  to authenticated
  using (
    id in (
      select family_id from family_members where user_id = auth.uid()
    )
  )
  with check (
    id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );

-- ============================================================
-- NEW POLICIES: family_members
-- SELECT: all members of the same family
-- INSERT/DELETE: admins only
-- ============================================================

create policy "Family members can view members of their family"
  on family_members for select
  to authenticated
  using (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );

create policy "Admins can insert family members"
  on family_members for insert
  to authenticated
  with check (
    family_id in (
      select family_id from family_members where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete family members"
  on family_members for delete
  to authenticated
  using (
    family_id in (
      select family_id from family_members where user_id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- NEW POLICIES: family_invitations (admins only)
-- ============================================================

create policy "Admins can view family invitations"
  on family_invitations for select
  to authenticated
  using (
    family_id in (
      select family_id from family_members where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert family invitations"
  on family_invitations for insert
  to authenticated
  with check (
    family_id in (
      select family_id from family_members where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete family invitations"
  on family_invitations for delete
  to authenticated
  using (
    family_id in (
      select family_id from family_members where user_id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- NEW POLICIES: storage.objects (pet-documents bucket)
-- Filter by family membership through the pet's family_id in the path.
-- Path format: {pet_id}/{tipo_registro}/{registro_id}/{nombre_archivo}
-- ============================================================

create policy "Family members can view files for their pets"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'pet-documents'
    and (storage.foldername(name))[1]::uuid in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can upload files for their pets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'pet-documents'
    and (storage.foldername(name))[1]::uuid in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can update files for their pets"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'pet-documents'
    and (storage.foldername(name))[1]::uuid in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );

create policy "Family members can delete files for their pets"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'pet-documents'
    and (storage.foldername(name))[1]::uuid in (
      select id from pets where family_id in (
        select family_id from family_members where user_id = auth.uid()
      )
    )
  );
