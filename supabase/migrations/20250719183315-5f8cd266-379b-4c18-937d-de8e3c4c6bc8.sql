-- Temporarily remove the foreign key constraint to allow demo data
ALTER TABLE contractor_businesses DROP CONSTRAINT IF EXISTS contractor_businesses_user_id_fkey;

-- Make user_id nullable for demo purposes
ALTER TABLE contractor_businesses ALTER COLUMN user_id DROP NOT NULL;