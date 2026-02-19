-- ============================================================
-- DELIVERIES: Replace delivered_by with processed_by (FK to auth.users)
-- ============================================================
-- Renames delivered_by to processed_by_name (display text),
-- adds processed_by as UUID FK to auth.users for referential integrity.
-- ============================================================

-- A. Rename delivered_by → processed_by_name (keeps existing data)
ALTER TABLE deliveries RENAME COLUMN delivered_by TO processed_by_name;

-- B. Add processed_by UUID FK to auth.users
ALTER TABLE deliveries ADD COLUMN processed_by uuid REFERENCES auth.users(id);

-- C. Update record_delivery RPC
CREATE OR REPLACE FUNCTION record_delivery(
  p_order_id bigint,
  p_deliveries jsonb,
  p_notes text DEFAULT NULL,
  p_delivered_by text DEFAULT NULL,
  p_processed_by uuid DEFAULT NULL
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
  v_delivery_id bigint;
BEGIN
  SELECT status INTO v_current_status
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  IF v_current_status NOT IN ('processing', 'partial_delivered') THEN
    RAISE EXCEPTION 'Cannot record delivery for order with status: %', v_current_status;
  END IF;

  -- Create delivery batch record with both UUID and display name
  INSERT INTO deliveries (order_id, processed_by, processed_by_name, notes)
  VALUES (p_order_id, p_processed_by, p_delivered_by, p_notes)
  RETURNING id INTO v_delivery_id;

  FOR v_delivery IN SELECT * FROM jsonb_array_elements(p_deliveries)
  LOOP
    v_item_id := (v_delivery->>'order_item_id')::bigint;
    v_qty := (v_delivery->>'qty')::integer;

    IF v_qty IS NULL OR v_qty <= 0 THEN
      CONTINUE;
    END IF;

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

    INSERT INTO delivery_items (delivery_id, order_item_id, qty)
    VALUES (v_delivery_id, v_item_id, v_qty);

    UPDATE order_items
    SET delivered_qty = delivered_qty + v_qty
    WHERE id = v_item_id AND order_id = p_order_id;
  END LOOP;

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
