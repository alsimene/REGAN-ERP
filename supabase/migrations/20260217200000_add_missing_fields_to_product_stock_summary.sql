DROP VIEW IF EXISTS low_stock_alerts;
DROP VIEW IF EXISTS product_stock_summary;

CREATE VIEW product_stock_summary AS
SELECT
  p.id AS product_id,
  p.sku,
  p.name,
  c.name AS category,
  p.specs ->> 'size_mm' AS size_mm,
  p.specs ->> 'size_inch' AS size_inch,
  p.specs ->> 'thickness_mm' AS thickness_mm,
  p.specs ->> 'flange_thickness_mm' AS flange_thickness_mm,
  p.specs ->> 'weight_per_20ft' AS weight_per_20ft,
  p.length_m,
  p.kg_per_m,
  p.weight_per_length,
  p.capacity,
  p.unit,
  COALESCE(sum(ws.c1), 0::bigint) AS total_c1,
  COALESCE(sum(ws.c2), 0::bigint) AS total_c2,
  COALESCE(sum(ws.c3), 0::bigint) AS total_c3,
  COALESCE(sum(ws.c1 + ws.c2 + ws.c3), 0::bigint) AS total_stock
FROM products p
  JOIN categories c ON c.id = p.category_id
  LEFT JOIN warehouse_stock ws ON ws.product_id = p.id
GROUP BY p.id, p.sku, p.name, c.name, p.specs, p.length_m, p.kg_per_m, p.weight_per_length, p.capacity, p.unit;

CREATE VIEW low_stock_alerts AS
SELECT
  product_id, sku, name, category,
  size_mm, thickness_mm, length_m, kg_per_m, weight_per_length,
  capacity, total_c1, total_c2, total_c3, total_stock
FROM product_stock_summary
WHERE capacity > 0 AND total_stock::numeric < (capacity::numeric * 0.2);
