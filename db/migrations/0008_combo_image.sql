-- Give combos their own cover image (uploaded to R2 like product images). The public listing
-- falls back to the first product's image when this is null, so existing combos still show art.
ALTER TABLE combos ADD COLUMN image_url TEXT;
