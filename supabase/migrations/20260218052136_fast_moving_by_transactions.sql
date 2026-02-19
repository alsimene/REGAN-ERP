-- ============================================================
-- FAST MOVING ITEMS BY STOCK TRANSACTIONS
-- ============================================================
-- Replaces the order_items-based fast movers with one driven
-- by actual stock_movements (sale + transfer_out).
-- Adds a configurable time-window (default 30 days) and
-- returns richer movement analytics per product.
-- ============================================================

create or replace function get_fast_moving_items(
  p_limit int default 20,
  p_days  int default 30
)
returns json
language sql stable
set search_path = public
as $$
  with movements as (
    select
      sm.product_id,
      sum(sm.quantity)::bigint                         as total_moved,
      count(*)::bigint                                 as txn_count,
      count(distinct sm.warehouse_id)::bigint          as warehouse_count,
      max(sm.created_at)                               as last_movement
    from stock_movements sm
    where sm.movement_type in ('sale', 'transfer_out')
      and sm.created_at >= now() - make_interval(days => p_days)
    group by sm.product_id
    order by total_moved desc
    limit p_limit
  ),
  with_stock as (
    select
      m.product_id,
      m.total_moved,
      m.txn_count,
      m.warehouse_count,
      m.last_movement,
      coalesce(sum(coalesce(ws.c1,0) + coalesce(ws.c2,0) + coalesce(ws.c3,0)), 0)::bigint as current_stock,
      coalesce(
        (select sum(oi.quantity)::bigint
         from order_items oi where oi.product_id = m.product_id), 0
      ) as total_ordered
    from movements m
    left join warehouse_stock ws on ws.product_id = m.product_id
    group by m.product_id, m.total_moved, m.txn_count, m.warehouse_count, m.last_movement
  )
  select coalesce(json_agg(json_build_object(
    'product_id',      s.product_id,
    'sku',             p.sku,
    'product_name',    p.name,
    'category_name',   c.name,
    'total_moved',     s.total_moved,
    'total_ordered',   s.total_ordered,
    'txn_count',       s.txn_count,
    'warehouse_count', s.warehouse_count,
    'current_stock',   s.current_stock,
    'last_movement',   s.last_movement
  ) order by s.total_moved desc), '[]'::json)
  from with_stock s
  join products p on p.id = s.product_id
  join categories c on c.id = p.category_id;
$$;
