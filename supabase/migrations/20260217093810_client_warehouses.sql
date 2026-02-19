-- ============================================================
-- Client Warehouses (Shipping Destinations)
-- ============================================================

-- 1. Create client_warehouses table
CREATE TABLE client_warehouses (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id   bigint NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name        text NOT NULL,
  address     text,
  city        text,
  contact_person text,
  phone       text,
  is_default  boolean NOT NULL DEFAULT false,
  created_by  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_warehouses_client_id ON client_warehouses(client_id);

-- 2. Add client_warehouse_id to orders (nullable for backwards compat)
ALTER TABLE orders
  ADD COLUMN client_warehouse_id bigint REFERENCES client_warehouses(id);

-- 3. Seed: create a default warehouse for each client that has an address
INSERT INTO client_warehouses (client_id, name, address, city, contact_person, phone, is_default, created_by)
SELECT
  c.id,
  'Main Office',
  c.address,
  c.city,
  c.contact_person,
  c.phone,
  true,
  'system_migration'
FROM clients c
WHERE c.address IS NOT NULL AND c.address <> '';

-- 4. Update create_order_with_items RPC to accept p_client_warehouse_id
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_order_number text,
  p_client_id bigint,
  p_salesperson text,
  p_notes text,
  p_items jsonb,
  p_created_by text DEFAULT NULL,
  p_client_warehouse_id bigint DEFAULT NULL
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

  INSERT INTO orders (order_number, client_id, salesperson, subtotal, tax, total, notes, created_by, client_warehouse_id)
  VALUES (p_order_number, p_client_id, p_salesperson, v_subtotal, v_tax, v_total, p_notes, v_performer, p_client_warehouse_id)
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

-- 5. Update order_summary view to include warehouse destination
CREATE OR REPLACE VIEW order_summary AS
SELECT
  o.id AS order_id,
  o.order_number,
  cl.name AS client_name,
  o.order_date,
  o.status,
  o.payment_status,
  o.subtotal,
  o.tax,
  o.total,
  count(oi.id) AS item_count,
  coalesce(sum(oi.total_weight), 0) AS total_weight_kg,
  o.created_at,
  cw.name AS ship_to_warehouse,
  cw.city AS ship_to_city
FROM orders o
JOIN clients cl ON cl.id = o.client_id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN client_warehouses cw ON cw.id = o.client_warehouse_id
GROUP BY o.id, o.order_number, cl.name, o.order_date, o.status, o.payment_status,
         o.subtotal, o.tax, o.total, o.created_at, cw.name, cw.city;
