-- ============================================================
-- PURCHASE ORDERS: Remove warehouse_id requirement
-- ============================================================
-- Purchase orders don't require a warehouse. Stock is only
-- deducted/moved when items are actually dispatched from a
-- specific warehouse (during delivery).
-- ============================================================

-- 1. Recreate the RPC: convert warehouse_id 0 → NULL, skip stock ops when NULL
DROP FUNCTION IF EXISTS public.create_order_with_items(text, bigint, text, text, jsonb, text, bigint, bigint);

CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_order_number text,
  p_client_id bigint,
  p_salesperson text,
  p_notes text,
  p_items jsonb,
  p_created_by text DEFAULT NULL,
  p_client_warehouse_id bigint DEFAULT NULL,
  p_supplier_id bigint DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order_id bigint;
  v_item jsonb;
  v_available int;
  v_subtotal numeric := 0;
  v_tax numeric;
  v_total numeric;
  v_class text;
  v_performer text;
  v_warehouse_id bigint;
BEGIN
  v_performer := COALESCE(p_created_by, p_salesperson);

  -- Calculate subtotal
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_subtotal := v_subtotal + (
      (v_item->>'quantity')::int *
      (v_item->>'weight_per_piece')::numeric *
      (v_item->>'price_per_kg')::numeric
    );
  END LOOP;

  v_tax := ROUND(v_subtotal * 0.12, 2);
  v_total := v_subtotal + v_tax;

  -- Create the order
  INSERT INTO orders (order_number, client_id, salesperson, subtotal, tax, total, notes, created_by, client_warehouse_id, supplier_id)
  VALUES (p_order_number, p_client_id, p_salesperson, v_subtotal, v_tax, v_total, p_notes, v_performer, p_client_warehouse_id, p_supplier_id)
  RETURNING id INTO v_order_id;

  -- Process each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_class := v_item->>'classification';

    -- Resolve warehouse_id: treat 0 or missing as NULL
    v_warehouse_id := NULLIF((v_item->>'warehouse_id')::bigint, 0);

    -- Insert order item (warehouse_id can be NULL for purchase orders)
    INSERT INTO order_items (order_id, product_id, warehouse_id, quantity, classification, price_per_kg, weight_per_piece)
    VALUES (v_order_id, (v_item->>'product_id')::bigint, v_warehouse_id,
            (v_item->>'quantity')::int, v_class, (v_item->>'price_per_kg')::numeric,
            (v_item->>'weight_per_piece')::numeric);

    -- Only deduct stock and log movements when a warehouse is specified
    IF v_warehouse_id IS NOT NULL THEN
      IF v_class = 'c1' THEN
        SELECT c1 INTO v_available FROM warehouse_stock
          WHERE product_id = (v_item->>'product_id')::bigint
            AND warehouse_id = v_warehouse_id
          FOR UPDATE;
        IF v_available < (v_item->>'quantity')::int THEN
          RAISE EXCEPTION 'Insufficient C1 stock for product %', v_item->>'product_id';
        END IF;
        UPDATE warehouse_stock SET c1 = c1 - (v_item->>'quantity')::int
          WHERE product_id = (v_item->>'product_id')::bigint
            AND warehouse_id = v_warehouse_id;
      ELSIF v_class = 'c2' THEN
        SELECT c2 INTO v_available FROM warehouse_stock
          WHERE product_id = (v_item->>'product_id')::bigint
            AND warehouse_id = v_warehouse_id
          FOR UPDATE;
        IF v_available < (v_item->>'quantity')::int THEN
          RAISE EXCEPTION 'Insufficient C2 stock for product %', v_item->>'product_id';
        END IF;
        UPDATE warehouse_stock SET c2 = c2 - (v_item->>'quantity')::int
          WHERE product_id = (v_item->>'product_id')::bigint
            AND warehouse_id = v_warehouse_id;
      ELSIF v_class = 'c3' THEN
        SELECT c3 INTO v_available FROM warehouse_stock
          WHERE product_id = (v_item->>'product_id')::bigint
            AND warehouse_id = v_warehouse_id
          FOR UPDATE;
        IF v_available < (v_item->>'quantity')::int THEN
          RAISE EXCEPTION 'Insufficient C3 stock for product %', v_item->>'product_id';
        END IF;
        UPDATE warehouse_stock SET c3 = c3 - (v_item->>'quantity')::int
          WHERE product_id = (v_item->>'product_id')::bigint
            AND warehouse_id = v_warehouse_id;
      END IF;

      INSERT INTO stock_movements (product_id, warehouse_id, movement_type, classification, quantity, reference_id, performed_by)
      VALUES ((v_item->>'product_id')::bigint, v_warehouse_id, 'sale', v_class,
              -(v_item->>'quantity')::int, p_order_number, v_performer);
    END IF;
  END LOOP;

  RETURN v_order_id;
END;
$function$;
