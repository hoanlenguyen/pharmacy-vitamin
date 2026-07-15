-- Phase C.1: guest checkout. The real checkout flow has no logged-in customer and no
-- pre-existing address row (addresses.user_id is NOT NULL), so shipping/customer details
-- for an order are stored directly on the order itself. orders.user_id and
-- orders.shipping_address_id stay NULL for these; the columns below are the source of
-- truth whenever they are set (see worker/src/routes/adminOrders.ts's COALESCE).
ALTER TABLE orders ADD COLUMN customer_name TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN customer_email TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN customer_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN shipping_name TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN shipping_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN shipping_line1 TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN shipping_line2 TEXT;
ALTER TABLE orders ADD COLUMN shipping_city TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN shipping_region TEXT;
ALTER TABLE orders ADD COLUMN shipping_postal_code TEXT;
ALTER TABLE orders ADD COLUMN shipping_country TEXT NOT NULL DEFAULT 'VN';
ALTER TABLE orders ADD COLUMN notes TEXT;
