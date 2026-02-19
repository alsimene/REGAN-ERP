-- ============================================================
-- BAKAL INVENTORY MANAGEMENT SYSTEM — SEED DATA (COMPLETE)
-- ============================================================
-- This file contains ALL seed data for the Regan system.
-- Schema uses bigint generated always as identity PKs.
-- Products use a specs JSONB column for dimensions.
-- Total: 249 products, 13 categories, 3 companies, 11 clients
-- ============================================================

-- ── CATEGORIES ──
INSERT INTO categories (id, name, description) OVERRIDING SYSTEM VALUE VALUES
  (1,  'Angle Bars',      'Equal and unequal angle bars'),
  (2,  'Channel Bars',    'C-channel structural steel'),
  (3,  'Deformed Bars',   'Reinforcing steel bars (rebar)'),
  (4,  'Flat Bars',       'Flat steel bars'),
  (5,  'Pipes',           'Galvanized and black iron pipes'),
  (6,  'Tubings',         'Square and rectangular steel tubes'),
  (7,  'Plates',          'Mild steel and checkered plates'),
  (8,  'Coil',            'Hot rolled and cold rolled coils'),
  (9,  'Purlins',         'C-purlins for roofing'),
  (10, 'Sheet Piles',     'Steel sheet piling'),
  (11, 'T-Beams',         'T-bar structural steel'),
  (12, 'Wide Flanges',    'Wide flange I-beams'),
  (13, 'Other Services',  'Cutting, bending, and other services');

-- ── WAREHOUSES ──
INSERT INTO warehouses (id, name, location) OVERRIDING SYSTEM VALUE VALUES
  (1, 'Warehouse 1', 'Main Yard'),
  (2, 'Warehouse 2', 'North Depot'),
  (3, 'Warehouse 3', 'South Depot');

-- ============================================================
-- EQUAL ANGLE BARS (AB-001 to AB-075) — Category: Angle Bars
-- ============================================================
-- Source: PNS 657:2008 — Hot-rolled equal-leg angle bars
-- specs: {"size_mm": "...", "thickness_mm": ...}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, length_m, kg_per_m, weight_per_length, capacity, unit) VALUES
  -- 20 x 20
  ('AB-001', 'Equal Angle', 1, '{"size_mm": "20 x 20", "thickness_mm": 2.0}', 6.0, 0.610, 3.660, 4000, 'pcs'),
  ('AB-002', 'Equal Angle', 1, '{"size_mm": "20 x 20", "thickness_mm": 3.0}', 6.0, 0.880, 5.280, 3500, 'pcs'),
  -- 25 x 25
  ('AB-003', 'Equal Angle', 1, '{"size_mm": "25 x 25", "thickness_mm": 2.0}', 6.0, 0.760, 4.560, 4000, 'pcs'),
  ('AB-004', 'Equal Angle', 1, '{"size_mm": "25 x 25", "thickness_mm": 2.5}', 6.0, 0.940, 5.640, 3800, 'pcs'),
  ('AB-005', 'Equal Angle', 1, '{"size_mm": "25 x 25", "thickness_mm": 3.0}', 6.0, 1.120, 6.720, 3500, 'pcs'),
  ('AB-006', 'Equal Angle', 1, '{"size_mm": "25 x 25", "thickness_mm": 3.5}', 6.0, 1.290, 7.740, 3200, 'pcs'),
  ('AB-007', 'Equal Angle', 1, '{"size_mm": "25 x 25", "thickness_mm": 4.0}', 6.0, 1.450, 8.700, 3000, 'pcs'),
  ('AB-008', 'Equal Angle', 1, '{"size_mm": "25 x 25", "thickness_mm": 5.0}', 6.0, 1.780, 10.680, 2500, 'pcs'),
  ('AB-009', 'Equal Angle', 1, '{"size_mm": "25 x 25", "thickness_mm": 6.0}', 6.0, 2.080, 12.480, 2000, 'pcs'),
  -- 30 x 30
  ('AB-010', 'Equal Angle', 1, '{"size_mm": "30 x 30", "thickness_mm": 2.0}', 6.0, 0.930, 5.580, 4000, 'pcs'),
  ('AB-011', 'Equal Angle', 1, '{"size_mm": "30 x 30", "thickness_mm": 3.0}', 6.0, 1.360, 8.160, 3500, 'pcs'),
  ('AB-012', 'Equal Angle', 1, '{"size_mm": "30 x 30", "thickness_mm": 3.5}', 6.0, 1.570, 9.420, 3200, 'pcs'),
  ('AB-013', 'Equal Angle', 1, '{"size_mm": "30 x 30", "thickness_mm": 4.0}', 6.0, 1.780, 10.680, 3000, 'pcs'),
  ('AB-014', 'Equal Angle', 1, '{"size_mm": "30 x 30", "thickness_mm": 5.0}', 6.0, 2.180, 13.080, 2500, 'pcs'),
  ('AB-015', 'Equal Angle', 1, '{"size_mm": "30 x 30", "thickness_mm": 6.0}', 6.0, 2.560, 15.360, 2000, 'pcs'),
  -- 35 x 35
  ('AB-016', 'Equal Angle', 1, '{"size_mm": "35 x 35", "thickness_mm": 4.0}', 6.0, 2.090, 12.540, 3000, 'pcs'),
  ('AB-017', 'Equal Angle', 1, '{"size_mm": "35 x 35", "thickness_mm": 5.0}', 6.0, 2.570, 15.420, 2500, 'pcs'),
  -- 38 x 38
  ('AB-018', 'Equal Angle', 1, '{"size_mm": "38 x 38", "thickness_mm": 2.0}', 6.0, 1.190, 7.140, 4000, 'pcs'),
  ('AB-019', 'Equal Angle', 1, '{"size_mm": "38 x 38", "thickness_mm": 2.5}', 6.0, 1.470, 8.820, 3800, 'pcs'),
  ('AB-020', 'Equal Angle', 1, '{"size_mm": "38 x 38", "thickness_mm": 3.0}', 6.0, 1.750, 10.500, 3500, 'pcs'),
  ('AB-021', 'Equal Angle', 1, '{"size_mm": "38 x 38", "thickness_mm": 3.5}', 6.0, 2.020, 12.120, 3200, 'pcs'),
  ('AB-022', 'Equal Angle', 1, '{"size_mm": "38 x 38", "thickness_mm": 4.0}', 6.0, 2.290, 13.740, 3000, 'pcs'),
  ('AB-023', 'Equal Angle', 1, '{"size_mm": "38 x 38", "thickness_mm": 4.5}', 6.0, 2.560, 15.360, 2800, 'pcs'),
  ('AB-024', 'Equal Angle', 1, '{"size_mm": "38 x 38", "thickness_mm": 5.0}', 6.0, 2.820, 16.920, 2500, 'pcs'),
  ('AB-025', 'Equal Angle', 1, '{"size_mm": "38 x 38", "thickness_mm": 6.0}', 6.0, 3.330, 19.980, 2000, 'pcs'),
  -- 50 x 50
  ('AB-026', 'Equal Angle', 1, '{"size_mm": "50 x 50", "thickness_mm": 2.5}', 6.0, 1.950, 11.700, 4000, 'pcs'),
  ('AB-027', 'Equal Angle', 1, '{"size_mm": "50 x 50", "thickness_mm": 3.0}', 6.0, 2.330, 13.980, 3800, 'pcs'),
  ('AB-028', 'Equal Angle', 1, '{"size_mm": "50 x 50", "thickness_mm": 3.5}', 6.0, 2.690, 16.140, 3500, 'pcs'),
  ('AB-029', 'Equal Angle', 1, '{"size_mm": "50 x 50", "thickness_mm": 4.0}', 6.0, 3.060, 18.360, 3200, 'pcs'),
  ('AB-030', 'Equal Angle', 1, '{"size_mm": "50 x 50", "thickness_mm": 4.5}', 6.0, 3.410, 20.460, 3000, 'pcs'),
  ('AB-031', 'Equal Angle', 1, '{"size_mm": "50 x 50", "thickness_mm": 5.0}', 6.0, 3.770, 22.620, 2500, 'pcs'),
  ('AB-032', 'Equal Angle', 1, '{"size_mm": "50 x 50", "thickness_mm": 6.0}', 6.0, 4.470, 26.820, 2000, 'pcs'),
  ('AB-033', 'Equal Angle', 1, '{"size_mm": "50 x 50", "thickness_mm": 7.0}', 6.0, 5.150, 30.900, 1800, 'pcs'),
  ('AB-034', 'Equal Angle', 1, '{"size_mm": "50 x 50", "thickness_mm": 8.0}', 6.0, 5.820, 34.920, 1500, 'pcs'),
  ('AB-035', 'Equal Angle', 1, '{"size_mm": "50 x 50", "thickness_mm": 9.0}', 6.0, 6.470, 38.820, 1200, 'pcs'),
  -- 63.5 x 63.5
  ('AB-036', 'Equal Angle', 1, '{"size_mm": "63.5 x 63.5", "thickness_mm": 4.0}', 6.0, 3.900, 23.400, 3500, 'pcs'),
  ('AB-037', 'Equal Angle', 1, '{"size_mm": "63.5 x 63.5", "thickness_mm": 4.5}', 6.0, 4.370, 26.220, 3200, 'pcs'),
  ('AB-038', 'Equal Angle', 1, '{"size_mm": "63.5 x 63.5", "thickness_mm": 5.0}', 6.0, 4.830, 28.980, 3000, 'pcs'),
  ('AB-039', 'Equal Angle', 1, '{"size_mm": "63.5 x 63.5", "thickness_mm": 6.0}', 6.0, 5.740, 34.440, 2500, 'pcs'),
  ('AB-040', 'Equal Angle', 1, '{"size_mm": "63.5 x 63.5", "thickness_mm": 7.0}', 6.0, 6.640, 39.840, 2000, 'pcs'),
  ('AB-041', 'Equal Angle', 1, '{"size_mm": "63.5 x 63.5", "thickness_mm": 8.0}', 6.0, 7.510, 45.060, 1800, 'pcs'),
  ('AB-042', 'Equal Angle', 1, '{"size_mm": "63.5 x 63.5", "thickness_mm": 9.0}', 6.0, 8.380, 50.280, 1500, 'pcs'),
  ('AB-043', 'Equal Angle', 1, '{"size_mm": "63.5 x 63.5", "thickness_mm": 11.0}', 6.0, 10.060, 60.360, 1000, 'pcs'),
  -- 75 x 75
  ('AB-044', 'Equal Angle', 1, '{"size_mm": "75 x 75", "thickness_mm": 3.5}', 6.0, 4.090, 24.540, 3000, 'pcs'),
  ('AB-045', 'Equal Angle', 1, '{"size_mm": "75 x 75", "thickness_mm": 4.0}', 6.0, 4.650, 27.900, 2800, 'pcs'),
  ('AB-046', 'Equal Angle', 1, '{"size_mm": "75 x 75", "thickness_mm": 4.5}', 6.0, 5.210, 31.260, 2500, 'pcs'),
  ('AB-047', 'Equal Angle', 1, '{"size_mm": "75 x 75", "thickness_mm": 5.0}', 6.0, 5.760, 34.560, 2500, 'pcs'),
  ('AB-048', 'Equal Angle', 1, '{"size_mm": "75 x 75", "thickness_mm": 6.0}', 6.0, 6.850, 41.100, 2000, 'pcs'),
  ('AB-049', 'Equal Angle', 1, '{"size_mm": "75 x 75", "thickness_mm": 7.0}', 6.0, 7.930, 47.580, 1800, 'pcs'),
  ('AB-050', 'Equal Angle', 1, '{"size_mm": "75 x 75", "thickness_mm": 8.0}', 6.0, 8.990, 53.940, 1500, 'pcs'),
  ('AB-051', 'Equal Angle', 1, '{"size_mm": "75 x 75", "thickness_mm": 9.0}', 6.0, 10.030, 60.180, 1200, 'pcs'),
  ('AB-052', 'Equal Angle', 1, '{"size_mm": "75 x 75", "thickness_mm": 11.0}', 6.0, 12.070, 72.420, 800, 'pcs'),
  -- 90 x 90
  ('AB-053', 'Equal Angle', 1, '{"size_mm": "90 x 90", "thickness_mm": 7.0}', 6.0, 9.610, 57.660, 1500, 'pcs'),
  ('AB-054', 'Equal Angle', 1, '{"size_mm": "90 x 90", "thickness_mm": 8.0}', 6.0, 10.900, 65.400, 1200, 'pcs'),
  ('AB-055', 'Equal Angle', 1, '{"size_mm": "90 x 90", "thickness_mm": 9.0}', 6.0, 12.180, 73.080, 1000, 'pcs'),
  ('AB-056', 'Equal Angle', 1, '{"size_mm": "90 x 90", "thickness_mm": 10.0}', 6.0, 13.450, 80.700, 800, 'pcs'),
  -- 100 x 100
  ('AB-057', 'Equal Angle', 1, '{"size_mm": "100 x 100", "thickness_mm": 5.5}', 6.0, 8.520, 51.120, 1200, 'pcs'),
  ('AB-058', 'Equal Angle', 1, '{"size_mm": "100 x 100", "thickness_mm": 6.0}', 6.0, 9.260, 55.560, 1000, 'pcs'),
  ('AB-059', 'Equal Angle', 1, '{"size_mm": "100 x 100", "thickness_mm": 7.0}', 6.0, 10.730, 64.380, 1000, 'pcs'),
  ('AB-060', 'Equal Angle', 1, '{"size_mm": "100 x 100", "thickness_mm": 7.5}', 6.0, 11.450, 68.700, 800, 'pcs'),
  ('AB-061', 'Equal Angle', 1, '{"size_mm": "100 x 100", "thickness_mm": 8.0}', 6.0, 12.180, 73.080, 800, 'pcs'),
  ('AB-062', 'Equal Angle', 1, '{"size_mm": "100 x 100", "thickness_mm": 9.0}', 6.0, 13.620, 81.720, 600, 'pcs'),
  ('AB-063', 'Equal Angle', 1, '{"size_mm": "100 x 100", "thickness_mm": 10.0}', 6.0, 15.040, 90.240, 500, 'pcs'),
  ('AB-064', 'Equal Angle', 1, '{"size_mm": "100 x 100", "thickness_mm": 12.0}', 6.0, 17.830, 106.980, 400, 'pcs'),
  -- 125 x 125
  ('AB-065', 'Equal Angle', 1, '{"size_mm": "125 x 125", "thickness_mm": 8.0}', 6.0, 15.340, 92.040, 800, 'pcs'),
  ('AB-066', 'Equal Angle', 1, '{"size_mm": "125 x 125", "thickness_mm": 10.0}', 6.0, 18.980, 113.880, 600, 'pcs'),
  ('AB-067', 'Equal Angle', 1, '{"size_mm": "125 x 125", "thickness_mm": 12.0}', 6.0, 22.560, 135.360, 500, 'pcs'),
  -- 150 x 150
  ('AB-068', 'Equal Angle', 1, '{"size_mm": "150 x 150", "thickness_mm": 10.0}', 6.0, 22.980, 137.880, 500, 'pcs'),
  ('AB-069', 'Equal Angle', 1, '{"size_mm": "150 x 150", "thickness_mm": 12.0}', 6.0, 27.350, 164.100, 400, 'pcs'),
  ('AB-070', 'Equal Angle', 1, '{"size_mm": "150 x 150", "thickness_mm": 15.0}', 6.0, 33.770, 202.620, 300, 'pcs'),
  -- 200 x 200
  ('AB-071', 'Equal Angle', 1, '{"size_mm": "200 x 200", "thickness_mm": 16.0}', 6.0, 48.500, 291.000, 300, 'pcs'),
  ('AB-072', 'Equal Angle', 1, '{"size_mm": "200 x 200", "thickness_mm": 20.0}', 6.0, 59.930, 359.580, 200, 'pcs'),
  ('AB-073', 'Equal Angle', 1, '{"size_mm": "200 x 200", "thickness_mm": 24.0}', 6.0, 71.110, 426.660, 150, 'pcs'),
  -- 250 x 250
  ('AB-074', 'Equal Angle', 1, '{"size_mm": "250 x 250", "thickness_mm": 28.0}', 6.0, 104.020, 624.120, 100, 'pcs'),
  ('AB-075', 'Equal Angle', 1, '{"size_mm": "250 x 250", "thickness_mm": 35.0}', 6.0, 128.030, 768.180, 80, 'pcs');

-- ============================================================
-- UNEQUAL ANGLE BARS (UA-001 to UA-026) — Category: Angle Bars
-- ============================================================
-- specs: {"size_mm": "...", "thickness_mm": ...}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, length_m, kg_per_m, weight_per_length, capacity, unit) VALUES
  -- 50 x 75
  ('UA-001', 'Unequal Angle', 1, '{"size_mm": "50 x 75", "thickness_mm": 5.0}', 6.0, 4.670, 28.020, 3000, 'pcs'),
  ('UA-002', 'Unequal Angle', 1, '{"size_mm": "50 x 75", "thickness_mm": 6.0}', 6.0, 5.650, 33.900, 2500, 'pcs'),
  ('UA-003', 'Unequal Angle', 1, '{"size_mm": "50 x 75", "thickness_mm": 8.0}', 6.0, 7.390, 44.340, 2000, 'pcs'),
  -- 75 x 100
  ('UA-004', 'Unequal Angle', 1, '{"size_mm": "75 x 100", "thickness_mm": 6.0}', 6.0, 7.950, 47.700, 2000, 'pcs'),
  ('UA-005', 'Unequal Angle', 1, '{"size_mm": "75 x 100", "thickness_mm": 7.0}', 6.0, 9.230, 55.380, 1800, 'pcs'),
  ('UA-006', 'Unequal Angle', 1, '{"size_mm": "75 x 100", "thickness_mm": 8.0}', 6.0, 10.600, 63.600, 1500, 'pcs'),
  ('UA-007', 'Unequal Angle', 1, '{"size_mm": "75 x 100", "thickness_mm": 9.0}', 6.0, 11.730, 70.380, 1200, 'pcs'),
  ('UA-008', 'Unequal Angle', 1, '{"size_mm": "75 x 100", "thickness_mm": 10.0}', 6.0, 13.000, 78.000, 1000, 'pcs'),
  ('UA-009', 'Unequal Angle', 1, '{"size_mm": "75 x 100", "thickness_mm": 12.0}', 6.0, 15.400, 92.400, 800, 'pcs'),
  -- 75 x 125
  ('UA-010', 'Unequal Angle', 1, '{"size_mm": "75 x 125", "thickness_mm": 7.0}', 6.0, 10.600, 63.600, 1500, 'pcs'),
  ('UA-011', 'Unequal Angle', 1, '{"size_mm": "75 x 125", "thickness_mm": 8.0}', 6.0, 12.200, 73.200, 1200, 'pcs'),
  ('UA-012', 'Unequal Angle', 1, '{"size_mm": "75 x 125", "thickness_mm": 9.0}', 6.0, 13.500, 81.000, 1000, 'pcs'),
  ('UA-013', 'Unequal Angle', 1, '{"size_mm": "75 x 125", "thickness_mm": 10.0}', 6.0, 15.000, 90.000, 800, 'pcs'),
  ('UA-014', 'Unequal Angle', 1, '{"size_mm": "75 x 125", "thickness_mm": 12.0}', 6.0, 17.800, 106.800, 600, 'pcs'),
  -- 75 x 150
  ('UA-015', 'Unequal Angle', 1, '{"size_mm": "75 x 150", "thickness_mm": 7.0}', 6.0, 10.600, 63.600, 1200, 'pcs'),
  ('UA-016', 'Unequal Angle', 1, '{"size_mm": "75 x 150", "thickness_mm": 8.0}', 6.0, 12.070, 72.420, 1000, 'pcs'),
  ('UA-017', 'Unequal Angle', 1, '{"size_mm": "75 x 150", "thickness_mm": 9.0}', 6.0, 15.400, 92.400, 800, 'pcs'),
  ('UA-018', 'Unequal Angle', 1, '{"size_mm": "75 x 150", "thickness_mm": 10.0}', 6.0, 17.000, 102.000, 600, 'pcs'),
  ('UA-019', 'Unequal Angle', 1, '{"size_mm": "75 x 150", "thickness_mm": 11.0}', 6.0, 17.720, 106.320, 500, 'pcs'),
  ('UA-020', 'Unequal Angle', 1, '{"size_mm": "75 x 150", "thickness_mm": 12.0}', 6.0, 20.200, 121.200, 400, 'pcs'),
  ('UA-021', 'Unequal Angle', 1, '{"size_mm": "75 x 150", "thickness_mm": 15.0}', 6.0, 24.800, 148.800, 300, 'pcs'),
  -- 90 x 150
  ('UA-022', 'Unequal Angle', 1, '{"size_mm": "90 x 150", "thickness_mm": 8.0}', 6.0, 14.570, 87.420, 800, 'pcs'),
  ('UA-023', 'Unequal Angle', 1, '{"size_mm": "90 x 150", "thickness_mm": 9.0}', 6.0, 16.320, 97.920, 600, 'pcs'),
  ('UA-024', 'Unequal Angle', 1, '{"size_mm": "90 x 150", "thickness_mm": 10.0}', 6.0, 18.200, 109.200, 500, 'pcs'),
  ('UA-025', 'Unequal Angle', 1, '{"size_mm": "90 x 150", "thickness_mm": 12.0}', 6.0, 21.600, 129.600, 400, 'pcs'),
  ('UA-026', 'Unequal Angle', 1, '{"size_mm": "90 x 150", "thickness_mm": 15.0}', 6.0, 26.600, 159.600, 200, 'pcs');

-- ============================================================
-- JIS CHANNEL BARS WITHOUT FLANGE THICKNESS (CB-001 to CB-024)
-- ============================================================
-- specs: {"size_mm": "...", "thickness_mm": ...}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, length_m, kg_per_m, weight_per_length, capacity, unit) VALUES
  ('CB-001', 'Channel Bar', 2, '{"size_mm": "75 x 40", "thickness_mm": 3.75}', 6.0, 5.300, 31.800, 2500, 'pcs'),
  ('CB-002', 'Channel Bar', 2, '{"size_mm": "75 x 40", "thickness_mm": 5.0}', 6.0, 6.920, 41.520, 2000, 'pcs'),
  ('CB-003', 'Channel Bar', 2, '{"size_mm": "76 x 35", "thickness_mm": 3.7}', 6.0, 4.800, 28.800, 2500, 'pcs'),
  ('CB-004', 'Channel Bar', 2, '{"size_mm": "76 x 35", "thickness_mm": 5.0}', 6.0, 6.100, 36.600, 2000, 'pcs'),
  ('CB-005', 'Channel Bar', 2, '{"size_mm": "80 x 40", "thickness_mm": 4.65}', 6.0, 7.100, 42.600, 2000, 'pcs'),
  ('CB-006', 'Channel Bar', 2, '{"size_mm": "100 x 46", "thickness_mm": 4.8}', 6.0, 8.520, 51.120, 1500, 'pcs'),
  ('CB-007', 'Channel Bar', 2, '{"size_mm": "100 x 50", "thickness_mm": 4.25}', 6.0, 7.300, 43.800, 1500, 'pcs'),
  ('CB-008', 'Channel Bar', 2, '{"size_mm": "100 x 50", "thickness_mm": 3.95}', 6.0, 7.500, 45.000, 1500, 'pcs'),
  ('CB-009', 'Channel Bar', 2, '{"size_mm": "100 x 50", "thickness_mm": 5.0}', 6.0, 9.360, 56.160, 1200, 'pcs'),
  ('CB-010', 'Channel Bar', 2, '{"size_mm": "100 x 50", "thickness_mm": 6.0}', 6.0, 10.600, 63.600, 1000, 'pcs'),
  ('CB-011', 'Channel Bar', 2, '{"size_mm": "102 x 40", "thickness_mm": 4.2}', 6.0, 6.700, 40.200, 1500, 'pcs'),
  ('CB-012', 'Channel Bar', 2, '{"size_mm": "102 x 40", "thickness_mm": 4.57}', 6.0, 8.000, 48.000, 1200, 'pcs'),
  ('CB-013', 'Channel Bar', 2, '{"size_mm": "102 x 50", "thickness_mm": 8.13}', 6.0, 10.200, 61.200, 1000, 'pcs'),
  ('CB-014', 'Channel Bar', 2, '{"size_mm": "118 x 50", "thickness_mm": 3.8}', 6.0, 8.160, 48.960, 1200, 'pcs'),
  ('CB-015', 'Channel Bar', 2, '{"size_mm": "125 x 65", "thickness_mm": 4.64}', 6.0, 11.660, 69.960, 800, 'pcs'),
  ('CB-016', 'Channel Bar', 2, '{"size_mm": "125 x 65", "thickness_mm": 5.5}', 6.0, 12.910, 77.460, 800, 'pcs'),
  ('CB-017', 'Channel Bar', 2, '{"size_mm": "125 x 65", "thickness_mm": 6.02}', 6.0, 13.400, 80.400, 600, 'pcs'),
  ('CB-018', 'Channel Bar', 2, '{"size_mm": "127 x 58", "thickness_mm": 5.0}', 6.0, 12.300, 73.800, 800, 'pcs'),
  ('CB-019', 'Channel Bar', 2, '{"size_mm": "150 x 75", "thickness_mm": 4.86}', 6.0, 14.660, 87.960, 600, 'pcs'),
  ('CB-020', 'Channel Bar', 2, '{"size_mm": "150 x 75", "thickness_mm": 5.7}', 6.0, 16.700, 100.200, 500, 'pcs'),
  ('CB-021', 'Channel Bar', 2, '{"size_mm": "150 x 75", "thickness_mm": 6.0}', 6.0, 17.900, 107.400, 500, 'pcs'),
  ('CB-022', 'Channel Bar', 2, '{"size_mm": "150 x 75", "thickness_mm": 6.0}', 6.0, 18.000, 108.000, 500, 'pcs'),
  ('CB-023', 'Channel Bar', 2, '{"size_mm": "150 x 75", "thickness_mm": 6.35}', 6.0, 18.600, 111.600, 400, 'pcs'),
  ('CB-024', 'Channel Bar', 2, '{"size_mm": "150 x 75", "thickness_mm": 9.0}', 6.0, 24.000, 144.000, 300, 'pcs');

-- ============================================================
-- JIS CHANNEL BARS WITH FLANGE THICKNESS (CB-025 to CB-054)
-- ============================================================
-- specs: {"size_mm": "...", "thickness_mm": ..., "flange_thickness_mm": ...}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, length_m, kg_per_m, weight_per_length, capacity, unit) VALUES
  ('CB-025', 'Channel Bar', 2, '{"size_mm": "152 x 48", "thickness_mm": 5.0, "flange_thickness_mm": 6.2}', 6.0, 10.700, 64.200, 400, 'pcs'),
  ('CB-026', 'Channel Bar', 2, '{"size_mm": "152 x 89", "thickness_mm": 7.0, "flange_thickness_mm": 11.5}', 6.0, 23.900, 143.400, 300, 'pcs'),
  ('CB-027', 'Channel Bar', 2, '{"size_mm": "160 x 64", "thickness_mm": 5.5, "flange_thickness_mm": 7.5}', 6.0, 14.200, 85.200, 350, 'pcs'),
  ('CB-028', 'Channel Bar', 2, '{"size_mm": "180 x 65", "thickness_mm": 5.05, "flange_thickness_mm": 8.5}', 6.0, 16.300, 97.800, 300, 'pcs'),
  ('CB-029', 'Channel Bar', 2, '{"size_mm": "180 x 65", "thickness_mm": 5.15, "flange_thickness_mm": 8.5}', 6.0, 17.400, 104.400, 300, 'pcs'),
  ('CB-030', 'Channel Bar', 2, '{"size_mm": "180 x 75", "thickness_mm": 7.0, "flange_thickness_mm": 10.5}', 6.0, 21.400, 128.400, 250, 'pcs'),
  ('CB-031', 'Channel Bar', 2, '{"size_mm": "200 x 73", "thickness_mm": 6.5, "flange_thickness_mm": 6.9}', 6.0, 18.800, 112.800, 250, 'pcs'),
  ('CB-032', 'Channel Bar', 2, '{"size_mm": "200 x 73", "thickness_mm": 7.0, "flange_thickness_mm": 7.5}', 6.0, 19.690, 118.140, 250, 'pcs'),
  ('CB-033', 'Channel Bar', 2, '{"size_mm": "200 x 73", "thickness_mm": 6.3, "flange_thickness_mm": 6.9}', 6.0, 20.373, 122.238, 250, 'pcs'),
  ('CB-034', 'Channel Bar', 2, '{"size_mm": "200 x 73", "thickness_mm": 8.1, "flange_thickness_mm": 8.5}', 6.0, 22.637, 135.822, 200, 'pcs'),
  ('CB-035', 'Channel Bar', 2, '{"size_mm": "200 x 73", "thickness_mm": 6.5, "flange_thickness_mm": 13.0}', 6.0, 23.300, 139.800, 200, 'pcs'),
  ('CB-036', 'Channel Bar', 2, '{"size_mm": "200 x 75", "thickness_mm": 8.0, "flange_thickness_mm": 11.0}', 6.0, 25.100, 150.600, 200, 'pcs'),
  ('CB-037', 'Channel Bar', 2, '{"size_mm": "200 x 75", "thickness_mm": 8.2, "flange_thickness_mm": 8.8}', 6.0, 25.780, 154.680, 200, 'pcs'),
  ('CB-038', 'Channel Bar', 2, '{"size_mm": "200 x 76", "thickness_mm": 5.0, "flange_thickness_mm": 9.3}', 6.0, 18.400, 110.400, 250, 'pcs'),
  ('CB-039', 'Channel Bar', 2, '{"size_mm": "200 x 80", "thickness_mm": 7.5, "flange_thickness_mm": 11.0}', 6.0, 24.600, 147.600, 200, 'pcs'),
  ('CB-040', 'Channel Bar', 2, '{"size_mm": "250 x 76", "thickness_mm": 5.9, "flange_thickness_mm": 5.6}', 6.0, 23.300, 139.800, 200, 'pcs'),
  ('CB-041', 'Channel Bar', 2, '{"size_mm": "250 x 78", "thickness_mm": 7.2, "flange_thickness_mm": 9.1}', 6.0, 25.300, 151.800, 200, 'pcs'),
  ('CB-042', 'Channel Bar', 2, '{"size_mm": "250 x 80", "thickness_mm": 8.56, "flange_thickness_mm": 10.28}', 6.0, 29.760, 178.560, 150, 'pcs'),
  ('CB-043', 'Channel Bar', 2, '{"size_mm": "250 x 90", "thickness_mm": 8.15, "flange_thickness_mm": 15.25}', 6.0, 35.500, 213.000, 150, 'pcs'),
  ('CB-044', 'Channel Bar', 2, '{"size_mm": "300 x 82", "thickness_mm": 6.6, "flange_thickness_mm": 9.7}', 6.0, 34.470, 206.820, 150, 'pcs'),
  ('CB-045', 'Channel Bar', 2, '{"size_mm": "300 x 85", "thickness_mm": 6.7, "flange_thickness_mm": 9.3}', 6.0, 31.017, 186.102, 150, 'pcs'),
  ('CB-046', 'Channel Bar', 2, '{"size_mm": "300 x 85", "thickness_mm": 8.6, "flange_thickness_mm": 10.2}', 6.0, 34.400, 206.400, 100, 'pcs'),
  ('CB-047', 'Channel Bar', 2, '{"size_mm": "300 x 85", "thickness_mm": 10.0, "flange_thickness_mm": 9.4}', 6.0, 39.100, 234.600, 100, 'pcs'),
  ('CB-048', 'Channel Bar', 2, '{"size_mm": "300 x 89", "thickness_mm": 10.0, "flange_thickness_mm": 15.5}', 6.0, 43.880, 263.280, 100, 'pcs'),
  ('CB-049', 'Channel Bar', 2, '{"size_mm": "300 x 90", "thickness_mm": 9.0, "flange_thickness_mm": 13.0}', 6.0, 41.000, 246.000, 100, 'pcs'),
  ('CB-050', 'Channel Bar', 2, '{"size_mm": "300 x 100", "thickness_mm": 10.0, "flange_thickness_mm": 16.5}', 6.0, 46.200, 277.200, 80, 'pcs'),
  ('CB-051', 'Channel Bar', 2, '{"size_mm": "360 x 98", "thickness_mm": 10.8, "flange_thickness_mm": 15.3}', 6.0, 53.466, 320.796, 80, 'pcs'),
  ('CB-052', 'Channel Bar', 2, '{"size_mm": "380 x 100", "thickness_mm": 9.6, "flange_thickness_mm": 17.4}', 6.0, 54.000, 324.000, 80, 'pcs'),
  ('CB-053', 'Channel Bar', 2, '{"size_mm": "381 x 86", "thickness_mm": 10.16, "flange_thickness_mm": 16.51}', 6.0, 50.400, 302.400, 80, 'pcs'),
  ('CB-054', 'Channel Bar', 2, '{"size_mm": "400 x 100", "thickness_mm": 9.6, "flange_thickness_mm": 17.4}', 6.0, 57.000, 342.000, 60, 'pcs');

-- ============================================================
-- ASTM CHANNEL BARS WITH FLANGE THICKNESS + WEIGHT_PER_20FT
-- (CB-055 to CB-083)
-- ============================================================
-- specs: {"size_mm": "...", "thickness_mm": ..., "flange_thickness_mm": ..., "weight_per_20ft": ...}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, length_m, kg_per_m, weight_per_length, capacity, unit) VALUES
  ('CB-055', 'Channel Bar ASTM', 2, '{"size_mm": "76.2 x 34.9", "thickness_mm": 4.32, "flange_thickness_mm": 6.93, "weight_per_20ft": 82.0}', 6.0, 6.198, 37.190, 2500, 'pcs'),
  ('CB-056', 'Channel Bar ASTM', 2, '{"size_mm": "76.2 x 38.1", "thickness_mm": 6.93, "flange_thickness_mm": 6.93, "weight_per_20ft": 100.0}', 6.0, 7.558, 45.350, 2000, 'pcs'),
  ('CB-057', 'Channel Bar ASTM', 2, '{"size_mm": "76.2 x 41.3", "thickness_mm": 9.04, "flange_thickness_mm": 6.93, "weight_per_20ft": 120.0}', 6.0, 9.070, 54.420, 2000, 'pcs'),
  ('CB-058', 'Channel Bar ASTM', 2, '{"size_mm": "101.6 x 40.2", "thickness_mm": 4.57, "flange_thickness_mm": 7.52, "weight_per_20ft": 108.0}', 6.0, 8.163, 48.980, 2000, 'pcs'),
  ('CB-059', 'Channel Bar ASTM', 2, '{"size_mm": "101.6 x 41.8", "thickness_mm": 6.27, "flange_thickness_mm": 7.52, "weight_per_20ft": 125.0}', 6.0, 9.448, 56.690, 1500, 'pcs'),
  ('CB-060', 'Channel Bar ASTM', 2, '{"size_mm": "101.6 x 43.7", "thickness_mm": 8.13, "flange_thickness_mm": 7.52, "weight_per_20ft": 145.0}', 6.0, 10.960, 65.760, 1500, 'pcs'),
  ('CB-061', 'Channel Bar ASTM', 2, '{"size_mm": "127 x 44.5", "thickness_mm": 4.83, "flange_thickness_mm": 8.13, "weight_per_20ft": 134.0}', 6.0, 10.128, 60.770, 1500, 'pcs'),
  ('CB-062', 'Channel Bar ASTM', 2, '{"size_mm": "127 x 47.9", "thickness_mm": 8.26, "flange_thickness_mm": 8.13, "weight_per_20ft": 180.0}', 6.0, 13.605, 81.630, 1200, 'pcs'),
  ('CB-063', 'Channel Bar ASTM', 2, '{"size_mm": "127 x 51.6", "thickness_mm": 11.99, "flange_thickness_mm": 8.13, "weight_per_20ft": 230.0}', 6.0, 17.385, 104.310, 1000, 'pcs'),
  ('CB-064', 'Channel Bar ASTM', 2, '{"size_mm": "152.4 x 48.8", "thickness_mm": 5.08, "flange_thickness_mm": 8.71, "weight_per_20ft": 164.0}', 6.0, 12.397, 74.380, 1000, 'pcs'),
  ('CB-065', 'Channel Bar ASTM', 2, '{"size_mm": "152.4 x 51.7", "thickness_mm": 7.98, "flange_thickness_mm": 8.71, "weight_per_20ft": 210.0}', 6.0, 15.873, 95.240, 800, 'pcs'),
  ('CB-066', 'Channel Bar ASTM', 2, '{"size_mm": "152.4 x 54.8", "thickness_mm": 11.1, "flange_thickness_mm": 8.71, "weight_per_20ft": 260.0}', 6.0, 19.652, 117.910, 600, 'pcs'),
  ('CB-067', 'Channel Bar ASTM', 2, '{"size_mm": "152.4 x 57.5", "thickness_mm": 9.53, "flange_thickness_mm": 12.07, "weight_per_20ft": 320.0}', 6.0, 24.187, 145.120, 500, 'pcs'),
  ('CB-068', 'Channel Bar ASTM', 2, '{"size_mm": "177.8 x 55.7", "thickness_mm": 7.98, "flange_thickness_mm": 9.3, "weight_per_20ft": 245.0}', 6.0, 18.518, 111.110, 600, 'pcs'),
  ('CB-069', 'Channel Bar ASTM', 2, '{"size_mm": "177.8 x 58.4", "thickness_mm": 10.64, "flange_thickness_mm": 9.3, "weight_per_20ft": 295.0}', 6.0, 22.298, 133.790, 500, 'pcs'),
  ('CB-070', 'Channel Bar ASTM', 2, '{"size_mm": "203.2 x 57.4", "thickness_mm": 5.65, "flange_thickness_mm": 10.0, "weight_per_20ft": 230.0}', 6.0, 17.385, 104.310, 500, 'pcs'),
  ('CB-071', 'Channel Bar ASTM', 2, '{"size_mm": "203.2 x 64.2", "thickness_mm": 12.37, "flange_thickness_mm": 9.91, "weight_per_20ft": 375.0}', 6.0, 28.345, 170.070, 300, 'pcs'),
  ('CB-072', 'Channel Bar ASTM', 2, '{"size_mm": "203.2 x 59.5", "thickness_mm": 7.54, "flange_thickness_mm": 12.75, "weight_per_20ft": 275.0}', 6.0, 20.787, 124.720, 400, 'pcs'),
  ('CB-073', 'Channel Bar ASTM', 2, '{"size_mm": "203.2 x 61.8", "thickness_mm": 10.03, "flange_thickness_mm": 9.91, "weight_per_20ft": 325.0}', 6.0, 24.565, 147.390, 350, 'pcs'),
  ('CB-074', 'Channel Bar ASTM', 2, '{"size_mm": "254 x 66", "thickness_mm": 6.1, "flange_thickness_mm": 11.07, "weight_per_20ft": 306.0}', 6.0, 23.130, 138.780, 300, 'pcs'),
  ('CB-075', 'Channel Bar ASTM', 2, '{"size_mm": "254 x 69.6", "thickness_mm": 9.45, "flange_thickness_mm": 13.4, "weight_per_20ft": 400.0}', 6.0, 30.235, 181.410, 200, 'pcs'),
  ('CB-076', 'Channel Bar ASTM', 2, '{"size_mm": "254 x 73.3", "thickness_mm": 12.9, "flange_thickness_mm": 14.7, "weight_per_20ft": 500.0}', 6.0, 37.793, 226.760, 150, 'pcs'),
  ('CB-077', 'Channel Bar ASTM', 2, '{"size_mm": "254 x 77", "thickness_mm": 12.95, "flange_thickness_mm": 15.1, "weight_per_20ft": 600.0}', 6.0, 45.352, 272.110, 100, 'pcs'),
  ('CB-078', 'Channel Bar ASTM', 2, '{"size_mm": "304.8 x 74.7", "thickness_mm": 7.6, "flange_thickness_mm": 12.5, "weight_per_20ft": 414.0}', 6.0, 31.293, 187.760, 200, 'pcs'),
  ('CB-079', 'Channel Bar ASTM', 2, '{"size_mm": "304.8 x 77.4", "thickness_mm": 9.65, "flange_thickness_mm": 15.1, "weight_per_20ft": 500.0}', 6.0, 37.793, 226.760, 150, 'pcs'),
  ('CB-080', 'Channel Bar ASTM', 2, '{"size_mm": "304.8 x 80.5", "thickness_mm": 12.82, "flange_thickness_mm": 16.1, "weight_per_20ft": 600.0}', 6.0, 45.352, 272.110, 100, 'pcs'),
  ('CB-081', 'Channel Bar ASTM', 2, '{"size_mm": "381 x 89.4", "thickness_mm": 13.18, "flange_thickness_mm": 19.1, "weight_per_20ft": 800.0}', 6.0, 60.468, 362.810, 80, 'pcs'),
  ('CB-082', 'Channel Bar ASTM', 2, '{"size_mm": "381 x 86.4", "thickness_mm": 10.16, "flange_thickness_mm": 16.51, "weight_per_20ft": 678.0}', 6.0, 51.247, 307.480, 100, 'pcs'),
  ('CB-083', 'Channel Bar ASTM', 2, '{"size_mm": "381 x 94.4", "thickness_mm": 17.96, "flange_thickness_mm": 19.95, "weight_per_20ft": 1000.0}', 6.0, 75.585, 453.510, 60, 'pcs');

-- ============================================================
-- DEFORMED BARS GR40 (DB-001 to DB-025)
-- ============================================================
-- specs: {"size_mm": "..."}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, length_m, kg_per_m, weight_per_length, capacity, unit) VALUES
  -- 10mm Gr40
  ('DB-001', 'Deformed Bar Gr40', 3, '{"size_mm": "10"}', 6.0, 0.616, 3.696, 5000, 'pcs'),
  ('DB-002', 'Deformed Bar Gr40', 3, '{"size_mm": "10"}', 7.5, 0.616, 4.620, 5000, 'pcs'),
  ('DB-003', 'Deformed Bar Gr40', 3, '{"size_mm": "10"}', 9.0, 0.616, 5.544, 5000, 'pcs'),
  ('DB-004', 'Deformed Bar Gr40', 3, '{"size_mm": "10"}', 10.5, 0.616, 6.468, 5000, 'pcs'),
  ('DB-005', 'Deformed Bar Gr40', 3, '{"size_mm": "10"}', 12.0, 0.616, 7.392, 5000, 'pcs'),
  -- 12mm Gr40
  ('DB-006', 'Deformed Bar Gr40', 3, '{"size_mm": "12"}', 6.0, 0.888, 5.328, 4500, 'pcs'),
  ('DB-007', 'Deformed Bar Gr40', 3, '{"size_mm": "12"}', 7.5, 0.888, 6.660, 4500, 'pcs'),
  ('DB-008', 'Deformed Bar Gr40', 3, '{"size_mm": "12"}', 9.0, 0.888, 7.992, 4500, 'pcs'),
  ('DB-009', 'Deformed Bar Gr40', 3, '{"size_mm": "12"}', 10.5, 0.888, 9.324, 4500, 'pcs'),
  ('DB-010', 'Deformed Bar Gr40', 3, '{"size_mm": "12"}', 12.0, 0.888, 10.656, 4500, 'pcs'),
  -- 16mm Gr40
  ('DB-011', 'Deformed Bar Gr40', 3, '{"size_mm": "16"}', 6.0, 1.578, 9.468, 4000, 'pcs'),
  ('DB-012', 'Deformed Bar Gr40', 3, '{"size_mm": "16"}', 7.5, 1.578, 11.835, 4000, 'pcs'),
  ('DB-013', 'Deformed Bar Gr40', 3, '{"size_mm": "16"}', 9.0, 1.578, 14.202, 4000, 'pcs'),
  ('DB-014', 'Deformed Bar Gr40', 3, '{"size_mm": "16"}', 10.5, 1.578, 16.569, 4000, 'pcs'),
  ('DB-015', 'Deformed Bar Gr40', 3, '{"size_mm": "16"}', 12.0, 1.578, 18.936, 4000, 'pcs'),
  -- 20mm Gr40
  ('DB-016', 'Deformed Bar Gr40', 3, '{"size_mm": "20"}', 6.0, 2.466, 14.796, 3000, 'pcs'),
  ('DB-017', 'Deformed Bar Gr40', 3, '{"size_mm": "20"}', 7.5, 2.466, 18.495, 3000, 'pcs'),
  ('DB-018', 'Deformed Bar Gr40', 3, '{"size_mm": "20"}', 9.0, 2.466, 22.194, 3000, 'pcs'),
  ('DB-019', 'Deformed Bar Gr40', 3, '{"size_mm": "20"}', 10.5, 2.466, 25.893, 3000, 'pcs'),
  ('DB-020', 'Deformed Bar Gr40', 3, '{"size_mm": "20"}', 12.0, 2.466, 29.592, 3000, 'pcs'),
  -- 25mm Gr40
  ('DB-021', 'Deformed Bar Gr40', 3, '{"size_mm": "25"}', 6.0, 3.853, 23.118, 2000, 'pcs'),
  ('DB-022', 'Deformed Bar Gr40', 3, '{"size_mm": "25"}', 7.5, 3.853, 28.898, 2000, 'pcs'),
  ('DB-023', 'Deformed Bar Gr40', 3, '{"size_mm": "25"}', 9.0, 3.853, 34.677, 2000, 'pcs'),
  ('DB-024', 'Deformed Bar Gr40', 3, '{"size_mm": "25"}', 10.5, 3.853, 40.457, 2000, 'pcs'),
  ('DB-025', 'Deformed Bar Gr40', 3, '{"size_mm": "25"}', 12.0, 3.853, 46.236, 2000, 'pcs');

-- ============================================================
-- DEFORMED BARS GR60 (DB-026 to DB-065)
-- ============================================================
-- specs: {"size_mm": "..."}
-- ============================================================

INSERT INTO products (sku, name, category_id, specs, length_m, kg_per_m, weight_per_length, capacity, unit) VALUES
  -- 10mm Gr60
  ('DB-026', 'Deformed Bar Gr60', 3, '{"size_mm": "10"}', 6.0, 0.616, 3.696, 5000, 'pcs'),
  ('DB-027', 'Deformed Bar Gr60', 3, '{"size_mm": "10"}', 7.5, 0.616, 4.620, 5000, 'pcs'),
  ('DB-028', 'Deformed Bar Gr60', 3, '{"size_mm": "10"}', 9.0, 0.616, 5.544, 5000, 'pcs'),
  ('DB-029', 'Deformed Bar Gr60', 3, '{"size_mm": "10"}', 10.5, 0.616, 6.468, 5000, 'pcs'),
  ('DB-030', 'Deformed Bar Gr60', 3, '{"size_mm": "10"}', 12.0, 0.616, 7.392, 5000, 'pcs'),
  -- 12mm Gr60
  ('DB-031', 'Deformed Bar Gr60', 3, '{"size_mm": "12"}', 6.0, 0.888, 5.328, 4500, 'pcs'),
  ('DB-032', 'Deformed Bar Gr60', 3, '{"size_mm": "12"}', 7.5, 0.888, 6.660, 4500, 'pcs'),
  ('DB-033', 'Deformed Bar Gr60', 3, '{"size_mm": "12"}', 9.0, 0.888, 7.992, 4500, 'pcs'),
  ('DB-034', 'Deformed Bar Gr60', 3, '{"size_mm": "12"}', 10.5, 0.888, 9.324, 4500, 'pcs'),
  ('DB-035', 'Deformed Bar Gr60', 3, '{"size_mm": "12"}', 12.0, 0.888, 10.656, 4500, 'pcs'),
  -- 16mm Gr60
  ('DB-036', 'Deformed Bar Gr60', 3, '{"size_mm": "16"}', 6.0, 1.578, 9.468, 4000, 'pcs'),
  ('DB-037', 'Deformed Bar Gr60', 3, '{"size_mm": "16"}', 7.5, 1.578, 11.835, 4000, 'pcs'),
  ('DB-038', 'Deformed Bar Gr60', 3, '{"size_mm": "16"}', 9.0, 1.578, 14.202, 4000, 'pcs'),
  ('DB-039', 'Deformed Bar Gr60', 3, '{"size_mm": "16"}', 10.5, 1.578, 16.569, 4000, 'pcs'),
  ('DB-040', 'Deformed Bar Gr60', 3, '{"size_mm": "16"}', 12.0, 1.578, 18.936, 4000, 'pcs'),
  -- 20mm Gr60
  ('DB-041', 'Deformed Bar Gr60', 3, '{"size_mm": "20"}', 6.0, 2.466, 14.796, 3000, 'pcs'),
  ('DB-042', 'Deformed Bar Gr60', 3, '{"size_mm": "20"}', 7.5, 2.466, 18.495, 3000, 'pcs'),
  ('DB-043', 'Deformed Bar Gr60', 3, '{"size_mm": "20"}', 9.0, 2.466, 22.194, 3000, 'pcs'),
  ('DB-044', 'Deformed Bar Gr60', 3, '{"size_mm": "20"}', 10.5, 2.466, 25.893, 3000, 'pcs'),
  ('DB-045', 'Deformed Bar Gr60', 3, '{"size_mm": "20"}', 12.0, 2.466, 29.592, 3000, 'pcs'),
  -- 25mm Gr60
  ('DB-046', 'Deformed Bar Gr60', 3, '{"size_mm": "25"}', 6.0, 3.853, 23.118, 2000, 'pcs'),
  ('DB-047', 'Deformed Bar Gr60', 3, '{"size_mm": "25"}', 7.5, 3.853, 28.898, 2000, 'pcs'),
  ('DB-048', 'Deformed Bar Gr60', 3, '{"size_mm": "25"}', 9.0, 3.853, 34.677, 2000, 'pcs'),
  ('DB-049', 'Deformed Bar Gr60', 3, '{"size_mm": "25"}', 10.5, 3.853, 40.457, 2000, 'pcs'),
  ('DB-050', 'Deformed Bar Gr60', 3, '{"size_mm": "25"}', 12.0, 3.853, 46.236, 2000, 'pcs'),
  -- 28mm Gr60
  ('DB-051', 'Deformed Bar Gr60', 3, '{"size_mm": "28"}', 6.0, 4.834, 29.004, 1500, 'pcs'),
  ('DB-052', 'Deformed Bar Gr60', 3, '{"size_mm": "28"}', 7.5, 4.834, 36.255, 1500, 'pcs'),
  ('DB-053', 'Deformed Bar Gr60', 3, '{"size_mm": "28"}', 9.0, 4.834, 43.506, 1500, 'pcs'),
  ('DB-054', 'Deformed Bar Gr60', 3, '{"size_mm": "28"}', 10.5, 4.834, 50.757, 1500, 'pcs'),
  ('DB-055', 'Deformed Bar Gr60', 3, '{"size_mm": "28"}', 12.0, 4.834, 58.008, 1500, 'pcs'),
  -- 32mm Gr60
  ('DB-056', 'Deformed Bar Gr60', 3, '{"size_mm": "32"}', 6.0, 6.313, 37.878, 1000, 'pcs'),
  ('DB-057', 'Deformed Bar Gr60', 3, '{"size_mm": "32"}', 7.5, 6.313, 47.348, 1000, 'pcs'),
  ('DB-058', 'Deformed Bar Gr60', 3, '{"size_mm": "32"}', 9.0, 6.313, 56.817, 1000, 'pcs'),
  ('DB-059', 'Deformed Bar Gr60', 3, '{"size_mm": "32"}', 10.5, 6.313, 66.287, 1000, 'pcs'),
  ('DB-060', 'Deformed Bar Gr60', 3, '{"size_mm": "32"}', 12.0, 6.313, 75.756, 1000, 'pcs'),
  -- 36mm Gr60
  ('DB-061', 'Deformed Bar Gr60', 3, '{"size_mm": "36"}', 6.0, 7.990, 47.940, 800, 'pcs'),
  ('DB-062', 'Deformed Bar Gr60', 3, '{"size_mm": "36"}', 7.5, 7.990, 59.925, 800, 'pcs'),
  ('DB-063', 'Deformed Bar Gr60', 3, '{"size_mm": "36"}', 9.0, 7.990, 71.910, 800, 'pcs'),
  ('DB-064', 'Deformed Bar Gr60', 3, '{"size_mm": "36"}', 10.5, 7.990, 83.895, 800, 'pcs'),
  ('DB-065', 'Deformed Bar Gr60', 3, '{"size_mm": "36"}', 12.0, 7.990, 95.880, 800, 'pcs');

-- ============================================================
-- COMPANIES
-- ============================================================

INSERT INTO companies (id, name, code) OVERRIDING SYSTEM VALUE VALUES
  ('d715a70c-6bf7-41bf-bd82-6f0eec57b26d', 'Kirin',   'KRN'),
  ('e52e9c2a-623c-4d49-87c0-51e1cadff60d', 'Regan',   'RGN'),
  ('3082b68c-24cc-4940-ad97-f1c889cd41f3', 'Supremo', 'SUP');

-- ============================================================
-- CLIENTS
-- ============================================================

INSERT INTO clients (id, name, contact_person, email, phone, address, city) OVERRIDING SYSTEM VALUE VALUES
  (6,  'Manila Steel Corp',           'Juan Dela Cruz',                'info@manilasteel.ph',      '0917-123-4567', '123 Tondo Blvd, Manila',                          'Manila'),
  (7,  'Cebu Iron Works',             'Maria Santos',                  'sales@cebuiron.ph',        '0918-234-5678', '45 Mandaue Industrial, Cebu',                     'Cebu'),
  (8,  'Davao Builders Supply',       'Pedro Reyes',                   'orders@davaobuild.ph',     '0919-345-6789', '78 Bajada St, Davao City',                        'Davao'),
  (9,  'Iloilo Metal Trading',        'Ana Garcia',                    'info@iloilometal.ph',      '0920-456-7890', '12 La Paz Rd, Iloilo City',                       'Iloilo'),
  (10, 'Pampanga Hardware Co.',       'Roberto Cruz',                  'sales@pampangahw.ph',      '0921-567-8901', '56 MacArthur Hwy, San Fernando',                  'Pampanga'),
  (11, 'Batangas Steel Depot',        'Carmen Aquino',                 'depot@batangassteel.ph',   '0922-678-9012', '89 Batangas Port Area, Batangas City',            'Batangas'),
  (12, 'Laguna Construction Supply',  'Jose Mendoza',                  'supply@lagunacon.ph',      '0923-789-0123', '34 National Hwy, Calamba, Laguna',                'Laguna'),
  (13, 'Cagayan de Oro Metals',       'Linda Tan',                     'metals@cdometals.ph',      '0924-890-1234', '67 Limketkai Dr, CDO',                            'Cagayan de Oro'),
  (14, 'Zamboanga Trading Inc.',      'Ricardo Lim',                   'trade@zambotrading.ph',    '0925-901-2345', '23 Veterans Ave, Zamboanga City',                  'Zamboanga'),
  (15, 'Pangasinan Steelworks',       'Teresa Ramos',                  'steel@pangsteel.ph',       '0926-012-3456', '91 Dagupan Blvd, Pangasinan',                     'Pangasinan'),
  (16, 'Regan Industrial',            'Regan Industrial Sales Dept.',  'sales@reganindustrial.ph', '(02) 8888-7777', 'Lot 5 Block 3, LISP, Brgy. Diezmo',              'Cabuyao, Laguna 4025');

SELECT setval(pg_get_serial_sequence('clients', 'id'), (SELECT max(id) FROM clients));

-- ============================================================
-- RESET SEQUENCES after explicit ID inserts
-- ============================================================

SELECT setval(pg_get_serial_sequence('categories', 'id'), (SELECT max(id) FROM categories));
SELECT setval(pg_get_serial_sequence('warehouses', 'id'), (SELECT max(id) FROM warehouses));

-- ============================================================
-- SEED COMPLETE
-- Total products: 249
--   Equal Angle Bars:   75  (AB-001 to AB-075)
--   Unequal Angle Bars: 26  (UA-001 to UA-026)
--   Channel Bars:       83  (CB-001 to CB-083)
--   Deformed Bars:      65  (DB-001 to DB-065)
-- Companies:            3   (Kirin, Regan, Supremo)
-- Clients:              11
-- ============================================================
