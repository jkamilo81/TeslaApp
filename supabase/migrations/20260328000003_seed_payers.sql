-- Seed payers for the family
-- Since auth is currently disabled, we insert payers without family_id constraint
-- These will be updated with family_id when auth is enabled

-- Clear any existing payers without family_id
DELETE FROM payers WHERE family_id IS NULL;

-- Insert Juan Camilo and Kathe as payers
INSERT INTO payers (name, is_default)
VALUES
  ('Juan Camilo', true),
  ('Kathe', false)
ON CONFLICT DO NOTHING;
