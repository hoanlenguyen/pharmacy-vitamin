import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { requireBearerToken } from '../lib/auth'

export const admin = new Hono<{ Bindings: Bindings }>()

admin.use('*', requireBearerToken)

type CreateProductBody = {
  slug: string
  name: string
  price: number
  compareAtPrice?: number
  sku?: string
  summary?: string
  brandSlug?: string
  categorySlugs?: string[]
  primaryCategorySlug?: string
  imageUrl?: string
}

/** Replaces all of a product's images with a single one at sort_order 0. */
async function setPrimaryImage(db: D1Database, productId: string, url: string, altText: string) {
  await db.prepare('DELETE FROM product_images WHERE product_id = ?1').bind(productId).run()
  await db
    .prepare('INSERT INTO product_images (id, product_id, url, alt_text, sort_order) VALUES (?1, ?2, ?3, ?4, 0)')
    .bind(crypto.randomUUID(), productId, url, altText)
    .run()
}

// GET /admin/products?brand=<slug> — full listing, all statuses, admin-relevant columns.
admin.get('/products', async c => {
  const brand = c.req.query('brand') ?? null

  const { results } = await c.env.DB.prepare(
    `SELECT
       p.id, p.slug, p.name, p.price,
       p.compare_at_price AS compareAtPrice,
       p.status, p.sold_count AS soldCount,
       b.name AS brandName, b.slug AS brandSlug,
       (SELECT cat.name FROM product_categories pc JOIN categories cat ON cat.id = pc.category_id
        WHERE pc.product_id = p.id AND pc.is_primary = 1 LIMIT 1) AS primaryCategory
     FROM products p
     LEFT JOIN brands b ON b.id = p.brand_id
     WHERE (?1 IS NULL OR b.slug = ?1)
     ORDER BY p.name ASC`
  )
    .bind(brand)
    .all()

  return c.json({ items: results })
})

// POST /admin/products
admin.post('/products', async c => {
  const body = await c.req.json<Partial<CreateProductBody>>()

  if (!body.slug || !body.name || typeof body.price !== 'number') {
    return c.json({ error: 'slug, name, and price (number) are required' }, 400)
  }

  const existing = await c.env.DB.prepare('SELECT id FROM products WHERE slug = ?1').bind(body.slug).first()
  if (existing) {
    return c.json({ error: `Product with slug "${body.slug}" already exists` }, 409)
  }

  let brandId: string | null = null
  if (body.brandSlug) {
    const brand = await c.env.DB.prepare('SELECT id FROM brands WHERE slug = ?1').bind(body.brandSlug).first<{ id: string }>()
    if (!brand) return c.json({ error: `Unknown brand slug "${body.brandSlug}"` }, 400)
    brandId = brand.id
  }

  const productId = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO products (id, slug, brand_id, sku, name, summary, price, compare_at_price, status)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'active')`
  )
    .bind(productId, body.slug, brandId, body.sku ?? null, body.name, body.summary ?? null, body.price, body.compareAtPrice ?? null)
    .run()

  const categorySlugs = body.categorySlugs ?? []
  for (const slug of categorySlugs) {
    const category = await c.env.DB.prepare('SELECT id FROM categories WHERE slug = ?1').bind(slug).first<{ id: string }>()
    if (!category) continue
    const isPrimary = slug === (body.primaryCategorySlug ?? categorySlugs[0]) ? 1 : 0
    await c.env.DB.prepare(
      'INSERT INTO product_categories (product_id, category_id, is_primary) VALUES (?1, ?2, ?3)'
    )
      .bind(productId, category.id, isPrimary)
      .run()
  }

  if (body.imageUrl) {
    await setPrimaryImage(c.env.DB, productId, body.imageUrl, body.name)
  }

  return c.json({ id: productId, slug: body.slug }, 201)
})

type UpdateProductBody = {
  name?: string
  price?: number
  compareAtPrice?: number | null
  sku?: string | null
  summary?: string | null
  status?: 'draft' | 'active' | 'archived'
  imageUrl?: string
}

// PATCH /admin/products/:slug
admin.patch('/products/:slug', async c => {
  const slug = c.req.param('slug')
  const body = await c.req.json<UpdateProductBody>()

  const existing = await c.env.DB.prepare('SELECT id, name FROM products WHERE slug = ?1').bind(slug).first<{ id: string; name: string }>()
  if (!existing) {
    return c.json({ error: 'Not found' }, 404)
  }

  if (body.imageUrl) {
    await setPrimaryImage(c.env.DB, existing.id, body.imageUrl, body.name ?? existing.name)
  }

  const fields: string[] = []
  const values: unknown[] = []
  const set = (column: string, value: unknown) => {
    fields.push(`${column} = ?${fields.length + 1}`)
    values.push(value)
  }

  if (body.name !== undefined) set('name', body.name)
  if (body.price !== undefined) set('price', body.price)
  if (body.compareAtPrice !== undefined) set('compare_at_price', body.compareAtPrice)
  if (body.sku !== undefined) set('sku', body.sku)
  if (body.summary !== undefined) set('summary', body.summary)
  if (body.status !== undefined) set('status', body.status)

  if (fields.length === 0) {
    // The image may have been updated above even if no `products` columns changed.
    return body.imageUrl ? c.json({ slug, updated: true }) : c.json({ error: 'No fields to update' }, 400)
  }

  set('updated_at', new Date().toISOString())
  values.push(existing.id)

  await c.env.DB.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?${fields.length + 1}`)
    .bind(...values)
    .run()

  return c.json({ slug, updated: true })
})

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
}

// POST /admin/images?filename=foo.jpg — body is the raw image bytes.
// Stores in R2 and returns a path the caller resolves against the Worker's own
// origin (kept relative here since the Worker doesn't know its own public URL).
admin.post('/images', async c => {
  const contentType = c.req.header('Content-Type') ?? ''

  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    return c.json({ error: `Unsupported Content-Type "${contentType}". Use JPEG, PNG, WEBP, or GIF.` }, 400)
  }

  const body = await c.req.arrayBuffer()
  if (body.byteLength === 0) {
    return c.json({ error: 'Empty request body' }, 400)
  }

  const key = `products/${crypto.randomUUID()}.${EXTENSION_BY_TYPE[contentType]}`
  await c.env.IMAGES.put(key, body, { httpMetadata: { contentType } })

  return c.json({ url: `/images/${key}` }, 201)
})

// DELETE /admin/products/:slug
admin.delete('/products/:slug', async c => {
  const slug = c.req.param('slug')
  const result = await c.env.DB.prepare('DELETE FROM products WHERE slug = ?1').bind(slug).run()

  if (result.meta.changes === 0) {
    return c.json({ error: 'Not found' }, 404)
  }

  return c.json({ deleted: slug })
})
