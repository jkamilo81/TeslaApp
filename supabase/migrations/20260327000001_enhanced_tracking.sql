-- Enhanced Tracking & Expenses Migration
-- Creates new tables and adds columns to existing tables

-- ============================================================
-- NEW TABLES
-- ============================================================

-- Exámenes de laboratorio
create table lab_exams (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  name text not null,
  exam_date date not null,
  vet_name text,
  file_url text,
  cost_cop numeric,
  notes text,
  created_at timestamptz default now()
);

-- Compras de alimento
create table food_purchases (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  brand text not null,
  quantity numeric not null,
  quantity_unit text not null default 'kg' check (quantity_unit in ('kg', 'unidades')),
  purchase_date date not null,
  cost_cop numeric not null,
  notes text,
  created_at timestamptz default now()
);

-- Pagadores
create table payers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Distribución de pagos (relación N:M entre registros y pagadores)
create table payment_distributions (
  id uuid primary key default gen_random_uuid(),
  record_table text not null,
  record_id uuid not null,
  payer_id uuid references payers(id) on delete cascade,
  amount numeric not null check (amount >= 0),
  created_at timestamptz default now()
);

-- Log de notificaciones enviadas (deduplicación)
create table notification_log (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references vet_appointments(id) on delete cascade,
  notification_type text not null check (notification_type in ('3_day', '1_day')),
  sent_at timestamptz default now(),
  unique (appointment_id, notification_type)
);


-- ============================================================
-- NEW COLUMNS ON EXISTING TABLES
-- ============================================================

-- Campo de costo en todas las tablas de registros
alter table insurance add column cost_cop numeric;
alter table vaccines add column cost_cop numeric;
alter table parasite_control add column cost_cop numeric;
alter table service_certificates add column cost_cop numeric;
alter table vet_appointments add column cost_cop numeric;

-- URL de archivo en vacunas (foto comprobante)
alter table vaccines add column file_url text;

-- ============================================================
-- SEED DATA: Initial payers
-- ============================================================

insert into payers (name, is_default) values
  ('Juan Camilo', true),
  ('Esposa', false);
