-- Pets table (Tesla = dog, Figo = cat)
create table if not exists pets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('dog', 'cat')),
  breed text,
  birth_date date,
  created_at timestamptz default now()
);

-- Insurance records
create table if not exists insurance (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  provider text not null,
  policy_number text,
  start_date date not null,
  expiry_date date not null,
  status text not null default 'active' check (status in ('active', 'expired', 'pending')),
  notes text,
  created_at timestamptz default now()
);

-- Vaccines
create table if not exists vaccines (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  name text not null,
  administered_date date not null,
  next_due_date date,
  vet_name text,
  notes text,
  created_at timestamptz default now()
);

-- Parasite control (flea, tick, worm treatments)
create table if not exists parasite_control (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  type text not null, -- e.g. 'flea', 'tick', 'worm', 'combined'
  product_name text not null,
  administered_date date not null,
  next_due_date date,
  notes text,
  created_at timestamptz default now()
);

-- Dog service certificate (Tesla only)
create table if not exists service_certificates (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  certificate_type text not null,
  issued_date date not null,
  expiry_date date,
  issuing_authority text,
  certificate_number text,
  notes text,
  created_at timestamptz default now()
);

-- Vet appointments
create table if not exists vet_appointments (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  appointment_date timestamptz not null,
  reason text not null,
  vet_name text,
  clinic_name text,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- Push notification subscriptions
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

-- Seed Tesla and Figo
insert into pets (name, type, breed) values
  ('Tesla', 'dog', null),
  ('Figo', 'cat', null)
on conflict do nothing;
