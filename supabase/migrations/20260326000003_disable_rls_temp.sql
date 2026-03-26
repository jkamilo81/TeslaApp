-- TEMPORARY: disable RLS for local testing without auth
-- Remove this migration and re-enable RLS when login is turned back on
alter table pets disable row level security;
alter table insurance disable row level security;
alter table vaccines disable row level security;
alter table parasite_control disable row level security;
alter table service_certificates disable row level security;
alter table vet_appointments disable row level security;
alter table push_subscriptions disable row level security;
