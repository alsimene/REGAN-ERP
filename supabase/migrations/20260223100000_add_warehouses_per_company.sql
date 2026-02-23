-- Rename existing warehouses to meaningful names
UPDATE warehouses SET name = 'Kirin Main', location = 'Main Branch' WHERE id = 'b0000000-0000-4000-8000-000000000001';
UPDATE warehouses SET name = 'Regan Main', location = 'Main Branch' WHERE id = 'b0000000-0000-4000-8000-000000000002';
UPDATE warehouses SET name = 'Supremo Main', location = 'Main Branch' WHERE id = 'b0000000-0000-4000-8000-000000000003';

-- Add second warehouse per company
INSERT INTO warehouses (id, name, location, company_id) VALUES
  ('b0000000-0000-4000-8000-000000000004', 'Kirin Yard',    'Secondary Yard',  'd715a70c-6bf7-41bf-bd82-6f0eec57b26d'),
  ('b0000000-0000-4000-8000-000000000005', 'Regan Yard',    'Secondary Yard',  'e52e9c2a-623c-4d49-87c0-51e1cadff60d'),
  ('b0000000-0000-4000-8000-000000000006', 'Supremo Yard',  'Secondary Yard',  '3082b68c-24cc-4940-ad97-f1c889cd41f3');

-- Seed warehouse_stock for the new warehouses (subset of products, ~30% get stock in yard)
INSERT INTO warehouse_stock (product_id, warehouse_id, classification, quantity)
SELECT ws.product_id,
  (CASE
    WHEN ws.warehouse_id = 'b0000000-0000-4000-8000-000000000001' THEN 'b0000000-0000-4000-8000-000000000004'
    WHEN ws.warehouse_id = 'b0000000-0000-4000-8000-000000000002' THEN 'b0000000-0000-4000-8000-000000000005'
    WHEN ws.warehouse_id = 'b0000000-0000-4000-8000-000000000003' THEN 'b0000000-0000-4000-8000-000000000006'
  END)::uuid,
  ws.classification,
  greatest(1, (ws.quantity * (10 + floor(random() * 30)::int) / 100))
FROM warehouse_stock ws
WHERE ws.quantity > 0 AND random() < 0.3;
