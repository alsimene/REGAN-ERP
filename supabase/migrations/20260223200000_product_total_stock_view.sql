CREATE VIEW product_total_stock AS
SELECT product_id, COALESCE(SUM(quantity), 0)::int AS total_stock
FROM warehouse_stock
GROUP BY product_id;
