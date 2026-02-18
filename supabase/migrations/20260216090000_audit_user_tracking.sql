-- ============================================================
-- AUDIT: USER TRACKING ON ALL DATA-MODIFYING ACTIONS
-- ============================================================
-- Adds created_by / updated_by columns and updates RPCs to
-- record who performed each transaction.
-- ============================================================

-- A. Add created_by to orders
ALTER TABLE orders ADD COLUMN created_by text;

-- B. Add created_by to clients
ALTER TABLE clients ADD COLUMN created_by text;

-- C. Add updated_by to market_prices
ALTER TABLE market_prices ADD COLUMN updated_by text;

-- D. Update update_order_status RPC to accept performed_by
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id bigint,
  p_new_status text,
  p_performed_by text DEFAULT NULL
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

  IF p_new_status NOT IN ('processing', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid target status: %. Use record_delivery for delivery transitions.', p_new_status;
  END IF;

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

-- E. Update update_market_price RPC to accept updated_by
CREATE OR REPLACE FUNCTION update_market_price(
  p_category_id int,
  p_price numeric,
  p_notes text DEFAULT NULL,
  p_updated_by text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE market_prices
    SET is_active = false
  WHERE category_id = p_category_id
    AND is_active = true;

  INSERT INTO market_prices (category_id, price_per_kg, is_active, notes, updated_by)
  VALUES (p_category_id, p_price, true, p_notes, p_updated_by);
END;
$$;

-- F. Update create_order_with_items RPC to accept created_by
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
