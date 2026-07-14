import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { requireBearerToken } from '../lib/auth'

export const brands = new Hono<{ Bindings: Bindings }>()

// GET /brands — public, minimal fields for storefront dropdowns.
brands.get('/', async c => {
  const { results } = await c.env.DB.prepare('SELECT slug, name FROM brands ORDER BY name').all<{
    slug: string
    name: string
  }>()
  return c.json({ brands: results })
})

export const adminBrands = new Hono<{ Bindings: Bindings }>()
adminBrands.use('*', requireBearerToken)

type BrandBody = {
  slug?: string
  name?: string
  description?: string | null
  logoUrl?: string | null
}

// GET /admin/brands
adminBrands.get('/', async c => {
  const { results } = await c.env.DB.prepare(
    `SELECT b.id, b.slug, b.name, b.description, b.logo_url AS logoUrl,
            (SELECT COUNT(*) FROM products p WHERE p.brand_id = b.id) AS productCount
     FROM brands b
     ORDER BY b.name`
  ).all()

  return c.json({ items: results })
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
