-- ============================================================
-- RESTORE ORDER ITEMS WAREHOUSE FK
-- ============================================================
-- Ensures order_items.warehouse_id FK to warehouses exists.
-- The purchase_order_no_warehouse migration made warehouse_id
-- nullable but this ensures the FK constraint is still in place.
-- ============================================================

-- Re-add FK if it was dropped (idempotent via IF NOT EXISTS pattern)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'order_items_warehouse_id_fkey'
      AND table_name = 'order_items'
  ) THEN
    ALTER TABLE order_items
      ADD CONSTRAINT order_items_warehouse_id_fkey
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id);
  END IF;
END $$;
