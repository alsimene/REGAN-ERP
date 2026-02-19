create or replace function get_fast_moving_items(p_limit int default 20)
returns json
language sql stable
set search_path = public
as $$
  with ranked as (
    select
      product_id,
      sum(quantity)::bigint as total_sold,
      count(distinct order_id)::bigint as order_count
    from order_items
    group by product_id
    order by total_sold desc
    limit p_limit
  ),
  with_stock as (
    select
      r.product_id, r.total_sold, r.order_count,
      coalesce(sum(coalesce(ws.c1,0)+coalesce(ws.c2,0)+coalesce(ws.c3,0)),0)::bigint as current_stock
    from ranked r
    left join warehouse_stock ws on ws.product_id = r.product_id
    group by r.product_id, r.total_sold, r.order_count
  )
  select coalesce(json_agg(json_build_object(
    'product_id', s.product_id,
    'sku', p.sku,
    'product_name', p.name,
    'category_name', c.name,
    'total_sold', s.total_sold,
    'order_count', s.order_count,
    'current_stock', s.current_stock
  ) order by s.total_sold desc), '[]'::json)
  from with_stock s
  join products p on p.id = s.product_id
  join categories c on c.id = p.category_id;
$$;
