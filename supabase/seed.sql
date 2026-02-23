-- ============================================================
-- BAKAL INVENTORY MANAGEMENT SYSTEM — SEED DATA (COMPLETE)
-- ============================================================
-- This file contains ALL seed data for the Regan system.
-- Schema uses UUID PKs for categories, warehouses, clients.
-- Products use a specs JSONB column for dimensions.
-- Total: 648 products, 13 categories, 3 companies, 11 clients
-- ============================================================

-- ── COMPANIES (must come before warehouses due to FK) ──
INSERT INTO companies (id, name, code) VALUES
  ('d715a70c-6bf7-41bf-bd82-6f0eec57b26d', 'Kirin',   'KRN'),
  ('e52e9c2a-623c-4d49-87c0-51e1cadff60d', 'Regan',   'RGN'),
  ('3082b68c-24cc-4940-ad97-f1c889cd41f3', 'Supremo', 'SUP');

-- ── CATEGORIES ──
INSERT INTO categories (id, name, description) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Angle Bars', 'Equal and unequal angle bars'),
  ('a0000000-0000-4000-8000-000000000002', 'Channel Bars', 'C-channel structural steel'),
  ('a0000000-0000-4000-8000-000000000003', 'Deformed Bars', 'Reinforcing steel bars (rebar)'),
  ('a0000000-0000-4000-8000-000000000004', 'Flat Bars', 'Flat steel bars'),
  ('a0000000-0000-4000-8000-000000000005', 'Pipes', 'Galvanized and black iron pipes'),
  ('a0000000-0000-4000-8000-000000000006', 'Tubings', 'Square and rectangular steel tubes'),
  ('a0000000-0000-4000-8000-000000000007', 'Plates', 'Mild steel and checkered plates'),
  ('a0000000-0000-4000-8000-000000000008', 'Coil', 'Hot rolled and cold rolled coils'),
  ('a0000000-0000-4000-8000-000000000009', 'Purlins', 'C-purlins for roofing'),
  ('a0000000-0000-4000-8000-00000000000a', 'Sheet Piles', 'Steel sheet piling'),
  ('a0000000-0000-4000-8000-00000000000b', 'T-Beams', 'T-bar structural steel'),
  ('a0000000-0000-4000-8000-00000000000c', 'Wide Flanges', 'Wide flange I-beams'),
  ('a0000000-0000-4000-8000-00000000000d', 'Other Services', 'Cutting, bending, and other services');

-- ── WAREHOUSES ──
-- Each warehouse belongs to one company (1 company → N warehouses)
INSERT INTO warehouses (id, name, location, company_id) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'Warehouse 1', 'Main Yard', 'd715a70c-6bf7-41bf-bd82-6f0eec57b26d'),
  ('b0000000-0000-4000-8000-000000000002', 'Warehouse 2', 'North Depot', 'e52e9c2a-623c-4d49-87c0-51e1cadff60d'),
  ('b0000000-0000-4000-8000-000000000003', 'Warehouse 3', 'South Depot', '3082b68c-24cc-4940-ad97-f1c889cd41f3');

-- ============================================================
-- EQUAL ANGLE BARS (AB-001 to AB-075) — Category: Angle Bars
-- ============================================================
-- Source: PNS 657:2008 — Hot-rolled equal-leg angle bars
-- specs: {"size_mm": "...", "thickness_mm": ...}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, unit) VALUES
  -- 20 x 20
  ('AB-001', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"20 x 20","thickness_mm":2,"length_m":6,"kg_per_m":0.61,"weight_per_length":3.66}', 'pcs'),
  ('AB-002', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"20 x 20","thickness_mm":3,"length_m":6,"kg_per_m":0.88,"weight_per_length":5.28}', 'pcs'),
  -- 25 x 25
  ('AB-003', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"25 x 25","thickness_mm":2,"length_m":6,"kg_per_m":0.76,"weight_per_length":4.56}', 'pcs'),
  ('AB-004', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"25 x 25","thickness_mm":2.5,"length_m":6,"kg_per_m":0.94,"weight_per_length":5.64}', 'pcs'),
  ('AB-005', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"25 x 25","thickness_mm":3,"length_m":6,"kg_per_m":1.12,"weight_per_length":6.72}', 'pcs'),
  ('AB-006', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"25 x 25","thickness_mm":3.5,"length_m":6,"kg_per_m":1.29,"weight_per_length":7.74}', 'pcs'),
  ('AB-007', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"25 x 25","thickness_mm":4,"length_m":6,"kg_per_m":1.45,"weight_per_length":8.7}', 'pcs'),
  ('AB-008', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"25 x 25","thickness_mm":5,"length_m":6,"kg_per_m":1.78,"weight_per_length":10.68}', 'pcs'),
  ('AB-009', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"25 x 25","thickness_mm":6,"length_m":6,"kg_per_m":2.08,"weight_per_length":12.48}', 'pcs'),
  -- 30 x 30
  ('AB-010', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"30 x 30","thickness_mm":2,"length_m":6,"kg_per_m":0.93,"weight_per_length":5.58}', 'pcs'),
  ('AB-011', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"30 x 30","thickness_mm":3,"length_m":6,"kg_per_m":1.36,"weight_per_length":8.16}', 'pcs'),
  ('AB-012', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"30 x 30","thickness_mm":3.5,"length_m":6,"kg_per_m":1.57,"weight_per_length":9.42}', 'pcs'),
  ('AB-013', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"30 x 30","thickness_mm":4,"length_m":6,"kg_per_m":1.78,"weight_per_length":10.68}', 'pcs'),
  ('AB-014', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"30 x 30","thickness_mm":5,"length_m":6,"kg_per_m":2.18,"weight_per_length":13.08}', 'pcs'),
  ('AB-015', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"30 x 30","thickness_mm":6,"length_m":6,"kg_per_m":2.56,"weight_per_length":15.36}', 'pcs'),
  -- 35 x 35
  ('AB-016', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"35 x 35","thickness_mm":4,"length_m":6,"kg_per_m":2.09,"weight_per_length":12.54}', 'pcs'),
  ('AB-017', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"35 x 35","thickness_mm":5,"length_m":6,"kg_per_m":2.57,"weight_per_length":15.42}', 'pcs'),
  -- 38 x 38
  ('AB-018', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"38 x 38","thickness_mm":2,"length_m":6,"kg_per_m":1.19,"weight_per_length":7.14}', 'pcs'),
  ('AB-019', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"38 x 38","thickness_mm":2.5,"length_m":6,"kg_per_m":1.47,"weight_per_length":8.82}', 'pcs'),
  ('AB-020', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"38 x 38","thickness_mm":3,"length_m":6,"kg_per_m":1.75,"weight_per_length":10.5}', 'pcs'),
  ('AB-021', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"38 x 38","thickness_mm":3.5,"length_m":6,"kg_per_m":2.02,"weight_per_length":12.12}', 'pcs'),
  ('AB-022', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"38 x 38","thickness_mm":4,"length_m":6,"kg_per_m":2.29,"weight_per_length":13.74}', 'pcs'),
  ('AB-023', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"38 x 38","thickness_mm":4.5,"length_m":6,"kg_per_m":2.56,"weight_per_length":15.36}', 'pcs'),
  ('AB-024', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"38 x 38","thickness_mm":5,"length_m":6,"kg_per_m":2.82,"weight_per_length":16.92}', 'pcs'),
  ('AB-025', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"38 x 38","thickness_mm":6,"length_m":6,"kg_per_m":3.33,"weight_per_length":19.98}', 'pcs'),
  -- 50 x 50
  ('AB-026', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"50 x 50","thickness_mm":2.5,"length_m":6,"kg_per_m":1.95,"weight_per_length":11.7}', 'pcs'),
  ('AB-027', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"50 x 50","thickness_mm":3,"length_m":6,"kg_per_m":2.33,"weight_per_length":13.98}', 'pcs'),
  ('AB-028', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"50 x 50","thickness_mm":3.5,"length_m":6,"kg_per_m":2.69,"weight_per_length":16.14}', 'pcs'),
  ('AB-029', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"50 x 50","thickness_mm":4,"length_m":6,"kg_per_m":3.06,"weight_per_length":18.36}', 'pcs'),
  ('AB-030', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"50 x 50","thickness_mm":4.5,"length_m":6,"kg_per_m":3.41,"weight_per_length":20.46}', 'pcs'),
  ('AB-031', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"50 x 50","thickness_mm":5,"length_m":6,"kg_per_m":3.77,"weight_per_length":22.62}', 'pcs'),
  ('AB-032', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"50 x 50","thickness_mm":6,"length_m":6,"kg_per_m":4.47,"weight_per_length":26.82}', 'pcs'),
  ('AB-033', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"50 x 50","thickness_mm":7,"length_m":6,"kg_per_m":5.15,"weight_per_length":30.9}', 'pcs'),
  ('AB-034', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"50 x 50","thickness_mm":8,"length_m":6,"kg_per_m":5.82,"weight_per_length":34.92}', 'pcs'),
  ('AB-035', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"50 x 50","thickness_mm":9,"length_m":6,"kg_per_m":6.47,"weight_per_length":38.82}', 'pcs'),
  -- 63.5 x 63.5
  ('AB-036', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"63.5 x 63.5","thickness_mm":4,"length_m":6,"kg_per_m":3.9,"weight_per_length":23.4}', 'pcs'),
  ('AB-037', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"63.5 x 63.5","thickness_mm":4.5,"length_m":6,"kg_per_m":4.37,"weight_per_length":26.22}', 'pcs'),
  ('AB-038', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"63.5 x 63.5","thickness_mm":5,"length_m":6,"kg_per_m":4.83,"weight_per_length":28.98}', 'pcs'),
  ('AB-039', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"63.5 x 63.5","thickness_mm":6,"length_m":6,"kg_per_m":5.74,"weight_per_length":34.44}', 'pcs'),
  ('AB-040', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"63.5 x 63.5","thickness_mm":7,"length_m":6,"kg_per_m":6.64,"weight_per_length":39.84}', 'pcs'),
  ('AB-041', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"63.5 x 63.5","thickness_mm":8,"length_m":6,"kg_per_m":7.51,"weight_per_length":45.06}', 'pcs'),
  ('AB-042', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"63.5 x 63.5","thickness_mm":9,"length_m":6,"kg_per_m":8.38,"weight_per_length":50.28}', 'pcs'),
  ('AB-043', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"63.5 x 63.5","thickness_mm":11,"length_m":6,"kg_per_m":10.06,"weight_per_length":60.36}', 'pcs'),
  -- 75 x 75
  ('AB-044', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 75","thickness_mm":3.5,"length_m":6,"kg_per_m":4.09,"weight_per_length":24.54}', 'pcs'),
  ('AB-045', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 75","thickness_mm":4,"length_m":6,"kg_per_m":4.65,"weight_per_length":27.9}', 'pcs'),
  ('AB-046', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 75","thickness_mm":4.5,"length_m":6,"kg_per_m":5.21,"weight_per_length":31.26}', 'pcs'),
  ('AB-047', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 75","thickness_mm":5,"length_m":6,"kg_per_m":5.76,"weight_per_length":34.56}', 'pcs'),
  ('AB-048', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 75","thickness_mm":6,"length_m":6,"kg_per_m":6.85,"weight_per_length":41.1}', 'pcs'),
  ('AB-049', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 75","thickness_mm":7,"length_m":6,"kg_per_m":7.93,"weight_per_length":47.58}', 'pcs'),
  ('AB-050', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 75","thickness_mm":8,"length_m":6,"kg_per_m":8.99,"weight_per_length":53.94}', 'pcs'),
  ('AB-051', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 75","thickness_mm":9,"length_m":6,"kg_per_m":10.03,"weight_per_length":60.18}', 'pcs'),
  ('AB-052', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 75","thickness_mm":11,"length_m":6,"kg_per_m":12.07,"weight_per_length":72.42}', 'pcs'),
  -- 90 x 90
  ('AB-053', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"90 x 90","thickness_mm":7,"length_m":6,"kg_per_m":9.61,"weight_per_length":57.66}', 'pcs'),
  ('AB-054', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"90 x 90","thickness_mm":8,"length_m":6,"kg_per_m":10.9,"weight_per_length":65.4}', 'pcs'),
  ('AB-055', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"90 x 90","thickness_mm":9,"length_m":6,"kg_per_m":12.18,"weight_per_length":73.08}', 'pcs'),
  ('AB-056', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"90 x 90","thickness_mm":10,"length_m":6,"kg_per_m":13.45,"weight_per_length":80.7}', 'pcs'),
  -- 100 x 100
  ('AB-057', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"100 x 100","thickness_mm":5.5,"length_m":6,"kg_per_m":8.52,"weight_per_length":51.12}', 'pcs'),
  ('AB-058', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"100 x 100","thickness_mm":6,"length_m":6,"kg_per_m":9.26,"weight_per_length":55.56}', 'pcs'),
  ('AB-059', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"100 x 100","thickness_mm":7,"length_m":6,"kg_per_m":10.73,"weight_per_length":64.38}', 'pcs'),
  ('AB-060', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"100 x 100","thickness_mm":7.5,"length_m":6,"kg_per_m":11.45,"weight_per_length":68.7}', 'pcs'),
  ('AB-061', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"100 x 100","thickness_mm":8,"length_m":6,"kg_per_m":12.18,"weight_per_length":73.08}', 'pcs'),
  ('AB-062', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"100 x 100","thickness_mm":9,"length_m":6,"kg_per_m":13.62,"weight_per_length":81.72}', 'pcs'),
  ('AB-063', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"100 x 100","thickness_mm":10,"length_m":6,"kg_per_m":15.04,"weight_per_length":90.24}', 'pcs'),
  ('AB-064', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"100 x 100","thickness_mm":12,"length_m":6,"kg_per_m":17.83,"weight_per_length":106.98}', 'pcs'),
  -- 125 x 125
  ('AB-065', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"125 x 125","thickness_mm":8,"length_m":6,"kg_per_m":15.34,"weight_per_length":92.04}', 'pcs'),
  ('AB-066', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"125 x 125","thickness_mm":10,"length_m":6,"kg_per_m":18.98,"weight_per_length":113.88}', 'pcs'),
  ('AB-067', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"125 x 125","thickness_mm":12,"length_m":6,"kg_per_m":22.56,"weight_per_length":135.36}', 'pcs'),
  -- 150 x 150
  ('AB-068', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"150 x 150","thickness_mm":10,"length_m":6,"kg_per_m":22.98,"weight_per_length":137.88}', 'pcs'),
  ('AB-069', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"150 x 150","thickness_mm":12,"length_m":6,"kg_per_m":27.35,"weight_per_length":164.1}', 'pcs'),
  ('AB-070', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"150 x 150","thickness_mm":15,"length_m":6,"kg_per_m":33.77,"weight_per_length":202.62}', 'pcs'),
  -- 200 x 200
  ('AB-071', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"200 x 200","thickness_mm":16,"length_m":6,"kg_per_m":48.5,"weight_per_length":291}', 'pcs'),
  ('AB-072', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"200 x 200","thickness_mm":20,"length_m":6,"kg_per_m":59.93,"weight_per_length":359.58}', 'pcs'),
  ('AB-073', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"200 x 200","thickness_mm":24,"length_m":6,"kg_per_m":71.11,"weight_per_length":426.66}', 'pcs'),
  -- 250 x 250
  ('AB-074', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"250 x 250","thickness_mm":28,"length_m":6,"kg_per_m":104.02,"weight_per_length":624.12}', 'pcs'),
  ('AB-075', 'Equal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"250 x 250","thickness_mm":35,"length_m":6,"kg_per_m":128.03,"weight_per_length":768.18}', 'pcs');

-- ============================================================
-- UNEQUAL ANGLE BARS (UA-001 to UA-026) — Category: Angle Bars
-- ============================================================
-- specs: {"size_mm": "...", "thickness_mm": ...}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, unit) VALUES
  -- 50 x 75
  ('UA-001', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"50 x 75","thickness_mm":5,"length_m":6,"kg_per_m":4.67,"weight_per_length":28.02}', 'pcs'),
  ('UA-002', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"50 x 75","thickness_mm":6,"length_m":6,"kg_per_m":5.65,"weight_per_length":33.9}', 'pcs'),
  ('UA-003', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"50 x 75","thickness_mm":8,"length_m":6,"kg_per_m":7.39,"weight_per_length":44.34}', 'pcs'),
  -- 75 x 100
  ('UA-004', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 100","thickness_mm":6,"length_m":6,"kg_per_m":7.95,"weight_per_length":47.7}', 'pcs'),
  ('UA-005', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 100","thickness_mm":7,"length_m":6,"kg_per_m":9.23,"weight_per_length":55.38}', 'pcs'),
  ('UA-006', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 100","thickness_mm":8,"length_m":6,"kg_per_m":10.6,"weight_per_length":63.6}', 'pcs'),
  ('UA-007', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 100","thickness_mm":9,"length_m":6,"kg_per_m":11.73,"weight_per_length":70.38}', 'pcs'),
  ('UA-008', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 100","thickness_mm":10,"length_m":6,"kg_per_m":13,"weight_per_length":78}', 'pcs'),
  ('UA-009', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 100","thickness_mm":12,"length_m":6,"kg_per_m":15.4,"weight_per_length":92.4}', 'pcs'),
  -- 75 x 125
  ('UA-010', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 125","thickness_mm":7,"length_m":6,"kg_per_m":10.6,"weight_per_length":63.6}', 'pcs'),
  ('UA-011', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 125","thickness_mm":8,"length_m":6,"kg_per_m":12.2,"weight_per_length":73.2}', 'pcs'),
  ('UA-012', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 125","thickness_mm":9,"length_m":6,"kg_per_m":13.5,"weight_per_length":81}', 'pcs'),
  ('UA-013', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 125","thickness_mm":10,"length_m":6,"kg_per_m":15,"weight_per_length":90}', 'pcs'),
  ('UA-014', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 125","thickness_mm":12,"length_m":6,"kg_per_m":17.8,"weight_per_length":106.8}', 'pcs'),
  -- 75 x 150
  ('UA-015', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 150","thickness_mm":7,"length_m":6,"kg_per_m":10.6,"weight_per_length":63.6}', 'pcs'),
  ('UA-016', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 150","thickness_mm":8,"length_m":6,"kg_per_m":12.07,"weight_per_length":72.42}', 'pcs'),
  ('UA-017', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 150","thickness_mm":9,"length_m":6,"kg_per_m":15.4,"weight_per_length":92.4}', 'pcs'),
  ('UA-018', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 150","thickness_mm":10,"length_m":6,"kg_per_m":17,"weight_per_length":102}', 'pcs'),
  ('UA-019', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 150","thickness_mm":11,"length_m":6,"kg_per_m":17.72,"weight_per_length":106.32}', 'pcs'),
  ('UA-020', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 150","thickness_mm":12,"length_m":6,"kg_per_m":20.2,"weight_per_length":121.2}', 'pcs'),
  ('UA-021', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"75 x 150","thickness_mm":15,"length_m":6,"kg_per_m":24.8,"weight_per_length":148.8}', 'pcs'),
  -- 90 x 150
  ('UA-022', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"90 x 150","thickness_mm":8,"length_m":6,"kg_per_m":14.57,"weight_per_length":87.42}', 'pcs'),
  ('UA-023', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"90 x 150","thickness_mm":9,"length_m":6,"kg_per_m":16.32,"weight_per_length":97.92}', 'pcs'),
  ('UA-024', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"90 x 150","thickness_mm":10,"length_m":6,"kg_per_m":18.2,"weight_per_length":109.2}', 'pcs'),
  ('UA-025', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"90 x 150","thickness_mm":12,"length_m":6,"kg_per_m":21.6,"weight_per_length":129.6}', 'pcs'),
  ('UA-026', 'Unequal Angle', 'a0000000-0000-4000-8000-000000000001', '{"size_mm":"90 x 150","thickness_mm":15,"length_m":6,"kg_per_m":26.6,"weight_per_length":159.6}', 'pcs');

-- ============================================================
-- JIS CHANNEL BARS WITHOUT FLANGE THICKNESS (CB-001 to CB-024)
-- ============================================================
-- specs: {"size_mm": "...", "thickness_mm": ...}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, unit) VALUES
  ('CB-001', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"75 x 40","thickness_mm":3.75,"length_m":6,"kg_per_m":5.3,"weight_per_length":31.8}', 'pcs'),
  ('CB-002', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"75 x 40","thickness_mm":5,"length_m":6,"kg_per_m":6.92,"weight_per_length":41.52}', 'pcs'),
  ('CB-003', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"76 x 35","thickness_mm":3.7,"length_m":6,"kg_per_m":4.8,"weight_per_length":28.8}', 'pcs'),
  ('CB-004', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"76 x 35","thickness_mm":5,"length_m":6,"kg_per_m":6.1,"weight_per_length":36.6}', 'pcs'),
  ('CB-005', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"80 x 40","thickness_mm":4.65,"length_m":6,"kg_per_m":7.1,"weight_per_length":42.6}', 'pcs'),
  ('CB-006', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"100 x 46","thickness_mm":4.8,"length_m":6,"kg_per_m":8.52,"weight_per_length":51.12}', 'pcs'),
  ('CB-007', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"100 x 50","thickness_mm":4.25,"length_m":6,"kg_per_m":7.3,"weight_per_length":43.8}', 'pcs'),
  ('CB-008', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"100 x 50","thickness_mm":3.95,"length_m":6,"kg_per_m":7.5,"weight_per_length":45}', 'pcs'),
  ('CB-009', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"100 x 50","thickness_mm":5,"length_m":6,"kg_per_m":9.36,"weight_per_length":56.16}', 'pcs'),
  ('CB-010', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"100 x 50","thickness_mm":6,"length_m":6,"kg_per_m":10.6,"weight_per_length":63.6}', 'pcs'),
  ('CB-011', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"102 x 40","thickness_mm":4.2,"length_m":6,"kg_per_m":6.7,"weight_per_length":40.2}', 'pcs'),
  ('CB-012', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"102 x 40","thickness_mm":4.57,"length_m":6,"kg_per_m":8,"weight_per_length":48}', 'pcs'),
  ('CB-013', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"102 x 50","thickness_mm":8.13,"length_m":6,"kg_per_m":10.2,"weight_per_length":61.2}', 'pcs'),
  ('CB-014', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"118 x 50","thickness_mm":3.8,"length_m":6,"kg_per_m":8.16,"weight_per_length":48.96}', 'pcs'),
  ('CB-015', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"125 x 65","thickness_mm":4.64,"length_m":6,"kg_per_m":11.66,"weight_per_length":69.96}', 'pcs'),
  ('CB-016', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"125 x 65","thickness_mm":5.5,"length_m":6,"kg_per_m":12.91,"weight_per_length":77.46}', 'pcs'),
  ('CB-017', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"125 x 65","thickness_mm":6.02,"length_m":6,"kg_per_m":13.4,"weight_per_length":80.4}', 'pcs'),
  ('CB-018', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"127 x 58","thickness_mm":5,"length_m":6,"kg_per_m":12.3,"weight_per_length":73.8}', 'pcs'),
  ('CB-019', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"150 x 75","thickness_mm":4.86,"length_m":6,"kg_per_m":14.66,"weight_per_length":87.96}', 'pcs'),
  ('CB-020', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"150 x 75","thickness_mm":5.7,"length_m":6,"kg_per_m":16.7,"weight_per_length":100.2}', 'pcs'),
  ('CB-021', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"150 x 75","thickness_mm":6,"length_m":6,"kg_per_m":17.9,"weight_per_length":107.4}', 'pcs'),
  ('CB-022', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"150 x 75","thickness_mm":6,"length_m":6,"kg_per_m":18,"weight_per_length":108}', 'pcs'),
  ('CB-023', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"150 x 75","thickness_mm":6.35,"length_m":6,"kg_per_m":18.6,"weight_per_length":111.6}', 'pcs'),
  ('CB-024', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"150 x 75","thickness_mm":9,"length_m":6,"kg_per_m":24,"weight_per_length":144}', 'pcs');

-- ============================================================
-- JIS CHANNEL BARS WITH FLANGE THICKNESS (CB-025 to CB-054)
-- ============================================================
-- specs: {"size_mm": "...", "thickness_mm": ..., "flange_thickness_mm": ...}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, unit) VALUES
  ('CB-025', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"152 x 48","thickness_mm":5,"flange_thickness_mm":6.2,"length_m":6,"kg_per_m":10.7,"weight_per_length":64.2}', 'pcs'),
  ('CB-026', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"152 x 89","thickness_mm":7,"flange_thickness_mm":11.5,"length_m":6,"kg_per_m":23.9,"weight_per_length":143.4}', 'pcs'),
  ('CB-027', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"160 x 64","thickness_mm":5.5,"flange_thickness_mm":7.5,"length_m":6,"kg_per_m":14.2,"weight_per_length":85.2}', 'pcs'),
  ('CB-028', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"180 x 65","thickness_mm":5.05,"flange_thickness_mm":8.5,"length_m":6,"kg_per_m":16.3,"weight_per_length":97.8}', 'pcs'),
  ('CB-029', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"180 x 65","thickness_mm":5.15,"flange_thickness_mm":8.5,"length_m":6,"kg_per_m":17.4,"weight_per_length":104.4}', 'pcs'),
  ('CB-030', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"180 x 75","thickness_mm":7,"flange_thickness_mm":10.5,"length_m":6,"kg_per_m":21.4,"weight_per_length":128.4}', 'pcs'),
  ('CB-031', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"200 x 73","thickness_mm":6.5,"flange_thickness_mm":6.9,"length_m":6,"kg_per_m":18.8,"weight_per_length":112.8}', 'pcs'),
  ('CB-032', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"200 x 73","thickness_mm":7,"flange_thickness_mm":7.5,"length_m":6,"kg_per_m":19.69,"weight_per_length":118.14}', 'pcs'),
  ('CB-033', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"200 x 73","thickness_mm":6.3,"flange_thickness_mm":6.9,"length_m":6,"kg_per_m":20.373,"weight_per_length":122.238}', 'pcs'),
  ('CB-034', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"200 x 73","thickness_mm":8.1,"flange_thickness_mm":8.5,"length_m":6,"kg_per_m":22.637,"weight_per_length":135.822}', 'pcs'),
  ('CB-035', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"200 x 73","thickness_mm":6.5,"flange_thickness_mm":13,"length_m":6,"kg_per_m":23.3,"weight_per_length":139.8}', 'pcs'),
  ('CB-036', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"200 x 75","thickness_mm":8,"flange_thickness_mm":11,"length_m":6,"kg_per_m":25.1,"weight_per_length":150.6}', 'pcs'),
  ('CB-037', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"200 x 75","thickness_mm":8.2,"flange_thickness_mm":8.8,"length_m":6,"kg_per_m":25.78,"weight_per_length":154.68}', 'pcs'),
  ('CB-038', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"200 x 76","thickness_mm":5,"flange_thickness_mm":9.3,"length_m":6,"kg_per_m":18.4,"weight_per_length":110.4}', 'pcs'),
  ('CB-039', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"200 x 80","thickness_mm":7.5,"flange_thickness_mm":11,"length_m":6,"kg_per_m":24.6,"weight_per_length":147.6}', 'pcs'),
  ('CB-040', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"250 x 76","thickness_mm":5.9,"flange_thickness_mm":5.6,"length_m":6,"kg_per_m":23.3,"weight_per_length":139.8}', 'pcs'),
  ('CB-041', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"250 x 78","thickness_mm":7.2,"flange_thickness_mm":9.1,"length_m":6,"kg_per_m":25.3,"weight_per_length":151.8}', 'pcs'),
  ('CB-042', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"250 x 80","thickness_mm":8.56,"flange_thickness_mm":10.28,"length_m":6,"kg_per_m":29.76,"weight_per_length":178.56}', 'pcs'),
  ('CB-043', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"250 x 90","thickness_mm":8.15,"flange_thickness_mm":15.25,"length_m":6,"kg_per_m":35.5,"weight_per_length":213}', 'pcs'),
  ('CB-044', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"300 x 82","thickness_mm":6.6,"flange_thickness_mm":9.7,"length_m":6,"kg_per_m":34.47,"weight_per_length":206.82}', 'pcs'),
  ('CB-045', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"300 x 85","thickness_mm":6.7,"flange_thickness_mm":9.3,"length_m":6,"kg_per_m":31.017,"weight_per_length":186.102}', 'pcs'),
  ('CB-046', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"300 x 85","thickness_mm":8.6,"flange_thickness_mm":10.2,"length_m":6,"kg_per_m":34.4,"weight_per_length":206.4}', 'pcs'),
  ('CB-047', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"300 x 85","thickness_mm":10,"flange_thickness_mm":9.4,"length_m":6,"kg_per_m":39.1,"weight_per_length":234.6}', 'pcs'),
  ('CB-048', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"300 x 89","thickness_mm":10,"flange_thickness_mm":15.5,"length_m":6,"kg_per_m":43.88,"weight_per_length":263.28}', 'pcs'),
  ('CB-049', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"300 x 90","thickness_mm":9,"flange_thickness_mm":13,"length_m":6,"kg_per_m":41,"weight_per_length":246}', 'pcs'),
  ('CB-050', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"300 x 100","thickness_mm":10,"flange_thickness_mm":16.5,"length_m":6,"kg_per_m":46.2,"weight_per_length":277.2}', 'pcs'),
  ('CB-051', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"360 x 98","thickness_mm":10.8,"flange_thickness_mm":15.3,"length_m":6,"kg_per_m":53.466,"weight_per_length":320.796}', 'pcs'),
  ('CB-052', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"380 x 100","thickness_mm":9.6,"flange_thickness_mm":17.4,"length_m":6,"kg_per_m":54,"weight_per_length":324}', 'pcs'),
  ('CB-053', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"381 x 86","thickness_mm":10.16,"flange_thickness_mm":16.51,"length_m":6,"kg_per_m":50.4,"weight_per_length":302.4}', 'pcs'),
  ('CB-054', 'Channel Bar', 'a0000000-0000-4000-8000-000000000002', '{"size_mm":"400 x 100","thickness_mm":9.6,"flange_thickness_mm":17.4,"length_m":6,"kg_per_m":57,"weight_per_length":342}', 'pcs');

-- ============================================================
-- ASTM CHANNEL BARS WITH FLANGE THICKNESS + WEIGHT_PER_20FT
-- (CB-055 to CB-083)
-- ============================================================
-- specs: {"size_inch": "...", "mass_lbs_per_ft": ..., "thickness_mm": ..., "flange_thickness_mm": ..., "height_mm": ..., "flange_width_mm": ..., "weight_per_20ft": ...}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, unit) VALUES
  ('CB-055', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"3 x 1-3/8","mass_lbs_per_ft":4.1,"thickness_mm":4.32,"flange_thickness_mm":6.93,"height_mm":76.2,"flange_width_mm":34.9,"weight_per_20ft":82,"length_m":6,"kg_per_m":6.198,"weight_per_length":37.19}', 'pcs'),
  ('CB-056', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"3 x 1-1/2","mass_lbs_per_ft":5,"thickness_mm":6.93,"flange_thickness_mm":6.93,"height_mm":76.2,"flange_width_mm":38.1,"weight_per_20ft":100,"length_m":6,"kg_per_m":7.558,"weight_per_length":45.35}', 'pcs'),
  ('CB-057', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"3 x 1-5/8","mass_lbs_per_ft":6,"thickness_mm":9.04,"flange_thickness_mm":6.93,"height_mm":76.2,"flange_width_mm":41.3,"weight_per_20ft":120,"length_m":6,"kg_per_m":9.07,"weight_per_length":54.42}', 'pcs'),
  ('CB-058', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"4 x 1-5/8","mass_lbs_per_ft":5.4,"thickness_mm":4.57,"flange_thickness_mm":7.52,"height_mm":101.6,"flange_width_mm":40.2,"weight_per_20ft":108,"length_m":6,"kg_per_m":8.163,"weight_per_length":48.98}', 'pcs'),
  ('CB-059', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"4 x 1-1/2","mass_lbs_per_ft":6.25,"thickness_mm":6.27,"flange_thickness_mm":7.52,"height_mm":101.6,"flange_width_mm":41.8,"weight_per_20ft":125,"length_m":6,"kg_per_m":9.448,"weight_per_length":56.69}', 'pcs'),
  ('CB-060', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"4 x 1-3/4","mass_lbs_per_ft":7.25,"thickness_mm":8.13,"flange_thickness_mm":7.52,"height_mm":101.6,"flange_width_mm":43.7,"weight_per_20ft":145,"length_m":6,"kg_per_m":10.96,"weight_per_length":65.76}', 'pcs'),
  ('CB-061', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"5 x 1-3/4","mass_lbs_per_ft":6.7,"thickness_mm":4.83,"flange_thickness_mm":8.13,"height_mm":127,"flange_width_mm":44.5,"weight_per_20ft":134,"length_m":6,"kg_per_m":10.128,"weight_per_length":60.77}', 'pcs'),
  ('CB-062', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"5 x 1-7/8","mass_lbs_per_ft":9,"thickness_mm":8.26,"flange_thickness_mm":8.13,"height_mm":127,"flange_width_mm":47.9,"weight_per_20ft":180,"length_m":6,"kg_per_m":13.605,"weight_per_length":81.63}', 'pcs'),
  ('CB-063', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"5 x 2-1/2","mass_lbs_per_ft":11.5,"thickness_mm":11.99,"flange_thickness_mm":8.13,"height_mm":127,"flange_width_mm":51.6,"weight_per_20ft":230,"length_m":6,"kg_per_m":17.385,"weight_per_length":104.31}', 'pcs'),
  ('CB-064', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"6 x 1-5/8","mass_lbs_per_ft":8.2,"thickness_mm":5.08,"flange_thickness_mm":8.71,"height_mm":152.4,"flange_width_mm":48.8,"weight_per_20ft":164,"length_m":6,"kg_per_m":12.397,"weight_per_length":74.38}', 'pcs'),
  ('CB-065', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"6 x 2","mass_lbs_per_ft":10.5,"thickness_mm":7.98,"flange_thickness_mm":8.71,"height_mm":152.4,"flange_width_mm":51.7,"weight_per_20ft":210,"length_m":6,"kg_per_m":15.873,"weight_per_length":95.24}', 'pcs'),
  ('CB-066', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"6 x 2-1/8","mass_lbs_per_ft":13,"thickness_mm":11.1,"flange_thickness_mm":8.71,"height_mm":152.4,"flange_width_mm":54.8,"weight_per_20ft":260,"length_m":6,"kg_per_m":19.652,"weight_per_length":117.91}', 'pcs'),
  ('CB-067', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"6 x 3","mass_lbs_per_ft":16,"thickness_mm":9.53,"flange_thickness_mm":12.07,"height_mm":152.4,"flange_width_mm":57.5,"weight_per_20ft":320,"length_m":6,"kg_per_m":24.187,"weight_per_length":145.12}', 'pcs'),
  ('CB-068', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"7 x 2-1/4","mass_lbs_per_ft":12.25,"thickness_mm":7.98,"flange_thickness_mm":9.3,"height_mm":177.8,"flange_width_mm":55.7,"weight_per_20ft":245,"length_m":6,"kg_per_m":18.518,"weight_per_length":111.11}', 'pcs'),
  ('CB-069', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"7 x 2-1/4","mass_lbs_per_ft":14.75,"thickness_mm":10.64,"flange_thickness_mm":9.3,"height_mm":177.8,"flange_width_mm":58.4,"weight_per_20ft":295,"length_m":6,"kg_per_m":22.298,"weight_per_length":133.79}', 'pcs'),
  ('CB-070', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"8 x 2-1/4","mass_lbs_per_ft":11.5,"thickness_mm":5.65,"flange_thickness_mm":10,"height_mm":203.2,"flange_width_mm":57.4,"weight_per_20ft":230,"length_m":6,"kg_per_m":17.385,"weight_per_length":104.31}', 'pcs'),
  ('CB-071', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"8 x 2-1/4","mass_lbs_per_ft":18.75,"thickness_mm":12.37,"flange_thickness_mm":9.91,"height_mm":203.2,"flange_width_mm":64.2,"weight_per_20ft":375,"length_m":6,"kg_per_m":28.345,"weight_per_length":170.07}', 'pcs'),
  ('CB-072', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"8 x 2-1/2","mass_lbs_per_ft":13.75,"thickness_mm":7.54,"flange_thickness_mm":12.75,"height_mm":203.2,"flange_width_mm":59.5,"weight_per_20ft":275,"length_m":6,"kg_per_m":20.787,"weight_per_length":124.72}', 'pcs'),
  ('CB-073', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"8 x 3","mass_lbs_per_ft":16.25,"thickness_mm":10.03,"flange_thickness_mm":9.91,"height_mm":203.2,"flange_width_mm":61.8,"weight_per_20ft":325,"length_m":6,"kg_per_m":24.565,"weight_per_length":147.39}', 'pcs'),
  ('CB-074', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"10 x 2-1/2","mass_lbs_per_ft":15.3,"thickness_mm":6.1,"flange_thickness_mm":11.07,"height_mm":254,"flange_width_mm":66,"weight_per_20ft":306,"length_m":6,"kg_per_m":23.13,"weight_per_length":138.78}', 'pcs'),
  ('CB-075', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"10 x 2-3/4","mass_lbs_per_ft":20,"thickness_mm":9.45,"flange_thickness_mm":13.4,"height_mm":254,"flange_width_mm":69.6,"weight_per_20ft":400,"length_m":6,"kg_per_m":30.235,"weight_per_length":181.41}', 'pcs'),
  ('CB-076', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"10 x 2-3/4","mass_lbs_per_ft":25,"thickness_mm":12.9,"flange_thickness_mm":14.7,"height_mm":254,"flange_width_mm":73.3,"weight_per_20ft":500,"length_m":6,"kg_per_m":37.793,"weight_per_length":226.76}', 'pcs'),
  ('CB-077', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"10 x 3","mass_lbs_per_ft":30,"thickness_mm":12.95,"flange_thickness_mm":15.1,"height_mm":254,"flange_width_mm":77,"weight_per_20ft":600,"length_m":6,"kg_per_m":45.352,"weight_per_length":272.11}', 'pcs'),
  ('CB-078', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"12 x 3","mass_lbs_per_ft":20.7,"thickness_mm":7.6,"flange_thickness_mm":12.5,"height_mm":304.8,"flange_width_mm":74.7,"weight_per_20ft":414,"length_m":6,"kg_per_m":31.293,"weight_per_length":187.76}', 'pcs'),
  ('CB-079', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"12 x 3","mass_lbs_per_ft":25,"thickness_mm":9.65,"flange_thickness_mm":15.1,"height_mm":304.8,"flange_width_mm":77.4,"weight_per_20ft":500,"length_m":6,"kg_per_m":37.793,"weight_per_length":226.76}', 'pcs'),
  ('CB-080', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"12 x 3","mass_lbs_per_ft":30,"thickness_mm":12.82,"flange_thickness_mm":16.1,"height_mm":304.8,"flange_width_mm":80.5,"weight_per_20ft":600,"length_m":6,"kg_per_m":45.352,"weight_per_length":272.11}', 'pcs'),
  ('CB-081', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"15 x 3-1/2","mass_lbs_per_ft":40,"thickness_mm":13.18,"flange_thickness_mm":19.1,"height_mm":381,"flange_width_mm":89.4,"weight_per_20ft":800,"length_m":6,"kg_per_m":60.468,"weight_per_length":362.81}', 'pcs'),
  ('CB-082', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"15 x 3-3/4","mass_lbs_per_ft":33.9,"thickness_mm":10.16,"flange_thickness_mm":16.51,"height_mm":381,"flange_width_mm":86.4,"weight_per_20ft":678,"length_m":6,"kg_per_m":51.247,"weight_per_length":307.48}', 'pcs'),
  ('CB-083', 'Channel Bar ASTM', 'a0000000-0000-4000-8000-000000000002', '{"size_inch":"15 x 3-3/4","mass_lbs_per_ft":50,"thickness_mm":17.96,"flange_thickness_mm":19.95,"height_mm":381,"flange_width_mm":94.4,"weight_per_20ft":1000,"length_m":6,"kg_per_m":75.585,"weight_per_length":453.51}', 'pcs');

-- ============================================================
-- DEFORMED BARS GR40 (DB-001 to DB-025)
-- ============================================================
-- specs: {"size_mm": "..."}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, unit) VALUES
  -- 10mm Gr40
  ('DB-001', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":6,"kg_per_m":0.616,"weight_per_length":3.696}', 'pcs'),
  ('DB-002', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":7.5,"kg_per_m":0.616,"weight_per_length":4.62}', 'pcs'),
  ('DB-003', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":9,"kg_per_m":0.616,"weight_per_length":5.544}', 'pcs'),
  ('DB-004', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":10.5,"kg_per_m":0.616,"weight_per_length":6.468}', 'pcs'),
  ('DB-005', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":12,"kg_per_m":0.616,"weight_per_length":7.392}', 'pcs'),
  -- 12mm Gr40
  ('DB-006', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":6,"kg_per_m":0.888,"weight_per_length":5.328}', 'pcs'),
  ('DB-007', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":7.5,"kg_per_m":0.888,"weight_per_length":6.66}', 'pcs'),
  ('DB-008', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":9,"kg_per_m":0.888,"weight_per_length":7.992}', 'pcs'),
  ('DB-009', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":10.5,"kg_per_m":0.888,"weight_per_length":9.324}', 'pcs'),
  ('DB-010', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":12,"kg_per_m":0.888,"weight_per_length":10.656}', 'pcs'),
  -- 16mm Gr40
  ('DB-011', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":6,"kg_per_m":1.578,"weight_per_length":9.468}', 'pcs'),
  ('DB-012', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":7.5,"kg_per_m":1.578,"weight_per_length":11.835}', 'pcs'),
  ('DB-013', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":9,"kg_per_m":1.578,"weight_per_length":14.202}', 'pcs'),
  ('DB-014', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":10.5,"kg_per_m":1.578,"weight_per_length":16.569}', 'pcs'),
  ('DB-015', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":12,"kg_per_m":1.578,"weight_per_length":18.936}', 'pcs'),
  -- 20mm Gr40
  ('DB-016', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":6,"kg_per_m":2.466,"weight_per_length":14.796}', 'pcs'),
  ('DB-017', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":7.5,"kg_per_m":2.466,"weight_per_length":18.495}', 'pcs'),
  ('DB-018', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":9,"kg_per_m":2.466,"weight_per_length":22.194}', 'pcs'),
  ('DB-019', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":10.5,"kg_per_m":2.466,"weight_per_length":25.893}', 'pcs'),
  ('DB-020', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":12,"kg_per_m":2.466,"weight_per_length":29.592}', 'pcs'),
  -- 25mm Gr40
  ('DB-021', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":6,"kg_per_m":3.853,"weight_per_length":23.118}', 'pcs'),
  ('DB-022', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":7.5,"kg_per_m":3.853,"weight_per_length":28.898}', 'pcs'),
  ('DB-023', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":9,"kg_per_m":3.853,"weight_per_length":34.677}', 'pcs'),
  ('DB-024', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":10.5,"kg_per_m":3.853,"weight_per_length":40.457}', 'pcs'),
  ('DB-025', 'Deformed Bar Gr40', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":12,"kg_per_m":3.853,"weight_per_length":46.236}', 'pcs');

-- ============================================================
-- DEFORMED BARS GR60 (DB-026 to DB-065)
-- ============================================================
-- specs: {"size_mm": "..."}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, unit) VALUES
  -- 10mm Gr60
  ('DB-026', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":6,"kg_per_m":0.616,"weight_per_length":3.696}', 'pcs'),
  ('DB-027', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":7.5,"kg_per_m":0.616,"weight_per_length":4.62}', 'pcs'),
  ('DB-028', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":9,"kg_per_m":0.616,"weight_per_length":5.544}', 'pcs'),
  ('DB-029', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":10.5,"kg_per_m":0.616,"weight_per_length":6.468}', 'pcs'),
  ('DB-030', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":12,"kg_per_m":0.616,"weight_per_length":7.392}', 'pcs'),
  -- 12mm Gr60
  ('DB-031', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":6,"kg_per_m":0.888,"weight_per_length":5.328}', 'pcs'),
  ('DB-032', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":7.5,"kg_per_m":0.888,"weight_per_length":6.66}', 'pcs'),
  ('DB-033', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":9,"kg_per_m":0.888,"weight_per_length":7.992}', 'pcs'),
  ('DB-034', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":10.5,"kg_per_m":0.888,"weight_per_length":9.324}', 'pcs'),
  ('DB-035', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":12,"kg_per_m":0.888,"weight_per_length":10.656}', 'pcs'),
  -- 16mm Gr60
  ('DB-036', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":6,"kg_per_m":1.578,"weight_per_length":9.468}', 'pcs'),
  ('DB-037', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":7.5,"kg_per_m":1.578,"weight_per_length":11.835}', 'pcs'),
  ('DB-038', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":9,"kg_per_m":1.578,"weight_per_length":14.202}', 'pcs'),
  ('DB-039', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":10.5,"kg_per_m":1.578,"weight_per_length":16.569}', 'pcs'),
  ('DB-040', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":12,"kg_per_m":1.578,"weight_per_length":18.936}', 'pcs'),
  -- 20mm Gr60
  ('DB-041', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":6,"kg_per_m":2.466,"weight_per_length":14.796}', 'pcs'),
  ('DB-042', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":7.5,"kg_per_m":2.466,"weight_per_length":18.495}', 'pcs'),
  ('DB-043', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":9,"kg_per_m":2.466,"weight_per_length":22.194}', 'pcs'),
  ('DB-044', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":10.5,"kg_per_m":2.466,"weight_per_length":25.893}', 'pcs'),
  ('DB-045', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":12,"kg_per_m":2.466,"weight_per_length":29.592}', 'pcs'),
  -- 25mm Gr60
  ('DB-046', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":6,"kg_per_m":3.853,"weight_per_length":23.118}', 'pcs'),
  ('DB-047', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":7.5,"kg_per_m":3.853,"weight_per_length":28.898}', 'pcs'),
  ('DB-048', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":9,"kg_per_m":3.853,"weight_per_length":34.677}', 'pcs'),
  ('DB-049', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":10.5,"kg_per_m":3.853,"weight_per_length":40.457}', 'pcs'),
  ('DB-050', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":12,"kg_per_m":3.853,"weight_per_length":46.236}', 'pcs'),
  -- 28mm Gr60
  ('DB-051', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"28","length_m":6,"kg_per_m":4.834,"weight_per_length":29.004}', 'pcs'),
  ('DB-052', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"28","length_m":7.5,"kg_per_m":4.834,"weight_per_length":36.255}', 'pcs'),
  ('DB-053', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"28","length_m":9,"kg_per_m":4.834,"weight_per_length":43.506}', 'pcs'),
  ('DB-054', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"28","length_m":10.5,"kg_per_m":4.834,"weight_per_length":50.757}', 'pcs'),
  ('DB-055', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"28","length_m":12,"kg_per_m":4.834,"weight_per_length":58.008}', 'pcs'),
  -- 32mm Gr60
  ('DB-056', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"32","length_m":6,"kg_per_m":6.313,"weight_per_length":37.878}', 'pcs'),
  ('DB-057', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"32","length_m":7.5,"kg_per_m":6.313,"weight_per_length":47.348}', 'pcs'),
  ('DB-058', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"32","length_m":9,"kg_per_m":6.313,"weight_per_length":56.817}', 'pcs'),
  ('DB-059', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"32","length_m":10.5,"kg_per_m":6.313,"weight_per_length":66.287}', 'pcs'),
  ('DB-060', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"32","length_m":12,"kg_per_m":6.313,"weight_per_length":75.756}', 'pcs'),
  -- 36mm Gr60
  ('DB-061', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"36","length_m":6,"kg_per_m":7.99,"weight_per_length":47.94}', 'pcs'),
  ('DB-062', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"36","length_m":7.5,"kg_per_m":7.99,"weight_per_length":59.925}', 'pcs'),
  ('DB-063', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"36","length_m":9,"kg_per_m":7.99,"weight_per_length":71.91}', 'pcs'),
  ('DB-064', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"36","length_m":10.5,"kg_per_m":7.99,"weight_per_length":83.895}', 'pcs'),
  ('DB-065', 'Deformed Bar Gr60', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"36","length_m":12,"kg_per_m":7.99,"weight_per_length":95.88}', 'pcs');

-- ============================================================
-- DEFORMED BARS GR33 (DB-066 to DB-090)
-- ============================================================
-- Source: PNS 49 — Philippine National Standard
-- specs: {"size_mm": "..."}
-- 5 diameters × 5 lengths = 25 products
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, unit) VALUES
  -- 10mm Gr33 (kg/m = 0.616)
  ('DB-066', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":6,"kg_per_m":0.616,"weight_per_length":3.696}', 'pcs'),
  ('DB-067', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":7.5,"kg_per_m":0.616,"weight_per_length":4.62}', 'pcs'),
  ('DB-068', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":9,"kg_per_m":0.616,"weight_per_length":5.544}', 'pcs'),
  ('DB-069', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":10.5,"kg_per_m":0.616,"weight_per_length":6.468}', 'pcs'),
  ('DB-070', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"10","length_m":12,"kg_per_m":0.616,"weight_per_length":7.392}', 'pcs'),
  -- 12mm Gr33 (kg/m = 0.888)
  ('DB-071', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":6,"kg_per_m":0.888,"weight_per_length":5.328}', 'pcs'),
  ('DB-072', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":7.5,"kg_per_m":0.888,"weight_per_length":6.66}', 'pcs'),
  ('DB-073', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":9,"kg_per_m":0.888,"weight_per_length":7.992}', 'pcs'),
  ('DB-074', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":10.5,"kg_per_m":0.888,"weight_per_length":9.324}', 'pcs'),
  ('DB-075', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"12","length_m":12,"kg_per_m":0.888,"weight_per_length":10.656}', 'pcs'),
  -- 16mm Gr33 (kg/m = 1.578)
  ('DB-076', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":6,"kg_per_m":1.578,"weight_per_length":9.468}', 'pcs'),
  ('DB-077', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":7.5,"kg_per_m":1.578,"weight_per_length":11.835}', 'pcs'),
  ('DB-078', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":9,"kg_per_m":1.578,"weight_per_length":14.202}', 'pcs'),
  ('DB-079', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":10.5,"kg_per_m":1.578,"weight_per_length":16.569}', 'pcs'),
  ('DB-080', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"16","length_m":12,"kg_per_m":1.578,"weight_per_length":18.936}', 'pcs'),
  -- 20mm Gr33 (kg/m = 2.466)
  ('DB-081', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":6,"kg_per_m":2.466,"weight_per_length":14.796}', 'pcs'),
  ('DB-082', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":7.5,"kg_per_m":2.466,"weight_per_length":18.495}', 'pcs'),
  ('DB-083', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":9,"kg_per_m":2.466,"weight_per_length":22.198}', 'pcs'),
  ('DB-084', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":10.5,"kg_per_m":2.466,"weight_per_length":25.893}', 'pcs'),
  ('DB-085', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"20","length_m":12,"kg_per_m":2.466,"weight_per_length":29.592}', 'pcs'),
  -- 25mm Gr33 (kg/m = 3.853)
  ('DB-086', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":6,"kg_per_m":3.853,"weight_per_length":23.118}', 'pcs'),
  ('DB-087', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":7.5,"kg_per_m":3.853,"weight_per_length":28.898}', 'pcs'),
  ('DB-088', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":9,"kg_per_m":3.853,"weight_per_length":34.677}', 'pcs'),
  ('DB-089', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":10.5,"kg_per_m":3.853,"weight_per_length":40.457}', 'pcs'),
  ('DB-090', 'Deformed Bar Gr33', 'a0000000-0000-4000-8000-000000000003', '{"size_mm":"25","length_m":12,"kg_per_m":3.853,"weight_per_length":46.236}', 'pcs');

-- ============================================================
-- FLAT BARS (FB-001 to FB-170) — Category: Flat Bars
-- ============================================================
-- specs: {"size_inch": "...", "thickness_mm": ...}
-- All 6.0m length, unit = pcs
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, unit)
SELECT v.sku, 'Flat Bar ASTM', 'a0000000-0000-4000-8000-000000000004',
  jsonb_build_object('size_inch', v.size_inch, 'thickness_mm', v.thickness_mm, 'length_m', 6.0),
  'pcs'
FROM (VALUES
  ('FB-001','2',4.5),('FB-002','2',6.0),('FB-003','2',8.0),('FB-004','2',9.0),('FB-005','2',10.0),
  ('FB-006','2',12.0),('FB-007','2',15.0),('FB-008','2',18.0),('FB-009','2',20.0),('FB-010','2',24.0),
  ('FB-011','3',4.5),('FB-012','3',6.0),('FB-013','3',8.0),('FB-014','3',9.0),('FB-015','3',10.0),
  ('FB-016','3',12.0),('FB-017','3',15.0),('FB-018','3',18.0),('FB-019','3',20.0),('FB-020','3',24.0),
  ('FB-021','4',4.5),('FB-022','4',6.0),('FB-023','4',8.0),('FB-024','4',9.0),('FB-025','4',10.0),
  ('FB-026','4',12.0),('FB-027','4',15.0),('FB-028','4',18.0),('FB-029','4',20.0),('FB-030','4',24.0),
  ('FB-031','5',4.5),('FB-032','5',6.0),('FB-033','5',8.0),('FB-034','5',9.0),('FB-035','5',10.0),
  ('FB-036','5',12.0),('FB-037','5',15.0),('FB-038','5',18.0),('FB-039','5',20.0),('FB-040','5',24.0),
  ('FB-041','6',4.5),('FB-042','6',6.0),('FB-043','6',8.0),('FB-044','6',9.0),('FB-045','6',10.0),
  ('FB-046','6',12.0),('FB-047','6',15.0),('FB-048','6',18.0),('FB-049','6',20.0),('FB-050','6',24.0),
  ('FB-051','7',4.5),('FB-052','7',6.0),('FB-053','7',8.0),('FB-054','7',9.0),('FB-055','7',10.0),
  ('FB-056','7',12.0),('FB-057','7',15.0),('FB-058','7',18.0),('FB-059','7',20.0),('FB-060','7',24.0),
  ('FB-061','8',4.5),('FB-062','8',6.0),('FB-063','8',8.0),('FB-064','8',9.0),('FB-065','8',10.0),
  ('FB-066','8',12.0),('FB-067','8',15.0),('FB-068','8',18.0),('FB-069','8',20.0),('FB-070','8',24.0),
  ('FB-071','9',4.5),('FB-072','9',6.0),('FB-073','9',8.0),('FB-074','9',9.0),('FB-075','9',10.0),
  ('FB-076','9',12.0),('FB-077','9',15.0),('FB-078','9',18.0),('FB-079','9',20.0),('FB-080','9',24.0),
  ('FB-081','10',4.5),('FB-082','10',6.0),('FB-083','10',8.0),('FB-084','10',9.0),('FB-085','10',10.0),
  ('FB-086','10',12.0),('FB-087','10',15.0),('FB-088','10',18.0),('FB-089','10',20.0),('FB-090','10',24.0),
  ('FB-091','11',4.5),('FB-092','11',6.0),('FB-093','11',8.0),('FB-094','11',9.0),('FB-095','11',10.0),
  ('FB-096','11',12.0),('FB-097','11',15.0),('FB-098','11',18.0),('FB-099','11',20.0),('FB-100','11',24.0),
  ('FB-101','12',4.5),('FB-102','12',6.0),('FB-103','12',8.0),('FB-104','12',9.0),('FB-105','12',10.0),
  ('FB-106','12',12.0),('FB-107','12',15.0),('FB-108','12',18.0),('FB-109','12',20.0),('FB-110','12',24.0),
  ('FB-111','13',4.5),('FB-112','13',6.0),('FB-113','13',8.0),('FB-114','13',9.0),('FB-115','13',10.0),
  ('FB-116','13',12.0),('FB-117','13',15.0),('FB-118','13',18.0),('FB-119','13',20.0),('FB-120','13',24.0),
  ('FB-121','14',4.5),('FB-122','14',6.0),('FB-123','14',8.0),('FB-124','14',9.0),('FB-125','14',10.0),
  ('FB-126','14',12.0),('FB-127','14',15.0),('FB-128','14',18.0),('FB-129','14',20.0),('FB-130','14',24.0),
  ('FB-131','15',4.5),('FB-132','15',6.0),('FB-133','15',8.0),('FB-134','15',9.0),('FB-135','15',10.0),
  ('FB-136','15',12.0),('FB-137','15',15.0),('FB-138','15',18.0),('FB-139','15',20.0),('FB-140','15',24.0),
  ('FB-141','16',4.5),('FB-142','16',6.0),('FB-143','16',8.0),('FB-144','16',9.0),('FB-145','16',10.0),
  ('FB-146','16',12.0),('FB-147','16',15.0),('FB-148','16',18.0),('FB-149','16',20.0),('FB-150','16',24.0),
  ('FB-151','18',4.5),('FB-152','18',6.0),('FB-153','18',8.0),('FB-154','18',9.0),('FB-155','18',10.0),
  ('FB-156','18',12.0),('FB-157','18',15.0),('FB-158','18',18.0),('FB-159','18',20.0),('FB-160','18',24.0),
  ('FB-161','20',4.5),('FB-162','20',6.0),('FB-163','20',8.0),('FB-164','20',9.0),('FB-165','20',10.0),
  ('FB-166','20',12.0),('FB-167','20',15.0),('FB-168','20',18.0),('FB-169','20',20.0),('FB-170','20',24.0)
) AS v(sku, size_inch, thickness_mm)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- HEAVY GAUGE PIPES (PI-001 to PI-019) — Category: Pipes
-- ============================================================
-- specs: {"size_inch": "...", "od_mm": ..., "thickness_mm": ...}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, unit)
SELECT v.sku, v.name, 'a0000000-0000-4000-8000-000000000005',
  jsonb_build_object('size_inch', v.size_inch, 'od_mm', v.od_mm, 'thickness_mm', v.thickness_mm, 'length_m', 6.0),
  'pcs'
FROM (VALUES
  ('PI-001','Heavy Gauge Pipe','1/2',21.3,2.80),
  ('PI-002','Heavy Gauge Pipe','3/4',26.7,2.90),
  ('PI-003','Heavy Gauge Pipe','1',33.4,3.40),
  ('PI-004','Heavy Gauge Pipe','1 1/4',42.2,3.60),
  ('PI-005','Heavy Gauge Pipe','1 1/2',48.3,3.70),
  ('PI-006','Heavy Gauge Pipe','2',60.3,4.00),
  ('PI-007','Heavy Gauge Pipe','2 1/2',73.0,5.20),
  ('PI-008','Heavy Gauge Pipe','3',88.9,5.50),
  ('PI-009','Heavy Gauge Pipe','4',114.3,6.00),
  ('PI-010','Heavy Gauge Pipe','5',141.3,6.60),
  ('PI-011','Heavy Gauge Pipe','6',168.3,7.10),
  ('PI-012','Heavy Gauge Pipe','8',219.1,8.20),
  ('PI-013','Heavy Gauge Pipe','10',273.0,9.30),
  ('PI-014','Heavy Gauge Pipe','12',323.8,10.30),
  ('PI-015','Heavy Gauge Pipe ASTM','14',355.60,11.13),
  ('PI-016','Heavy Gauge Pipe ASTM','16',406.40,12.70),
  ('PI-017','Heavy Gauge Pipe ASTM','18',457.00,14.27),
  ('PI-018','Heavy Gauge Pipe ASTM','20',508.00,15.09),
  ('PI-019','Heavy Gauge Pipe ASTM','24',610.00,17.48)
) AS v(sku, name, size_inch, od_mm, thickness_mm)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- SEAMLESS PIPES (PI-020 to PI-074) — Category: Pipes
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, unit)
SELECT v.sku, v.name, 'a0000000-0000-4000-8000-000000000005',
  jsonb_build_object('size_inch', v.size_inch, 'od_mm', v.od_mm, 'thickness_mm', v.thickness_mm, 'length_m', 6.0),
  'length'
FROM (VALUES
  ('PI-020','Seamless Pipe','3/8',17.145,2.311),
  ('PI-021','Seamless Pipe','1/2',21.336,2.77),
  ('PI-022','Seamless Pipe','3/4',26.67,2.87),
  ('PI-023','Seamless Pipe','1',33.4,3.378),
  ('PI-024','Seamless Pipe','1 1/4',42.2,3.56),
  ('PI-025','Seamless Pipe','1 1/2',48.2,3.68),
  ('PI-026','Seamless Pipe','2',60.3,3.91),
  ('PI-027','Seamless Pipe','2 1/2',73.0,5.16),
  ('PI-028','Seamless Pipe','3',88.9,5.49),
  ('PI-029','Seamless Pipe','3 1/2',101.6,5.74),
  ('PI-030','Seamless Pipe','4',114.3,6.02),
  ('PI-031','Seamless Pipe','5',141.2,6.55),
  ('PI-032','Seamless Pipe','6',168.8,7.11),
  ('PI-033','Seamless Pipe','8',219.1,8.18),
  ('PI-034','Seamless Pipe','10',273.0,9.27),
  ('PI-035','Seamless Pipe','12',323.8,10.31),
  ('PI-036','Seamless Pipe','14',355.6,11.13),
  ('PI-037','Seamless Pipe','16',406.4,12.70),
  ('PI-038','Seamless Pipe','18',457.2,14.27),
  ('PI-039','Seamless Pipe','20',508.01,15.06),
  ('PI-040','Seamless Pipe','24',609.6,17.48),
  ('PI-041','Seamless Pipe S80','3/8',17.145,3.20),
  ('PI-042','Seamless Pipe S80','1/2',21.336,3.73),
  ('PI-043','Seamless Pipe S80','3/4',26.67,3.91),
  ('PI-044','Seamless Pipe S80','1',33.4,4.55),
  ('PI-045','Seamless Pipe S80','1 1/4',42.2,4.85),
  ('PI-046','Seamless Pipe S80','1 1/2',48.2,5.08),
  ('PI-047','Seamless Pipe S80','2',60.3,5.54),
  ('PI-048','Seamless Pipe S80','2 1/2',73.0,7.01),
  ('PI-049','Seamless Pipe S80','3',88.9,7.62),
  ('PI-050','Seamless Pipe S80','3 1/2',101.6,8.08),
  ('PI-051','Seamless Pipe S80','4',114.3,8.56),
  ('PI-052','Seamless Pipe S80','5',141.2,9.52),
  ('PI-053','Seamless Pipe S80','6',168.8,10.97),
  ('PI-054','Seamless Pipe S80','8',219.1,12.70),
  ('PI-055','Seamless Pipe S80','10',273.0,15.09),
  ('PI-056','Seamless Pipe S80','12',323.8,17.48),
  ('PI-057','Seamless Pipe S80','14',355.6,19.00),
  ('PI-058','Seamless Pipe S80','16',406.4,21.44),
  ('PI-059','Seamless Pipe S80','18',457.2,23.88),
  ('PI-060','Seamless Pipe S80','20',508.01,26.19),
  ('PI-061','Seamless Pipe S160','1/2',21.336,4.749),
  ('PI-062','Seamless Pipe S160','3/4',26.67,5.537),
  ('PI-063','Seamless Pipe S160','1',33.4,6.35),
  ('PI-064','Seamless Pipe S160','1 1/4',42.2,6.35),
  ('PI-065','Seamless Pipe S160','1 1/2',48.2,7.14),
  ('PI-066','Seamless Pipe S160','2',60.3,8.74),
  ('PI-067','Seamless Pipe S160','2 1/2',73.0,9.52),
  ('PI-068','Seamless Pipe S160','3',88.9,11.13),
  ('PI-069','Seamless Pipe S160','4',114.3,13.49),
  ('PI-070','Seamless Pipe S160','5',141.2,15.88),
  ('PI-071','Seamless Pipe S160','6',168.8,18.26),
  ('PI-072','Seamless Pipe S160','8',219.1,23.01),
  ('PI-073','Seamless Pipe S160','10',273.0,28.58),
  ('PI-074','Seamless Pipe S160','12',323.8,33.32)
) AS v(sku, name, size_inch, od_mm, thickness_mm)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- SPIRAL WELDED PIPES (PI-075 to PI-195) — Category: Pipes
-- ============================================================
-- specs: {"size_mm": "...", "od_mm": ..., "thickness_mm": ...}
-- No standard length (length_m = NULL)
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, unit)
SELECT v.sku, 'Spiral Welded Pipe', 'a0000000-0000-4000-8000-000000000005',
  jsonb_build_object('size_mm', v.size_mm, 'od_mm', v.od_mm, 'thickness_mm', v.thickness_mm),
  'length'
FROM (VALUES
  ('PI-075','150',168,3.20),('PI-076','150',168,4.76),('PI-077','150',168,6.35),
  ('PI-078','200',219,3.20),('PI-079','200',219,4.76),('PI-080','200',219,6.35),('PI-081','200',219,7.95),
  ('PI-082','250',274,4.76),('PI-083','250',274,6.35),('PI-084','250',274,7.95),('PI-085','250',274,9.53),
  ('PI-086','300',324,4.76),('PI-087','300',324,6.35),('PI-088','300',324,7.95),('PI-089','300',324,9.53),('PI-090','300',324,12.70),
  ('PI-091','350',356,4.76),('PI-092','350',356,6.35),('PI-093','350',356,7.95),('PI-094','350',356,9.53),('PI-095','350',356,12.70),
  ('PI-096','400',406,6.35),('PI-097','400',406,7.95),('PI-098','400',406,9.53),('PI-099','400',406,12.70),('PI-100','400',406,16.00),
  ('PI-101','450',457,6.35),('PI-102','450',457,7.95),('PI-103','450',457,9.53),('PI-104','450',457,12.70),('PI-105','450',457,16.00),
  ('PI-106','500',508,6.35),('PI-107','500',508,7.95),('PI-108','500',508,9.53),('PI-109','500',508,12.70),('PI-110','500',508,16.00),
  ('PI-111','600',610,6.35),('PI-112','600',610,7.95),('PI-113','600',610,9.53),('PI-114','600',610,12.70),('PI-115','600',610,16.00),('PI-116','600',610,19.00),
  ('PI-117','700',711,6.35),('PI-118','700',711,7.95),('PI-119','700',711,9.53),('PI-120','700',711,12.70),('PI-121','700',711,16.00),('PI-122','700',711,19.00),
  ('PI-123','800',813,7.95),('PI-124','800',813,9.53),('PI-125','800',813,12.70),('PI-126','800',813,16.00),('PI-127','800',813,19.00),('PI-128','800',813,22.00),
  ('PI-129','900',914,7.95),('PI-130','900',914,9.53),('PI-131','900',914,12.70),('PI-132','900',914,16.00),('PI-133','900',914,19.00),('PI-134','900',914,22.00),
  ('PI-135','1000',1016,7.95),('PI-136','1000',1016,9.53),('PI-137','1000',1016,12.70),('PI-138','1000',1016,16.00),('PI-139','1000',1016,19.00),('PI-140','1000',1016,22.00),('PI-141','1000',1016,25.00),
  ('PI-142','1100',1118,9.53),('PI-143','1100',1118,12.70),('PI-144','1100',1118,16.00),('PI-145','1100',1118,19.00),('PI-146','1100',1118,22.00),('PI-147','1100',1118,25.00),
  ('PI-148','1200',1219,9.53),('PI-149','1200',1219,12.70),('PI-150','1200',1219,16.00),('PI-151','1200',1219,19.00),('PI-152','1200',1219,22.00),('PI-153','1200',1219,25.00),
  ('PI-154','1500',1524,9.53),('PI-155','1500',1524,12.70),('PI-156','1500',1524,16.00),('PI-157','1500',1524,19.00),('PI-158','1500',1524,22.00),('PI-159','1500',1524,25.00),
  ('PI-160','1600',2032,9.53),('PI-161','1600',2032,12.70),('PI-162','1600',2032,16.00),('PI-163','1600',2032,19.00),('PI-164','1600',2032,22.00),('PI-165','1600',2032,25.00),
  ('PI-166','2250',2286,12.70),('PI-167','2250',2286,16.00),('PI-168','2250',2286,19.00),('PI-169','2250',2286,22.00),('PI-170','2250',2286,25.00),
  ('PI-171','2500',2540,12.70),('PI-172','2500',2540,16.00),('PI-173','2500',2540,19.00),('PI-174','2500',2540,22.00),('PI-175','2500',2540,25.00),
  ('PI-176','2750',2794,12.70),('PI-177','2750',2794,16.00),('PI-178','2750',2794,19.00),('PI-179','2750',2794,22.00),('PI-180','2750',2794,25.00),
  ('PI-181','3000',3048,16.00),('PI-182','3000',3048,19.00),('PI-183','3000',3048,22.00),('PI-184','3000',3048,25.00),
  ('PI-185','3300',3353,16.00),('PI-186','3300',3353,19.00),('PI-187','3300',3353,22.00),('PI-188','3300',3353,25.00),
  ('PI-189','3500',3607,16.00),('PI-190','3500',3607,19.00),('PI-191','3500',3607,22.00),('PI-192','3500',3607,25.00),
  ('PI-193','3800',3861,19.00),('PI-194','3800',3861,22.00),('PI-195','3800',3861,25.00)
) AS v(sku, size_mm, od_mm, thickness_mm)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- TUBINGS (TU-001 to TU-009) — Category: Tubings
-- ============================================================
-- specs: {"size_mm": "...", "thickness_mm": ...}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, unit)
SELECT v.sku, 'Lightweight Steel Tube', 'a0000000-0000-4000-8000-000000000006',
  jsonb_build_object('size_mm', v.size_mm, 'thickness_mm', v.thickness_mm, 'length_m', 6.0),
  'length'
FROM (VALUES
  ('TU-001','15',1.55),('TU-002','20',1.55),('TU-003','25',1.80),
  ('TU-004','32',1.90),('TU-005','40',1.90),('TU-006','50',2.00),
  ('TU-007','65',2.75),('TU-008','80',2.75),('TU-009','100',2.75)
) AS v(sku, size_mm, thickness_mm)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- CLIENTS
-- ============================================================

INSERT INTO clients (id, name, contact_person, email, phone, address, city) VALUES
  ('c0000000-0000-4000-8000-000000000001',  'Manila Steel Corp',           'Juan Dela Cruz',                'info@manilasteel.ph',      '0917-123-4567', '123 Tondo Blvd, Manila',                          'Manila'),
  ('c0000000-0000-4000-8000-000000000002',  'Cebu Iron Works',             'Maria Santos',                  'sales@cebuiron.ph',        '0918-234-5678', '45 Mandaue Industrial, Cebu',                     'Cebu'),
  ('c0000000-0000-4000-8000-000000000003',  'Davao Builders Supply',       'Pedro Reyes',                   'orders@davaobuild.ph',     '0919-345-6789', '78 Bajada St, Davao City',                        'Davao'),
  ('c0000000-0000-4000-8000-000000000004',  'Iloilo Metal Trading',        'Ana Garcia',                    'info@iloilometal.ph',      '0920-456-7890', '12 La Paz Rd, Iloilo City',                       'Iloilo'),
  ('c0000000-0000-4000-8000-000000000005', 'Pampanga Hardware Co.',       'Roberto Cruz',                  'sales@pampangahw.ph',      '0921-567-8901', '56 MacArthur Hwy, San Fernando',                  'Pampanga'),
  ('c0000000-0000-4000-8000-000000000006', 'Batangas Steel Depot',        'Carmen Aquino',                 'depot@batangassteel.ph',   '0922-678-9012', '89 Batangas Port Area, Batangas City',            'Batangas'),
  ('c0000000-0000-4000-8000-000000000007', 'Laguna Construction Supply',  'Jose Mendoza',                  'supply@lagunacon.ph',      '0923-789-0123', '34 National Hwy, Calamba, Laguna',                'Laguna'),
  ('c0000000-0000-4000-8000-000000000008', 'Cagayan de Oro Metals',       'Linda Tan',                     'metals@cdometals.ph',      '0924-890-1234', '67 Limketkai Dr, CDO',                            'Cagayan de Oro'),
  ('c0000000-0000-4000-8000-000000000009', 'Zamboanga Trading Inc.',      'Ricardo Lim',                   'trade@zambotrading.ph',    '0925-901-2345', '23 Veterans Ave, Zamboanga City',                  'Zamboanga'),
  ('c0000000-0000-4000-8000-00000000000a', 'Pangasinan Steelworks',       'Teresa Ramos',                  'steel@pangsteel.ph',       '0926-012-3456', '91 Dagupan Blvd, Pangasinan',                     'Pangasinan'),
  ('c0000000-0000-4000-8000-00000000000b', 'Regan Industrial',            'Regan Industrial Sales Dept.',  'sales@reganindustrial.ph', '(02) 8888-7777', 'Lot 5 Block 3, LISP, Brgy. Diezmo',              'Cabuyao, Laguna 4025');




-- ── WAREHOUSE STOCK (dummy data) ──
-- Company is derived from warehouse (1 company → N warehouses)
-- C1: 10-500, C2: 0-50, C3: 0-20

-- Warehouse 1 (Kirin) — ~200 products
INSERT INTO warehouse_stock (product_id, warehouse_id, classification, quantity)
SELECT p.id, 'b0000000-0000-4000-8000-000000000001'::uuid, cls.classification,
  CASE cls.classification
    WHEN 'C1' THEN (10 + floor(random() * 491))::int
    WHEN 'C2' THEN (floor(random() * 51))::int
    WHEN 'C3' THEN (floor(random() * 21))::int
  END
FROM (SELECT id FROM products ORDER BY random() LIMIT 200) p
CROSS JOIN (VALUES ('C1'), ('C2'), ('C3')) AS cls(classification)
ON CONFLICT DO NOTHING;

-- Warehouse 2 (Regan) — ~250 products
INSERT INTO warehouse_stock (product_id, warehouse_id, classification, quantity)
SELECT p.id, 'b0000000-0000-4000-8000-000000000002'::uuid, cls.classification,
  CASE cls.classification
    WHEN 'C1' THEN (10 + floor(random() * 491))::int
    WHEN 'C2' THEN (floor(random() * 51))::int
    WHEN 'C3' THEN (floor(random() * 21))::int
  END
FROM (SELECT id FROM products ORDER BY random() LIMIT 250) p
CROSS JOIN (VALUES ('C1'), ('C2'), ('C3')) AS cls(classification)
ON CONFLICT DO NOTHING;

-- Warehouse 3 (Supremo) — ~180 products
INSERT INTO warehouse_stock (product_id, warehouse_id, classification, quantity)
SELECT p.id, 'b0000000-0000-4000-8000-000000000003'::uuid, cls.classification,
  CASE cls.classification
    WHEN 'C1' THEN (10 + floor(random() * 491))::int
    WHEN 'C2' THEN (floor(random() * 51))::int
    WHEN 'C3' THEN (floor(random() * 21))::int
  END
FROM (SELECT id FROM products ORDER BY random() LIMIT 180) p
CROSS JOIN (VALUES ('C1'), ('C2'), ('C3')) AS cls(classification)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED COMPLETE
-- Total products: 648
--   Equal Angle Bars:   75  (AB-001 to AB-075)
--   Unequal Angle Bars: 26  (UA-001 to UA-026)
--   Channel Bars:       83  (CB-001 to CB-083)
--   Deformed Bars:      90  (DB-001 to DB-090)
--   Flat Bars:         170  (FB-001 to FB-170)
--   Pipes:             195  (PI-001 to PI-195)
--   Tubings:             9  (TU-001 to TU-009)
-- Companies:            3   (Kirin, Regan, Supremo)
-- Clients:              11
-- Warehouses:           3   (W1→Kirin, W2→Regan, W3→Supremo)
-- Warehouse stock:      ~1890 rows across ~630 products
-- ============================================================
