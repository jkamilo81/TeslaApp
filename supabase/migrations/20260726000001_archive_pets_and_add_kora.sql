-- Archive support for pets, plus: archive Tesla (deceased) and add Kora (adopted).
--
-- Archiving is preferred over deletion so medical history and past expenses are
-- preserved. Archived pets are hidden from the dashboard, navigation, pet
-- profiles and reminders, but their records remain in Historial and Gastos.
--
-- Idempotent: safe to run more than once.

-- 1. Archive column
alter table pets add column if not exists archived_at timestamptz;

comment on column pets.archived_at is
  'When set, the pet is no longer active: hidden from dashboard, nav and reminders. Historical records are retained.';

-- Partial index: the common query is "active pets only"
create index if not exists pets_active_idx on pets (family_id) where archived_at is null;

-- 2. Archive Tesla
update pets
   set archived_at = now()
 where name = 'Tesla'
   and archived_at is null;

-- 3. Add Kora, in the same family as the existing pets
insert into pets (name, type, family_id)
select 'Kora',
       'dog',
       (select family_id
          from pets
         where family_id is not null
         order by created_at
         limit 1)
 where not exists (select 1 from pets where name = 'Kora')
   and exists (select 1 from pets where family_id is not null);
