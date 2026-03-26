-- Family Groups Schema Migration
-- Creates families, family_members, family_invitations tables
-- Adds family_id columns to pets, payers, push_subscriptions
-- Migrates existing data idempotently

-- ============================================================
-- NEW TABLES
-- ============================================================

create table if not exists families (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists family_members (
  id        uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      text not null check (role in ('admin', 'member')),
  joined_at timestamptz default now(),
  unique (family_id, user_id)
);

create index if not exists family_members_user_family_idx
  on family_members (user_id, family_id);

create table if not exists family_invitations (
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references families(id) on delete cascade,
  code       text not null unique,
  created_by uuid references auth.users(id),
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists family_invitations_code_idx
  on family_invitations (code);

-- ============================================================
-- NEW COLUMNS ON EXISTING TABLES
-- ============================================================

alter table pets
  add column if not exists family_id uuid references families(id);

alter table payers
  add column if not exists family_id uuid references families(id),
  add column if not exists user_id   uuid references auth.users(id);

alter table push_subscriptions
  add column if not exists family_id uuid references families(id);

-- ============================================================
-- DATA MIGRATION: pets → families
-- For each distinct user_id in pets that has no family yet,
-- create a family + family_members record (role='admin'),
-- then assign that family_id to the user's pets.
-- ============================================================

do $$
declare
  r        record;
  fam_id   uuid;
begin
  for r in
    select distinct p.user_id
    from pets p
    where p.user_id is not null
      and not exists (
        select 1 from family_members fm where fm.user_id = p.user_id
      )
  loop
    -- Create a family for this user if one doesn't exist yet
    insert into families (name, created_by)
    values ('Mi Familia', r.user_id)
    returning id into fam_id;

    -- Add the user as admin of that family
    insert into family_members (family_id, user_id, role)
    values (fam_id, r.user_id, 'admin')
    on conflict (family_id, user_id) do nothing;

    -- Assign orphan pets to this family
    update pets
    set family_id = fam_id
    where user_id = r.user_id
      and family_id is null;
  end loop;
end;
$$;

-- ============================================================
-- DATA MIGRATION: payers
-- Assign family_id from the first admin member found.
-- ============================================================

update payers
set family_id = (
  select fm.family_id
  from family_members fm
  order by fm.joined_at
  limit 1
)
where family_id is null;
