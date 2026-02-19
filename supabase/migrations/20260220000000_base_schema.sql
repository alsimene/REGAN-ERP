-- ============================================================
-- BASE SCHEMA — Tables required by seed.sql
-- ============================================================
-- 5 tables: categories, companies, warehouses, products, clients
-- ============================================================

-- ── CATEGORIES ──
CREATE TABLE categories (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
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
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text NOT NULL,
  location   text,
  created_at timestamptz DEFAULT now()
);

-- ── PRODUCTS ──
CREATE TABLE products (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku               text NOT NULL UNIQUE,
  name              text NOT NULL,
  category_id       bigint NOT NULL REFERENCES categories(id),
  specs             jsonb NOT NULL DEFAULT '{}',
  length_m          numeric(5,1),
  kg_per_m          numeric(8,3),
  weight_per_length numeric(8,3),
  capacity          integer DEFAULT 0,
  unit              text DEFAULT 'pcs',
  created_at        timestamptz DEFAULT now()
);

-- ── CLIENTS ──
CREATE TABLE clients (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name            text NOT NULL,
  contact_person  text,
  email           text,
  phone           text,
  address         text,
  city            text,
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_specs ON products USING gin(specs);
CREATE INDEX idx_clients_name ON clients(name);
