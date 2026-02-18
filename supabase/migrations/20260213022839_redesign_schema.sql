-- ============================================================
-- BAKAL INVENTORY MANAGEMENT — SCHEMA REDESIGN
-- ============================================================
-- Drops all existing tables/views and recreates with:
--   - bigint generated always as identity PKs
--   - timestamptz instead of timestamp
--   - text instead of varchar
--   - JSONB specs for variable product attributes
--   - 5 new tables: market_prices, clients, orders, order_items, shipments
-- ============================================================

-- Drop existing views
drop view if exists product_stock_summary cascade;
drop view if exists low_stock_alerts cascade;
drop view if exists warehouse_inventory cascade;
drop view if exists recent_movements cascade;

-- Drop existing tables (reverse dependency order)
drop table if exists stock_movements cascade;
drop table if exists warehouse_stock cascade;
drop table if exists products cascade;
drop table if exists warehouses cascade;
drop table if exists categories cascade;

-- ============================================================
-- TABLES
-- ============================================================

create table categories (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  description text,
  created_at  timestamptz default now()
);

create table warehouses (
  id          bigint generated always as identity primary key,
  name        text not null unique,
  location    text,
  created_at  timestamptz default now()
);

create table products (
  id                bigint generated always as identity primary key,
  sku               text not null unique,
  name              text not null,
  category_id       bigint not null references categories(id),
  specs             jsonb not null default '{}',
  length_m          numeric(5,1),
  kg_per_m          numeric(8,3),
  weight_per_length numeric(8,3),
  capacity          integer default 0,
  unit              text default 'pcs',
  created_at        timestamptz default now()
);

create table market_prices (
  id             bigint generated always as identity primary key,
  category_id    bigint references categories(id),
  price_per_kg   numeric(10,2) not null,
  effective_date timestamptz default now(),
  is_active      boolean default true,
  notes          text,
  created_at     timestamptz default now()
);

create table warehouse_stock (
  id            bigint generated always as identity primary key,
  product_id    bigint not null references products(id) on delete cascade,
  warehouse_id  bigint not null references warehouses(id) on delete cascade,
  c1            integer default 0 check (c1 >= 0),
  c2            integer default 0 check (c2 >= 0),
  c3            integer default 0 check (c3 >= 0),
  updated_at    timestamptz default now(),
  unique(product_id, warehouse_id)
);

create table stock_movements (
  id              bigint generated always as identity primary key,
  product_id      bigint not null references products(id),
  warehouse_id    bigint not null references warehouses(id),
  movement_type   text not null check (movement_type in ('receive','sale','transfer_in','transfer_out','adjustment','return')),
  classification  text not null check (classification in ('c1','c2','c3')),
  quantity        integer not null,
  reference_id    text,
  notes           text,
  performed_by    text,
  created_at      timestamptz default now()
);

create table clients (
  id              bigint generated always as identity primary key,
  name            text not null,
  contact_person  text,
  email           text,
  phone           text,
  address         text,
  city            text,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table orders (
  id              bigint generated always as identity primary key,
  order_number    text not null unique,
  client_id       bigint not null references clients(id),
  order_date      timestamptz default now(),
  status          text not null default 'pending' check (status in ('pending','processing','in_transit','delivered','cancelled')),
  payment_status  text not null default 'pending' check (payment_status in ('pending','partial','paid')),
  subtotal        numeric(12,2) default 0,
  tax             numeric(12,2) default 0,
  total           numeric(12,2) default 0,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table order_items (
  id               bigint generated always as identity primary key,
  order_id         bigint not null references orders(id) on delete cascade,
  product_id       bigint not null references products(id),
  warehouse_id     bigint references warehouses(id),
  quantity         integer not null check (quantity > 0),
  classification   text not null default 'c1' check (classification in ('c1','c2','c3')),
  price_per_kg     numeric(10,2) not null,
  weight_per_piece numeric(8,3) not null,
  total_weight     numeric(12,3) generated always as (quantity * weight_per_piece) stored,
  line_total       numeric(12,2) generated always as (quantity * weight_per_piece * price_per_kg) stored,
  created_at       timestamptz default now()
);

create table shipments (
  id                bigint generated always as identity primary key,
  shipment_number   text not null unique,
  order_id          bigint not null references orders(id),
  carrier           text,
  destination       text,
  departed_at       timestamptz,
  eta               timestamptz,
  delivered_at      timestamptz,
  total_weight_kg   numeric(12,3),
  status            text not null default 'preparing' check (status in ('preparing','in_transit','delivered','delayed')),
  tracking_number   text,
  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- products
create index idx_products_category on products(category_id);
create index idx_products_sku on products(sku);
create index idx_products_specs on products using gin(specs);

-- warehouse_stock
create index idx_ws_product on warehouse_stock(product_id);
create index idx_ws_warehouse on warehouse_stock(warehouse_id);

-- stock_movements
create index idx_sm_product on stock_movements(product_id);
create index idx_sm_warehouse on stock_movements(warehouse_id);
create index idx_sm_type on stock_movements(movement_type);
create index idx_sm_created on stock_movements(created_at);

-- market_prices
create index idx_mp_category on market_prices(category_id);
create index idx_mp_active on market_prices(is_active) where is_active = true;

-- clients
create index idx_clients_name on clients(name);

-- orders
create index idx_orders_client on orders(client_id);
create index idx_orders_status on orders(status);
create index idx_orders_date on orders(order_date);

-- order_items
create index idx_oi_order on order_items(order_id);
create index idx_oi_product on order_items(product_id);
create index idx_oi_warehouse on order_items(warehouse_id);

-- shipments
create index idx_shipments_order on shipments(order_id);
create index idx_shipments_status on shipments(status);

-- ============================================================
-- VIEWS
-- ============================================================

-- product_stock_summary: Total stock per product
create or replace view product_stock_summary as
select
  p.id as product_id,
  p.sku,
  p.name,
  c.name as category,
  p.specs->>'size_mm' as size_mm,
  p.specs->>'thickness_mm' as thickness_mm,
  p.length_m,
  p.kg_per_m,
  p.weight_per_length,
  p.capacity,
  coalesce(sum(ws.c1), 0) as total_c1,
  coalesce(sum(ws.c2), 0) as total_c2,
  coalesce(sum(ws.c3), 0) as total_c3,
  coalesce(sum(ws.c1 + ws.c2 + ws.c3), 0) as total_stock
from products p
join categories c on c.id = p.category_id
left join warehouse_stock ws on ws.product_id = p.id
group by p.id, p.sku, p.name, c.name, p.specs, p.length_m, p.kg_per_m, p.weight_per_length, p.capacity;

-- low_stock_alerts: Products below 20% capacity
create or replace view low_stock_alerts as
select *
from product_stock_summary
where capacity > 0 and total_stock < capacity * 0.2;

-- warehouse_inventory: Per-warehouse breakdown
create or replace view warehouse_inventory as
select
  ws.id as stock_id,
  w.name as warehouse_name,
  p.sku,
  p.name as product_name,
  c.name as category,
  p.specs->>'size_mm' as size_mm,
  p.specs->>'thickness_mm' as thickness_mm,
  p.length_m,
  ws.c1,
  ws.c2,
  ws.c3,
  (ws.c1 + ws.c2 + ws.c3) as subtotal,
  ws.updated_at
from warehouse_stock ws
join products p on p.id = ws.product_id
join warehouses w on w.id = ws.warehouse_id
join categories c on c.id = p.category_id;

-- recent_movements: Activity feed
create or replace view recent_movements as
select
  sm.id,
  sm.movement_type,
  sm.classification,
  sm.quantity,
  sm.reference_id,
  sm.notes,
  sm.performed_by,
  sm.created_at,
  p.sku,
  p.name as product_name,
  w.name as warehouse_name
from stock_movements sm
join products p on p.id = sm.product_id
join warehouses w on w.id = sm.warehouse_id
order by sm.created_at desc;

-- order_summary: Orders with client, items, totals
create or replace view order_summary as
select
  o.id as order_id,
  o.order_number,
  cl.name as client_name,
  o.order_date,
  o.status,
  o.payment_status,
  o.subtotal,
  o.tax,
  o.total,
  count(oi.id) as item_count,
  coalesce(sum(oi.total_weight), 0) as total_weight_kg,
  o.created_at
from orders o
join clients cl on cl.id = o.client_id
left join order_items oi on oi.order_id = o.id
group by o.id, o.order_number, cl.name, o.order_date, o.status, o.payment_status,
         o.subtotal, o.tax, o.total, o.created_at;

-- monthly_sales: Aggregated monthly revenue
create or replace view monthly_sales as
select
  date_trunc('month', o.order_date) as month,
  count(distinct o.id) as order_count,
  coalesce(sum(o.total), 0) as revenue,
  coalesce(sum(oi.total_weight), 0) as total_weight_kg
from orders o
left join order_items oi on oi.order_id = o.id
where o.status = 'delivered'
group by date_trunc('month', o.order_date)
order by month desc;

-- client_sales_summary: Top clients by revenue
create or replace view client_sales_summary as
select
  cl.id as client_id,
  cl.name as client_name,
  cl.city,
  count(distinct o.id) as order_count,
  coalesce(sum(o.total), 0) as total_revenue,
  max(o.order_date) as last_order_date
from clients cl
left join orders o on o.client_id = cl.id and o.status != 'cancelled'
group by cl.id, cl.name, cl.city;

-- current_market_prices: Active prices with global fallback
create or replace view current_market_prices as
select
  c.id as category_id,
  c.name as category_name,
  coalesce(
    (select mp.price_per_kg from market_prices mp
     where mp.category_id = c.id and mp.is_active
     order by mp.effective_date desc limit 1),
    (select mp.price_per_kg from market_prices mp
     where mp.category_id is null and mp.is_active
     order by mp.effective_date desc limit 1)
  ) as price_per_kg,
  coalesce(
    (select mp.effective_date from market_prices mp
     where mp.category_id = c.id and mp.is_active
     order by mp.effective_date desc limit 1),
    (select mp.effective_date from market_prices mp
     where mp.category_id is null and mp.is_active
     order by mp.effective_date desc limit 1)
  ) as effective_date,
  case
    when exists (select 1 from market_prices mp where mp.category_id = c.id and mp.is_active)
    then 'category'
    else 'global'
  end as price_source
from categories c;
