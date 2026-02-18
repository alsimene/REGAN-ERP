-- get_total_stock: returns SUM(c1+c2+c3) from warehouse_stock as a single number
create or replace function get_total_stock()
returns bigint
language sql
stable
as $$
  select coalesce(sum(coalesce(c1,0) + coalesce(c2,0) + coalesce(c3,0)), 0)
  from warehouse_stock;
$$;

-- get_low_stock_count: returns COUNT(*) from the existing low_stock_alerts view
create or replace function get_low_stock_count()
returns bigint
language sql
stable
as $$
  select count(*)
  from low_stock_alerts;
$$;
