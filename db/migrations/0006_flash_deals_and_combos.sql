-- Flash Deals: a simple boolean flag on products, toggled from Admin > Flash Deals.
ALTER TABLE products ADD COLUMN is_flash_deal INTEGER NOT NULL DEFAULT 0;

-- Combos: real multi-product bundles with their own bundle price, managed from Admin > Combos.
CREATE TABLE combos (
  id               TEXT PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  description      TEXT,
  price            INTEGER NOT NULL,
  compare_at_price INTEGER,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','draft','archived')),
  sort_order       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE combo_items (
  id         TEXT PRIMARY KEY,
  combo_id   TEXT NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX idx_combo_items_combo ON combo_items(combo_id);
