import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { getBreadcrumb } from '../lib/breadcrumb'

export const products = new Hono<{ Bindings: Bindings }>()

type ProductListRow = {
  id: string
  slug: string
  name: string
  price: number
  compareAtPrice: number | null
  ratingAvg: number
  ratingCount: number
  soldCount: number
  variantMinPrice: number | null
  variantMaxPrice: number | null
  hasVariants: 0 | 1
  imageUrl: string | null
}

// GET /products?category=<slug>&limit=20&offset=0&sort=sold|discount
products.get('/', async c => {
  const category = c.req.query('category') ?? null
  const limit = Math.min(Number(c.req.query('limit') ?? 20) || 20, 100)
  const offset = Math.max(Number(c.req.query('offset') ?? 0) || 0, 0)
  const sort = c.req.query('sort') === 'discount' ? 'discount' : 'sold'
  const orderBy =
    sort === 'discount'
      ? `(p.compare_at_price - p.price) IS NOT NULL DESC, (p.compare_at_price - p.price) DESC`
      : `p.sold_count DESC, p.name ASC`

  const { results } = await c.env.DB.prepare(
    `SELECT
       p.id, p.slug, p.name, p.price,
       p.compare_at_price AS compareAtPrice,
       p.rating_avg AS ratingAvg, p.rating_count AS ratingCount, p.sold_count AS soldCount,
       (SELECT MIN(v.price) FROM product_variants v WHERE v.product_id = p.id) AS variantMinPrice,
       (SELECT MAX(v.price) FROM product_variants v WHERE v.product_id = p.id) AS variantMaxPrice,
       EXISTS(SELECT 1 FROM product_variants v WHERE v.product_id = p.id) AS hasVariants,
       (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) AS imageUrl
     FROM products p
     WHERE p.status = 'active'
       AND (?1 IS NULL OR EXISTS (
         SELECT 1 FROM product_categories pc JOIN categories cat ON cat.id = pc.category_id
         WHERE pc.product_id = p.id AND cat.slug = ?1
       ))
     ORDER BY ${orderBy}
     LIMIT ?2 OFFSET ?3`
  )
    .bind(category, limit, offset)
    .all<ProductListRow>()

  const items = results.map(row => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.variantMinPrice ?? row.price,
    priceMax: row.variantMaxPrice && row.variantMaxPrice !== (row.variantMinPrice ?? row.price) ? row.variantMaxPrice : undefined,
    // A single "was" price is misleading across a variant price range, so only show it
    // for single-price products — the detail page shows each variant's own compareAtPrice.
    originalPrice: row.hasVariants ? undefined : row.compareAtPrice ?? undefined,
    rating: row.ratingCount > 0 ? row.ratingAvg : undefined,
    reviewCount: row.ratingCount > 0 ? row.ratingCount : undefined,
    soldCount: row.soldCount > 0 ? row.soldCount : undefined,
    hasVariants: Boolean(row.hasVariants) || undefined,
    imageUrl: row.imageUrl ?? undefined
  }))

  return c.json({ items, limit, offset })
})

// GET /products/:slug
products.get('/:slug', async c => {
  const slug = c.req.param('slug')

  const product = await c.env.DB.prepare(
    `SELECT
       p.id, p.slug, p.name, p.sku, p.summary, p.price,
       p.compare_at_price AS compareAtPrice,
       p.rating_avg AS ratingAvg, p.rating_count AS ratingCount, p.sold_count AS soldCount,
       b.name AS brandName
     FROM products p
     LEFT JOIN brands b ON b.id = p.brand_id
     WHERE p.slug = ?1 AND p.status = 'active'`
  )
    .bind(slug)
    .first<{
      id: string
      slug: string
      name: string
      sku: string | null
      summary: string | null
      price: number
      compareAtPrice: number | null
      ratingAvg: number
      ratingCount: number
      soldCount: number
      brandName: string | null
    }>()

  if (!product) {
    return c.json({ error: 'Not found' }, 404)
  }

  const [categories, breadcrumb, images, ingredients, bullets, variantRows] = await Promise.all([
    c.env.DB.prepare(
      `SELECT cat.name, cat.slug, pc.is_primary AS isPrimary
       FROM product_categories pc JOIN categories cat ON cat.id = pc.category_id
       WHERE pc.product_id = ?1
       ORDER BY pc.is_primary DESC`
    )
      .bind(product.id)
      .all<{ name: string; slug: string; isPrimary: 0 | 1 }>(),
    getBreadcrumb(c.env.DB, product.id),
    c.env.DB.prepare(`SELECT url, alt_text AS altText FROM product_images WHERE product_id = ?1 ORDER BY sort_order`)
      .bind(product.id)
      .all<{ url: string; altText: string | null }>(),
    c.env.DB.prepare(`SELECT name, benefit FROM product_ingredients WHERE product_id = ?1 ORDER BY sort_order`)
      .bind(product.id)
      .all<{ name: string; benefit: string }>(),
    c.env.DB.prepare(`SELECT type, content FROM product_bullets WHERE product_id = ?1 ORDER BY sort_order`)
      .bind(product.id)
      .all<{ type: 'skin_concern' | 'how_to_use'; content: string }>(),
    c.env.DB.prepare(
      `SELECT v.id, v.price, v.compare_at_price AS compareAtPrice, v.stock_quantity AS stockQuantity,
              o.name AS optionName, ov.value AS optionValue
       FROM product_variants v
       JOIN product_variant_option_values vov ON vov.variant_id = v.id
       JOIN product_option_values ov ON ov.id = vov.option_value_id
       JOIN product_options o ON o.id = ov.option_id
       WHERE v.product_id = ?1
       ORDER BY ov.sort_order`
    )
      .bind(product.id)
      .all<{ id: string; price: number; compareAtPrice: number | null; stockQuantity: number; optionName: string; optionValue: string }>()
  ])

  return c.json({
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brandName ?? undefined,
    sku: product.sku ?? undefined,
    price: product.price,
    originalPrice: product.compareAtPrice ?? undefined,
    rating: product.ratingCount > 0 ? product.ratingAvg : undefined,
    reviewCount: product.ratingCount > 0 ? product.ratingCount : undefined,
    soldCount: product.soldCount > 0 ? product.soldCount : undefined,
    categories: categories.results.map(r => ({ name: r.name, slug: r.slug, isPrimary: Boolean(r.isPrimary) })),
    breadcrumb,
    summary: product.summary ?? undefined,
    images: images.results.map(r => ({ url: r.url, alt: r.altText ?? product.name })),
    imageCount: images.results.length,
    skinConcerns: bullets.results.filter(b => b.type === 'skin_concern').map(b => b.content),
    howToUse: bullets.results.filter(b => b.type === 'how_to_use').map(b => b.content),
    ingredients: ingredients.results,
    variants: variantRows.results.map(v => ({
      id: v.id,
      price: v.price,
      originalPrice: v.compareAtPrice ?? undefined,
      stockQuantity: v.stockQuantity,
      optionName: v.optionName,
      value: v.optionValue
    }))
  })
})
