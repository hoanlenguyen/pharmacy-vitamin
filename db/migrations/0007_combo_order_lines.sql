-- Let an order line reference a combo (bundle) instead of a product, so a combo can be bought
-- "as a product": one order line at the bundle price. SQLite can't drop a column's NOT NULL
-- in place, so rebuild order_items with product_id nullable and a new combo_id. Every line must
-- reference exactly one of product_id / combo_id (enforced by the CHECK).

CREATE TABLE order_items_new (
  id                    TEXT PRIMARY KEY,
  order_id              TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id            TEXT REFERENCES products(id),
  combo_id              TEXT REFERENCES combos(id),
  variant_id            TEXT REFERENCES product_variants(id),
  product_name_snapshot TEXT NOT NULL,
  unit_price_snapshot   INTEGER NOT NULL,
  quantity              INTEGER NOT NULL,
  line_total            INTEGER NOT NULL,
  CHECK ((product_id IS NOT NULL) <> (combo_id IS NOT NULL))
);

INSERT INTO order_items_new (id, order_id, product_id, variant_id, product_name_snapshot, unit_price_snapshot, quantity, line_total)
SELECT id, order_id, product_id, variant_id, product_name_snapshot, unit_price_snapshot, quantity, line_total
FROM order_items;

DROP TABLE order_items;
ALTER TABLE order_items_new RENAME TO order_items;

CREATE INDEX idx_order_items_order ON order_items(order_id);
