-- ============================================================
-- ORDER APPROVAL WORKFLOW
-- ============================================================
-- Adds CEO approval step before order processing.
-- New flow: pending_approval → approved → processing →
--           partial_delivered → delivered → completed
-- With: rejected, cancelled as terminal states.
-- ============================================================

-- A. order_approvals audit table
CREATE TABLE order_approvals (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id          bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  action            text NOT NULL CHECK (action IN ('approved', 'rejected')),
  performed_by      uuid REFERENCES auth.users(id),
  performed_by_name text,
  notes             text,
  created_at        timestamptz DEFAULT now()
);
CREATE INDEX idx_order_approvals_order ON order_approvals(order_id);

-- B. Add tracking columns to orders
ALTER TABLE orders ADD COLUMN approved_by text;
ALTER TABLE orders ADD COLUMN approved_at timestamptz;
ALTER TABLE orders ADD COLUMN rejected_by text;
ALTER TABLE orders ADD COLUMN rejected_at timestamptz;
ALTER TABLE orders ADD COLUMN rejection_notes text;
ALTER TABLE orders ADD COLUMN completed_at timestamptz;
ALTER TABLE orders ADD COLUMN completed_by text;

-- C. Update status CHECK constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending_approval','approved','processing','partial_delivered','delivered','completed','cancelled','rejected'));

-- D. Migrate existing data
UPDATE orders SET status = 'pending_approval' WHERE status = 'pending';
UPDATE orders SET status = 'approved' WHERE status = 'in_transit';
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending_approval';

-- E. Expand stock_movements.movement_type CHECK
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_movement_type_check;
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_movement_type_check
  CHECK (movement_type IN ('receive','sale','transfer_in','transfer_out','adjustment','return','rejection_reversal','cancellation_reversal'));

-- F. Helper: restore_order_stock
CREATE OR REPLACE FUNCTION restore_order_stock(
  p_order_id bigint,
  p_movement_type text,
  p_performed_by text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_restore_qty integer;
  v_order_number text;
BEGIN
  SELECT order_number INTO v_order_number FROM orders WHERE id = p_order_id;

  FOR v_item IN
    SELECT oi.id, oi.product_id, oi.warehouse_id, oi.quantity, oi.delivered_qty, oi.classification
    FROM order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    v_restore_qty := v_item.quantity - v_item.delivered_qty;
    IF v_restore_qty <= 0 THEN
      CONTINUE;
    END IF;

    -- Restore stock by classification
    IF v_item.classification = 'c1' THEN
      UPDATE warehouse_stock
      SET c1 = c1 + v_restore_qty, updated_at = now()
      WHERE product_id = v_item.product_id AND warehouse_id = v_item.warehouse_id;
    ELSIF v_item.classification = 'c2' THEN
      UPDATE warehouse_stock
      SET c2 = c2 + v_restore_qty, updated_at = now()
      WHERE product_id = v_item.product_id AND warehouse_id = v_item.warehouse_id;
    ELSIF v_item.classification = 'c3' THEN
      UPDATE warehouse_stock
      SET c3 = c3 + v_restore_qty, updated_at = now()
      WHERE product_id = v_item.product_id AND warehouse_id = v_item.warehouse_id;
    END IF;

    -- Record stock movement
    INSERT INTO stock_movements (product_id, warehouse_id, movement_type, classification, quantity, reference_id, performed_by)
    VALUES (v_item.product_id, v_item.warehouse_id, p_movement_type, v_item.classification,
            v_restore_qty, v_order_number, p_performed_by);
  END LOOP;
END;
$$;

-- G. Replace update_order_status RPC with approval workflow
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id bigint,
  p_new_status text,
  p_performed_by text DEFAULT NULL,
  p_performed_by_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status text;
BEGIN
  SELECT status INTO v_current_status
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  -- Validate transitions
  CASE p_new_status
    WHEN 'approved' THEN
      IF v_current_status != 'pending_approval' THEN
        RAISE EXCEPTION 'Can only approve from pending_approval. Current: %', v_current_status;
      END IF;
      -- Record approval audit
      INSERT INTO order_approvals (order_id, action, performed_by, performed_by_name, notes)
      VALUES (p_order_id, 'approved', p_performed_by_id, p_performed_by, p_notes);
      -- Update order
      UPDATE orders
      SET status = 'approved', approved_by = p_performed_by, approved_at = now(), updated_at = now()
      WHERE id = p_order_id;

    WHEN 'rejected' THEN
      IF v_current_status != 'pending_approval' THEN
        RAISE EXCEPTION 'Can only reject from pending_approval. Current: %', v_current_status;
      END IF;
      -- Record rejection audit
      INSERT INTO order_approvals (order_id, action, performed_by, performed_by_name, notes)
      VALUES (p_order_id, 'rejected', p_performed_by_id, p_performed_by, p_notes);
      -- Restore ALL stock (nothing delivered yet)
      PERFORM restore_order_stock(p_order_id, 'rejection_reversal', p_performed_by);
      -- Update order
      UPDATE orders
      SET status = 'rejected', rejected_by = p_performed_by, rejected_at = now(),
          rejection_notes = p_notes, updated_at = now()
      WHERE id = p_order_id;

    WHEN 'processing' THEN
      IF v_current_status != 'approved' THEN
        RAISE EXCEPTION 'Can only move to processing from approved. Current: %', v_current_status;
      END IF;
      UPDATE orders
      SET status = 'processing', updated_at = now()
      WHERE id = p_order_id;

    WHEN 'completed' THEN
      IF v_current_status != 'delivered' THEN
        RAISE EXCEPTION 'Can only complete from delivered. Current: %', v_current_status;
      END IF;
      UPDATE orders
      SET status = 'completed', completed_at = now(), completed_by = p_performed_by, updated_at = now()
      WHERE id = p_order_id;

    WHEN 'cancelled' THEN
      IF v_current_status IN ('completed', 'cancelled', 'rejected') THEN
        RAISE EXCEPTION 'Cannot cancel an order that is %', v_current_status;
      END IF;
      -- Restore undelivered stock
      PERFORM restore_order_stock(p_order_id, 'cancellation_reversal', p_performed_by);
      UPDATE orders
      SET status = 'cancelled', updated_at = now()
      WHERE id = p_order_id;

    ELSE
      RAISE EXCEPTION 'Invalid target status: %. Use record_delivery for delivery transitions.', p_new_status;
  END CASE;
END;
$$;

-- H. Update create_order_with_items — default status is now pending_approval (via column default)
-- Re-create to preserve stock deduction logic with new default
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_order_number text,
  p_client_id bigint,
  p_salesperson text,
  p_notes text,
  p_items jsonb,
  p_created_by text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id bigint;
  v_item jsonb;
  v_available int;
  v_subtotal numeric := 0;
  v_tax numeric;
  v_total numeric;
  v_class text;
  v_performer text;
BEGIN
  v_performer := COALESCE(p_created_by, p_salesperson);

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_subtotal := v_subtotal + (
      (v_item->>'quantity')::int *
      (v_item->>'weight_per_piece')::numeric *
      (v_item->>'price_per_kg')::numeric
    );
  END LOOP;

  v_tax := ROUND(v_subtotal * 0.12, 2);
  v_total := v_subtotal + v_tax;

  -- status will default to 'pending_approval' via column default
  INSERT INTO orders (order_number, client_id, salesperson, subtotal, tax, total, notes, created_by)
  VALUES (p_order_number, p_client_id, p_salesperson, v_subtotal, v_tax, v_total, p_notes, v_performer)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_class := v_item->>'classification';

    IF v_class = 'c1' THEN
      SELECT c1 INTO v_available FROM warehouse_stock
        WHERE product_id = (v_item->>'product_id')::bigint
          AND warehouse_id = (v_item->>'warehouse_id')::bigint
        FOR UPDATE;
      IF v_available < (v_item->>'quantity')::int THEN
        RAISE EXCEPTION 'Insufficient C1 stock for product %', v_item->>'product_id';
      END IF;
      UPDATE warehouse_stock SET c1 = c1 - (v_item->>'quantity')::int
        WHERE product_id = (v_item->>'product_id')::bigint
          AND warehouse_id = (v_item->>'warehouse_id')::bigint;
    ELSIF v_class = 'c2' THEN
      SELECT c2 INTO v_available FROM warehouse_stock
        WHERE product_id = (v_item->>'product_id')::bigint
          AND warehouse_id = (v_item->>'warehouse_id')::bigint
        FOR UPDATE;
      IF v_available < (v_item->>'quantity')::int THEN
        RAISE EXCEPTION 'Insufficient C2 stock for product %', v_item->>'product_id';
      END IF;
      UPDATE warehouse_stock SET c2 = c2 - (v_item->>'quantity')::int
        WHERE product_id = (v_item->>'product_id')::bigint
          AND warehouse_id = (v_item->>'warehouse_id')::bigint;
    ELSIF v_class = 'c3' THEN
      SELECT c3 INTO v_available FROM warehouse_stock
        WHERE product_id = (v_item->>'product_id')::bigint
          AND warehouse_id = (v_item->>'warehouse_id')::bigint
        FOR UPDATE;
      IF v_available < (v_item->>'quantity')::int THEN
        RAISE EXCEPTION 'Insufficient C3 stock for product %', v_item->>'product_id';
      END IF;
      UPDATE warehouse_stock SET c3 = c3 - (v_item->>'quantity')::int
        WHERE product_id = (v_item->>'product_id')::bigint
          AND warehouse_id = (v_item->>'warehouse_id')::bigint;
    END IF;

    INSERT INTO order_items (order_id, product_id, warehouse_id, quantity, classification, price_per_kg, weight_per_piece)
    VALUES (v_order_id, (v_item->>'product_id')::bigint, (v_item->>'warehouse_id')::bigint,
            (v_item->>'quantity')::int, v_class, (v_item->>'price_per_kg')::numeric,
            (v_item->>'weight_per_piece')::numeric);

    INSERT INTO stock_movements (product_id, warehouse_id, movement_type, classification, quantity, reference_id, performed_by)
    VALUES ((v_item->>'product_id')::bigint, (v_item->>'warehouse_id')::bigint, 'sale', v_class,
            -(v_item->>'quantity')::int, p_order_number, v_performer);
  END LOOP;

  RETURN v_order_id;
END;
$$;

-- I. Update views

-- monthly_sales: Include completed in revenue
CREATE OR REPLACE VIEW monthly_sales AS
SELECT
  date_trunc('month', o.order_date) AS month,
  count(DISTINCT o.id) AS order_count,
  coalesce(sum(o.total), 0) AS revenue,
  coalesce(sum(oi.total_weight), 0) AS total_weight_kg
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.status IN ('delivered', 'partial_delivered', 'completed')
GROUP BY date_trunc('month', o.order_date)
ORDER BY month DESC;

-- client_sales_summary: Exclude rejected alongside cancelled
CREATE OR REPLACE VIEW client_sales_summary AS
SELECT
  cl.id AS client_id,
  cl.name AS client_name,
  cl.city,
  count(DISTINCT o.id) AS order_count,
  coalesce(sum(o.total), 0) AS total_revenue,
  max(o.order_date) AS last_order_date
FROM clients cl
LEFT JOIN orders o ON o.client_id = cl.id AND o.status NOT IN ('cancelled', 'rejected')
GROUP BY cl.id, cl.name, cl.city;

-- get_dashboard_stats: Exclude rejected/cancelled from revenue
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT json_build_object(
    'revenue',           coalesce((SELECT sum(total) FROM orders WHERE status NOT IN ('cancelled', 'rejected')), 0),
    'total_orders',      (SELECT count(*) FROM orders WHERE status NOT IN ('cancelled', 'rejected')),
    'total_stock',       coalesce((SELECT sum(coalesce(c1,0)+coalesce(c2,0)+coalesce(c3,0)) FROM warehouse_stock), 0),
    'pending_shipments', (SELECT count(*) FROM shipments WHERE status <> 'delivered')
  );
$$;
