-- ============================================================
-- CREATE ORDER WITH STOCK DEDUCTION
-- ============================================================
-- Adds salesperson column to orders and creates the
-- create_order_with_items RPC for atomic order creation
-- with stock deduction.
-- ============================================================

-- A. Add salesperson column to orders
ALTER TABLE orders ADD COLUMN salesperson text;

-- B. Create RPC for atomic order creation with stock deduction
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_order_number text,
  p_client_id bigint,
  p_salesperson text,
  p_notes text,
  p_items jsonb
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
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_subtotal := v_subtotal + (
      (v_item->>'quantity')::int *
      (v_item->>'weight_per_piece')::numeric *
      (v_item->>'price_per_kg')::numeric
    );
  END LOOP;

  v_tax := ROUND(v_subtotal * 0.12, 2);
  v_total := v_subtotal + v_tax;

  INSERT INTO orders (order_number, client_id, salesperson, subtotal, tax, total, notes)
  VALUES (p_order_number, p_client_id, p_salesperson, v_subtotal, v_tax, v_total, p_notes)
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
            -(v_item->>'quantity')::int, p_order_number, p_salesperson);
  END LOOP;

  RETURN v_order_id;
END;
$$;
