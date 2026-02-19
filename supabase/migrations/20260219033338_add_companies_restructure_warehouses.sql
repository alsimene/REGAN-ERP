-- ============================================================
-- Migration: Add Companies Table & Restructure Warehouses
-- ============================================================
-- The current "warehouses" table actually stores companies
-- (Regan, Kirin, Supremo). This migration fixes the data model
-- so each company owns multiple warehouses.
-- ============================================================

-- Step 1: Create companies table
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  address text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Step 2: Seed the 3 companies
INSERT INTO companies (name, code) VALUES
  ('Regan', 'RGN'),
  ('Kirin', 'KRN'),
  ('Supremo', 'SUP');

-- Step 3: Add company_id FK to warehouses + index
ALTER TABLE warehouses ADD COLUMN company_id uuid REFERENCES companies(id);
CREATE INDEX idx_warehouses_company ON warehouses(company_id);

-- Step 4: Link existing warehouse rows to their matching company
UPDATE warehouses w SET company_id = c.id
FROM companies c WHERE c.name = w.name;

-- Step 5: Drop old global unique constraint on name BEFORE renaming
ALTER TABLE warehouses DROP CONSTRAINT IF EXISTS warehouses_name_key;

-- Step 6: Rename to actual warehouse names (now safe since constraint is dropped)
UPDATE warehouses SET name = 'Main Warehouse' WHERE name IN ('Regan', 'Kirin', 'Supremo');

-- Step 7: Make company_id required
ALTER TABLE warehouses ALTER COLUMN company_id SET NOT NULL;

-- Step 8: Add per-company unique constraint
ALTER TABLE warehouses ADD CONSTRAINT uq_warehouse_company_name UNIQUE(company_id, name);

-- Step 9: Add placeholder second warehouses for simulation
INSERT INTO warehouses (name, location, company_id)
SELECT 'Yard B', 'Secondary location', c.id FROM companies c;
