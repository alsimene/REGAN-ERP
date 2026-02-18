-- get_dashboard_stats: replaces full-table scans for dashboard stat cards
create or replace function get_dashboard_stats()
returns json
language sql
stable
set search_path = public
as $$
  select json_build_object(
    'revenue',           coalesce((select sum(total) from orders), 0),
    'total_orders',      (select count(*) from orders),
    'total_stock',       coalesce((select sum(coalesce(c1,0)+coalesce(c2,0)+coalesce(c3,0)) from warehouse_stock), 0),
    'pending_shipments', (select count(*) from shipments where status <> 'delivered')
  );
$$;

-- get_sales_stats: replaces full-table scans for sales stat cards
create or replace function get_sales_stats()
returns json
language sql
stable
set search_path = public
as $$
  select json_build_object(
    'total_revenue',   coalesce((select sum(total) from orders), 0),
    'order_count',     (select count(*) from orders),
    'avg_order_value', coalesce((select avg(total) from orders), 0),
    'active_clients',  (select count(*) from clients)
  );
$$;

-- update_market_price: atomic deactivate + insert
create or replace function update_market_price(
  p_category_id int,
  p_price numeric,
  p_notes text default null
)
returns void
language plpgsql
set search_path = public
as $$
begin
  update market_prices
    set is_active = false
  where category_id = p_category_id
    and is_active = true;

  insert into market_prices (category_id, price_per_kg, is_active, notes)
  values (p_category_id, p_price, true, p_notes);
end;
$$;
