-- Kora's profile details, plus a `sex` column for pets (the schema had no
-- place to record it).
--
-- Idempotent: safe to run more than once.

alter table pets add column if not exists sex text check (sex in ('female', 'male'));

comment on column pets.sex is 'Biological sex of the pet: female | male. Nullable for pets registered before this column existed.';

update pets
   set breed      = 'Criolla',
       birth_date = '2021-05-18',
       sex        = 'female'
 where name = 'Kora';
