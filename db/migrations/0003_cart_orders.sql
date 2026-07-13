-- Phase C: addresses, server-side carts, coupons, orders.
-- Not wired into the app yet — composables/useCart.ts remains client-only
-- until a real checkout flow needs these.

CREATE TABLE addresses (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label          TEXT,
  recipient_name TEXT NOT NULL,
  phone          TEXT NOT NULL,
  line1          TEXT NOT NULL,
  line2          TEXT,
  city           TEXT NOT NULL,
  region         TEXT,
  postal_code    TEXT,
  country        TEXT NOT NULL DEFAULT 'VN',
  is_default     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_addresses_user ON addresses(user_id);

CREATE TABLE carts (
  id            TEXT PRIMARY KEY,
  user_id       TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE,
  created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
  id                  TEXT PRIMARY KEY,
  cart_id             TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id          TEXT NOT NULL REFERENCES products(id),
  variant_id          TEXT REFERENCES product_variants(id),
  quantity            INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_snapshot INTEGER NOT NULL
);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

CREATE TABLE coupons (
  id              TEXT PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percent','fixed')),
  value           INTEGER NOT NULL,
  min_order_total INTEGER NOT NULL DEFAULT 0,
  starts_at       TEXT,
  expires_at      TEXT,
  usage_limit     INTEGER,
  times_used      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE orders (
  id                   TEXT PRIMARY KEY,
  order_number         TEXT NOT NULL UNIQUE,
  user_id              TEXT REFERENCES users(id),
  status               TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  shipping_address_id  TEXT REFERENCES addresses(id),
  coupon_id            TEXT REFERENCES coupons(id),
  subtotal             INTEGER NOT NULL,
  shipping_fee         INTEGER NOT NULL DEFAULT 0,
  discount_total       INTEGER NOT NULL DEFAULT 0,
  total                INTEGER NOT NULL,
  payment_method       TEXT NOT NULL CHECK (payment_method IN ('cod','card','bank_transfer')),
  placed_at            TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_user ON orders(user_id);

CREATE TABLE order_items (
  id                    TEXT PRIMARY KEY,
  order_id              TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id            TEXT NOT NULL REFERENCES products(id),
  variant_id            TEXT REFERENCES product_variants(id),
  product_name_snapshot TEXT NOT NULL,
  unit_price_snapshot   INTEGER NOT NULL,
  quantity              INTEGER NOT NULL,
  line_total            INTEGER NOT NULL
);
CREATE INDEX idx_order_items_order ON order_items(order_id);
