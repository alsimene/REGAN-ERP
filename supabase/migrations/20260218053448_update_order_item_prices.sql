-- ============================================================
-- UPDATE ORDER ITEM PRICES
-- ============================================================
-- Allows editing price_per_kg on order items during approval.
-- Recalculates order subtotal/tax/total after price changes.
-- Only works on orders in pending_approval status.
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_order_item_prices(
  p_order_id bigint,
  p_items jsonb,  -- array of { "item_id": bigint, "price_per_kg": numeric }
  p_updated_by text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_item jsonb;
  v_status text;
  v_subtotal numeric;
  v_tax numeric;
  v_total numeric;
BEGIN
  -- Verify order exists and is in pending_approval status
  SELECT status INTO v_status FROM orders WHERE id = p_order_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;
  IF v_status <> 'pending_approval' THEN
    RAISE EXCEPTION 'Prices can only be edited on orders pending approval (current status: %)', v_status;
  END IF;

  -- Update each item's price
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    UPDATE order_items
    SET price_per_kg = (v_item->>'price_per_kg')::numeric
    WHERE id = (v_item->>'item_id')::bigint
      AND order_id = p_order_id;
  END LOOP;

  -- Recalculate order totals from the (now-updated) generated columns
  SELECT coalesce(sum(line_total), 0) INTO v_subtotal
  FROM order_items WHERE order_id = p_order_id;

  v_tax := ROUND(v_subtotal * 0.12, 2);
  v_total := v_subtotal + v_tax;

  UPDATE orders
  SET subtotal = v_subtotal,
      tax = v_tax,
      total = v_total
  WHERE id = p_order_id;

  RETURN json_build_object(
    'subtotal', v_subtotal,
    'tax', v_tax,
    'total', v_total
  );
END;
$function$;
