-- RPC: get_categories_with_counts
-- Returns categories along with their product count so the UI
-- can hide empty categories from the dropdown.

create or replace function get_categories_with_counts()
returns table (
  id bigint,
  name text,
  product_count bigint
)
language sql
stable
set search_path = ''
as $$
  select
    c.id,
    c.name,
    count(p.id) as product_count
  from public.categories c
  left join public.products p on p.category_id = c.id
  group by c.id, c.name
  order by c.name;
$$;
