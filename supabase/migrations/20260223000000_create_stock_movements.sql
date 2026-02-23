-- Stock movements audit trail
-- Every inventory change (restock, adjustment, delivery, transfer, reclassify)
-- is recorded here with WHO did WHAT and WHEN.

CREATE TABLE stock_movements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id    uuid NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  movement_type   text NOT NULL CHECK (movement_type IN (
    'restock', 'adjustment_add', 'adjustment_remove',
    'delivery', 'transfer_in', 'transfer_out', 'reclassify'
  )),
  classification  text NOT NULL CHECK (classification IN ('C1', 'C2', 'C3')),
  quantity        integer NOT NULL,
  performed_by    text NOT NULL,
  notes           text,
  reference_id    text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_movements_product   ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX idx_stock_movements_created   ON stock_movements(created_at DESC);
