-- ============================================================
-- CRM: Extend Clients Table
-- ============================================================
-- Adds CRM-specific columns to the existing clients table
-- to support company/account management features.
-- ============================================================

ALTER TABLE clients ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS employee_count integer;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS annual_revenue numeric;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS account_owner text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS zip_code text;
