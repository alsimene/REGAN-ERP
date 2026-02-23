-- ============================================================
-- CONSOLIDATED SCHEMA — All tables with UUID primary keys
-- ============================================================
-- 6 tables: categories, companies, warehouses, products, clients, warehouse_stock
-- All PKs use uuid DEFAULT gen_random_uuid()
-- ============================================================

-- ── CATEGORIES ──
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  description text,
  created_at  timestamptz DEFAULT now()
);

-- ── COMPANIES ──
CREATE TABLE companies (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  code       text NOT NULL UNIQUE,
  address    text,
  city       text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── WAREHOUSES ──
CREATE TABLE warehouses (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  location   text,
  company_id uuid NOT NULL REFERENCES companies(id),
  created_at timestamptz DEFAULT now()
);

-- ── PRODUCTS ──
CREATE TABLE products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku         text NOT NULL UNIQUE,
  name        text NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id),
  specs       jsonb NOT NULL DEFAULT '{}',
  unit        text DEFAULT 'pcs',
  status      boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- ── CLIENTS ──
CREATE TABLE clients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  contact_person  text,
  email           text,
  phone           text,
  address         text,
  city            text,
  created_at      timestamptz DEFAULT now()
);

-- ── WAREHOUSE STOCK ──
CREATE TABLE warehouse_stock (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id   uuid NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  classification text NOT NULL CHECK (classification IN ('C1', 'C2', 'C3')),
  quantity       integer NOT NULL DEFAULT 0,
  updated_at     timestamptz DEFAULT now(),
  UNIQUE(product_id, warehouse_id, classification)
);

-- ── INDEXES ──
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_specs ON products USING gin(specs);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_warehouses_company ON warehouses(company_id);
CREATE INDEX idx_warehouse_stock_product ON warehouse_stock(product_id);
CREATE INDEX idx_warehouse_stock_warehouse ON warehouse_stock(warehouse_id);
