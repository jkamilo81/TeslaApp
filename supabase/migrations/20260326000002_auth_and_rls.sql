-- Add user_id to pets table for future multi-family support
alter table pets add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- For now, we'll update existing pets after first user signs up via app logic.
-- Enable RLS on all tables
alter table pets enable row level security;
alter table insurance enable row level security;
alter table vaccines enable row level security;
alter table parasite_control enable row level security;
alter table service_certificates enable row level security;
alter table vet_appointments enable row level security;
alter table push_subscriptions enable row level security;

-- Pets: users can only see/manage their own pets
create policy "Users can view their own pets"
  on pets for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert their own pets"
  on pets for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own pets"
  on pets for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own pets"
  on pets for delete
  to authenticated
  using (user_id = auth.uid());

-- Insurance: access through pet ownership
create policy "Users can view insurance for their pets"
  on insurance for select
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can insert insurance for their pets"
  on insurance for insert
  to authenticated
  with check (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can update insurance for their pets"
  on insurance for update
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()))
  with check (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can delete insurance for their pets"
  on insurance for delete
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()));

-- Vaccines
create policy "Users can view vaccines for their pets"
  on vaccines for select
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can insert vaccines for their pets"
  on vaccines for insert
  to authenticated
  with check (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can update vaccines for their pets"
  on vaccines for update
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()))
  with check (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can delete vaccines for their pets"
  on vaccines for delete
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()));

-- Parasite control
create policy "Users can view parasite_control for their pets"
  on parasite_control for select
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can insert parasite_control for their pets"
  on parasite_control for insert
  to authenticated
  with check (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can update parasite_control for their pets"
  on parasite_control for update
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()))
  with check (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can delete parasite_control for their pets"
  on parasite_control for delete
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()));

-- Service certificates
create policy "Users can view service_certificates for their pets"
  on service_certificates for select
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can insert service_certificates for their pets"
  on service_certificates for insert
  to authenticated
  with check (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can update service_certificates for their pets"
  on service_certificates for update
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()))
  with check (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can delete service_certificates for their pets"
  on service_certificates for delete
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()));

-- Vet appointments
create policy "Users can view vet_appointments for their pets"
  on vet_appointments for select
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can insert vet_appointments for their pets"
  on vet_appointments for insert
  to authenticated
  with check (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can update vet_appointments for their pets"
  on vet_appointments for update
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()))
  with check (pet_id in (select id from pets where user_id = auth.uid()));

create policy "Users can delete vet_appointments for their pets"
  on vet_appointments for delete
  to authenticated
  using (pet_id in (select id from pets where user_id = auth.uid()));

-- Push subscriptions: users manage their own
alter table push_subscriptions add column if not exists user_id uuid references auth.users(id) on delete cascade;

create policy "Users can view their own push subscriptions"
  on push_subscriptions for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert their own push subscriptions"
  on push_subscriptions for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can delete their own push subscriptions"
  on push_subscriptions for delete
  to authenticated
  using (user_id = auth.uid());
