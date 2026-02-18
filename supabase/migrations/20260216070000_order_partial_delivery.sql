-- ============================================================
-- ORDER PARTIAL DELIVERY SUPPORT
-- ============================================================
-- Adds delivered_qty tracking per line item, expands order
-- statuses to include partial_delivered, and provides RPCs
-- for status transitions and delivery recording.
-- ============================================================

-- A. Add delivered_qty to order_items
ALTER TABLE order_items
  ADD COLUMN delivered_qty integer NOT NULL DEFAULT 0;

ALTER TABLE order_items
  ADD CONSTRAINT order_items_delivered_qty_check
  CHECK (delivered_qty >= 0 AND delivered_qty <= quantity);

-- B. Expand orders.status CHECK to include partial_delivered
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','processing','in_transit','partial_delivered','delivered','cancelled'));

-- C. update_order_status RPC — simple transitions (pending→processing, →cancelled)
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id bigint,
  p_new_status text
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

  -- Only allow processing and cancelled as targets via this function
  IF p_new_status NOT IN ('processing', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid target status: %. Use record_delivery for delivery transitions.', p_new_status;
  END IF;

  -- Validate transitions
  IF p_new_status = 'processing' AND v_current_status != 'pending' THEN
    RAISE EXCEPTION 'Can only move to processing from pending. Current: %', v_current_status;
  END IF;

  IF p_new_status = 'cancelled' AND v_current_status IN ('delivered', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot cancel an order that is %. Current: %', v_current_status, v_current_status;
  END IF;

  UPDATE orders
  SET status = p_new_status, updated_at = now()
  WHERE id = p_order_id;
END;
$$;

-- D. record_delivery RPC — atomic batch delivery recording
CREATE OR REPLACE FUNCTION record_delivery(
  p_order_id bigint,
  p_deliveries jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status text;
  v_delivery jsonb;
  v_item_id bigint;
  v_qty integer;
  v_existing_delivered integer;
  v_max_qty integer;
  v_all_fulfilled boolean := true;
  v_new_status text;
BEGIN
  -- Lock the order row
  SELECT status INTO v_current_status
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  -- Validate current status allows delivery
  IF v_current_status NOT IN ('processing', 'partial_delivered') THEN
    RAISE EXCEPTION 'Cannot record delivery for order with status: %', v_current_status;
  END IF;

  -- Process each delivery entry
  FOR v_delivery IN SELECT * FROM jsonb_array_elements(p_deliveries)
  LOOP
    v_item_id := (v_delivery->>'order_item_id')::bigint;
    v_qty := (v_delivery->>'qty')::integer;

    IF v_qty IS NULL OR v_qty <= 0 THEN
      CONTINUE;
    END IF;

    -- Get current item state
    SELECT delivered_qty, quantity INTO v_existing_delivered, v_max_qty
    FROM order_items
    WHERE id = v_item_id AND order_id = p_order_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Order item % not found in order %', v_item_id, p_order_id;
    END IF;

    IF v_existing_delivered + v_qty > v_max_qty THEN
      RAISE EXCEPTION 'Delivery of % would exceed remaining quantity for item %. Already delivered: %, max: %',
        v_qty, v_item_id, v_existing_delivered, v_max_qty;
    END IF;

    UPDATE order_items
    SET delivered_qty = delivered_qty + v_qty
    WHERE id = v_item_id AND order_id = p_order_id;
  END LOOP;

  -- Check if all items are fully delivered
  SELECT bool_and(delivered_qty >= quantity) INTO v_all_fulfilled
  FROM order_items
  WHERE order_id = p_order_id;

  v_new_status := CASE WHEN v_all_fulfilled THEN 'delivered' ELSE 'partial_delivered' END;

  UPDATE orders
  SET status = v_new_status, updated_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'new_status', v_new_status,
    'all_fulfilled', v_all_fulfilled
  );
END;
$$;

-- E. Update monthly_sales view to include partial_delivered orders in revenue
CREATE OR REPLACE VIEW monthly_sales AS
SELECT
  date_trunc('month', o.order_date) AS month,
  count(DISTINCT o.id) AS order_count,
  coalesce(sum(o.total), 0) AS revenue,
  coalesce(sum(oi.total_weight), 0) AS total_weight_kg
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.status IN ('delivered', 'partial_delivered')
GROUP BY date_trunc('month', o.order_date)
ORDER BY month DESC;
