import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { requireBearerToken } from '../lib/auth'

export const brands = new Hono<{ Bindings: Bindings }>()

// GET /brands — public directory: name + product count for each brand.
brands.get('/', async c => {
  const { results } = await c.env.DB.prepare(
    `SELECT b.slug, b.name, b.description, b.logo_url AS logoUrl,
            (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.id AND p.status = 'active') AS productCount
     FROM brands b
     ORDER BY b.name`
  ).all()
  return c.json({ brands: results })
})

// GET /brands/:slug — public single-brand detail, for the storefront brand page header.
brands.get('/:slug', async c => {
  const slug = c.req.param('slug')
  const brand = await c.env.DB.prepare(
    `SELECT b.slug, b.name, b.description, b.logo_url AS logoUrl,
            (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.id AND p.status = 'active') AS productCount
     FROM brands b WHERE b.slug = ?1`
  )
    .bind(slug)
    .first()

  if (!brand) {
    return c.json({ error: 'Not found' }, 404)
  }

  return c.json(brand)
})

export const adminBrands = new Hono<{ Bindings: Bindings }>()
adminBrands.use('*', requireBearerToken)

type BrandBody = {
  slug?: string
  name?: string
  description?: string | null
  logoUrl?: string | null
}

// Whitelisted so sortBy can never inject arbitrary SQL — only these columns are sortable.
const BRAND_SORT_COLUMNS: Record<string, string> = {
  name: 'b.name',
  slug: 'b.slug',
  productCount: 'productCount'
}

// GET /admin/brands?q=<text>&sortBy=&sortDir=&limit=10&offset=0
adminBrands.get('/', async c => {
  const q = c.req.query('q')?.trim() || null
  const limit = Math.min(Number(c.req.query('limit') ?? 10) || 10, 100)
  const offset = Math.max(Number(c.req.query('offset') ?? 0) || 0, 0)
  const sortColumn = BRAND_SORT_COLUMNS[c.req.query('sortBy') ?? ''] ?? BRAND_SORT_COLUMNS.name
  const sortDir = c.req.query('sortDir') === 'desc' ? 'DESC' : 'ASC'
  const orderBy = `${sortColumn} ${sortDir}${sortColumn === BRAND_SORT_COLUMNS.name ? '' : ', b.name ASC'}`

  const [countRow, { results }] = await Promise.all([
    c.env.DB
      .prepare(`SELECT COUNT(*) AS total FROM brands b WHERE (?1 IS NULL OR b.name LIKE '%' || ?1 || '%')`)
      .bind(q)
      .first<{ total: number }>(),
    c.env.DB
      .prepare(
        `SELECT b.id, b.slug, b.name, b.description, b.logo_url AS logoUrl,
                (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.id) AS productCount
         FROM brands b
         WHERE (?1 IS NULL OR b.name LIKE '%' || ?1 || '%')
         ORDER BY ${orderBy}
         LIMIT ?2 OFFSET ?3`
      )
      .bind(q, limit, offset)
      .all()
  ])

  return c.json({ items: results, total: countRow?.total ?? 0, limit, offset })
})

// POST /admin/brands
adminBrands.post('/', async c => {
  const body = await c.req.json<BrandBody>()

  if (!body.slug || !body.name) {
    return c.json({ error: 'slug and name are required' }, 400)
  }

  const existing = await c.env.DB.prepare('SELECT id FROM brands WHERE slug = ?1').bind(body.slug).first()
  if (existing) {
    return c.json({ error: `Brand with slug "${body.slug}" already exists` }, 409)
  }

  const id = crypto.randomUUID()
  await c.env.DB.prepare('INSERT INTO brands (id, slug, name, description, logo_url) VALUES (?1, ?2, ?3, ?4, ?5)')
    .bind(id, body.slug, body.name, body.description ?? null, body.logoUrl ?? null)
    .run()

  return c.json({ id, slug: body.slug }, 201)
})

// PATCH /admin/brands/:slug
adminBrands.patch('/:slug', async c => {
  const slug = c.req.param('slug')
  const body = await c.req.json<BrandBody>()

  const existing = await c.env.DB.prepare('SELECT id FROM brands WHERE slug = ?1').bind(slug).first<{ id: string }>()
  if (!existing) {
    return c.json({ error: 'Not found' }, 404)
  }

  const fields: string[] = []
  const values: unknown[] = []
  const set = (column: string, value: unknown) => {
    fields.push(`${column} = ?${fields.length + 1}`)
    values.push(value)
  }

  if (body.name !== undefined) set('name', body.name)
  if (body.description !== undefined) set('description', body.description)
  if (body.logoUrl !== undefined) set('logo_url', body.logoUrl)

  if (fields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400)
  }

  values.push(existing.id)
  await c.env.DB.prepare(`UPDATE brands SET ${fields.join(', ')} WHERE id = ?${fields.length + 1}`)
    .bind(...values)
    .run()

  return c.json({ slug, updated: true })
})

// DELETE /admin/brands/:slug — safe: products.brand_id is ON DELETE SET NULL.
adminBrands.delete('/:slug', async c => {
  const slug = c.req.param('slug')
  const result = await c.env.DB.prepare('DELETE FROM brands WHERE slug = ?1').bind(slug).run()

  if (result.meta.changes === 0) {
    return c.json({ error: 'Not found' }, 404)
  }

  return c.json({ deleted: slug })
})
