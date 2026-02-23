-- ============================================================
-- CONSOLIDATED SCHEMA — Full database structure
-- ============================================================
-- Tables: categories, companies, warehouses, products, clients,
--         warehouse_stock, stock_movements
-- Views:  product_total_stock
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

-- ── STOCK MOVEMENTS ──
CREATE TABLE stock_movements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id    uuid NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  movement_type   text NOT NULL CHECK (movement_type IN (
    'restock', 'adjustment_add', 'adjustment_remove',
    'delivery', 'transfer_in', 'transfer_out', 'reclassify'
  )),
  classification  text NOT NULL CHECK (classification IN ('C1', 'C2', 'C3')),
  quantity        integer NOT NULL,
  performed_by    text NOT NULL,
  notes           text,
  reference_id    text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── VIEWS ──
CREATE VIEW product_total_stock AS
SELECT product_id, COALESCE(SUM(quantity), 0)::int AS total_stock
FROM warehouse_stock
GROUP BY product_id;

-- ── INDEXES ──
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_specs ON products USING gin(specs);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_warehouses_company ON warehouses(company_id);
CREATE INDEX idx_warehouse_stock_product ON warehouse_stock(product_id);
CREATE INDEX idx_warehouse_stock_warehouse ON warehouse_stock(warehouse_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX idx_stock_movements_created ON stock_movements(created_at DESC);
