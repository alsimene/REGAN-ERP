-- ============================================================
-- Migration: Update Views for Company Awareness
-- ============================================================

-- 1. Update warehouse_inventory — add company info
DROP VIEW IF EXISTS warehouse_inventory CASCADE;
CREATE VIEW warehouse_inventory AS
SELECT
  ws.id AS stock_id,
  co.id AS company_id,
  co.name AS company_name,
  w.id AS warehouse_id,
  w.name AS warehouse_name,
  p.sku,
  p.name AS product_name,
  c.name AS category,
  (p.specs->>'size_mm') AS size_mm,
  (p.specs->>'thickness_mm') AS thickness_mm,
  p.length_m,
  ws.c1, ws.c2, ws.c3,
  (ws.c1 + ws.c2 + ws.c3) AS subtotal,
  ws.updated_at
FROM warehouse_stock ws
JOIN products p ON p.id = ws.product_id
JOIN warehouses w ON w.id = ws.warehouse_id
JOIN companies co ON co.id = w.company_id
JOIN categories c ON c.id = p.category_id;

-- 2. Recreate product_stock_summary (same shape, keeps frontend working)
DROP VIEW IF EXISTS low_stock_alerts CASCADE;
DROP VIEW IF EXISTS product_stock_summary CASCADE;
CREATE VIEW product_stock_summary AS
SELECT
  p.id AS product_id,
  p.sku,
  p.name,
  c.name AS category,
  (p.specs->>'size_mm') AS size_mm,
  (p.specs->>'size_inch') AS size_inch,
  (p.specs->>'thickness_mm') AS thickness_mm,
  (p.specs->>'flange_thickness_mm') AS flange_thickness_mm,
  (p.specs->>'weight_per_20ft') AS weight_per_20ft,
  p.length_m,
  p.kg_per_m,
  p.weight_per_length,
  p.capacity,
  p.unit,
  COALESCE(sum(ws.c1), 0)::bigint AS total_c1,
  COALESCE(sum(ws.c2), 0)::bigint AS total_c2,
  COALESCE(sum(ws.c3), 0)::bigint AS total_c3,
  COALESCE(sum(ws.c1 + ws.c2 + ws.c3), 0)::bigint AS total_stock
FROM products p
JOIN categories c ON c.id = p.category_id
LEFT JOIN warehouse_stock ws ON ws.product_id = p.id
GROUP BY p.id, p.sku, p.name, c.name, p.specs, p.length_m,
  p.kg_per_m, p.weight_per_length, p.capacity, p.unit;

-- 3. Recreate low_stock_alerts
CREATE VIEW low_stock_alerts AS
SELECT * FROM product_stock_summary
WHERE capacity > 0 AND total_stock < (capacity * 0.2)::bigint;

-- 4. New view: company_stock_summary — inventory per company
CREATE VIEW company_stock_summary AS
SELECT
  co.id AS company_id,
  co.name AS company_name,
  p.id AS product_id,
  p.sku,
  p.name AS product_name,
  c.name AS category,
  (p.specs->>'size_mm') AS size_mm,
  (p.specs->>'thickness_mm') AS thickness_mm,
  p.length_m, p.kg_per_m, p.weight_per_length, p.capacity, p.unit,
  COALESCE(sum(ws.c1), 0)::bigint AS total_c1,
  COALESCE(sum(ws.c2), 0)::bigint AS total_c2,
  COALESCE(sum(ws.c3), 0)::bigint AS total_c3,
  COALESCE(sum(ws.c1 + ws.c2 + ws.c3), 0)::bigint AS total_stock
FROM warehouse_stock ws
JOIN warehouses w ON w.id = ws.warehouse_id
JOIN companies co ON co.id = w.company_id
JOIN products p ON p.id = ws.product_id
JOIN categories c ON c.id = p.category_id
GROUP BY co.id, co.name, p.id, p.sku, p.name, c.name,
  p.specs, p.length_m, p.kg_per_m, p.weight_per_length, p.capacity, p.unit;
