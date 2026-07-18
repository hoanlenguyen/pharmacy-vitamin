import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { requireBearerToken } from '../lib/auth'

export const combos = new Hono<{ Bindings: Bindings }>()

type ComboItemRow = {
  productId: string
  productSlug: string
  productName: string
  quantity: number
  unitPrice: number
  imageUrl: string | null
}

async function getComboItems(db: D1Database, comboId: string) {
  const { results } = await db
    .prepare(
      `SELECT
         p.id AS productId, p.slug AS productSlug, p.name AS productName, p.price AS unitPrice, ci.quantity,
         (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) AS imageUrl
       FROM combo_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.combo_id = ?1
       ORDER BY p.name`
    )
    .bind(comboId)
    .all<ComboItemRow>()
  return results
}

// GET /combos — active bundles for the storefront listing.
combos.get('/', async c => {
  const { results } = await c.env.DB.prepare(
    `SELECT
       co.id, co.slug, co.name, co.description, co.price, co.compare_at_price AS compareAtPrice,
       (SELECT COUNT(*) FROM combo_items ci WHERE ci.combo_id = co.id) AS itemCount,
       COALESCE(
         co.image_url,
         (SELECT pi.url FROM combo_items ci
          JOIN product_images pi ON pi.product_id = ci.product_id
          WHERE ci.combo_id = co.id ORDER BY pi.sort_order LIMIT 1)
       ) AS thumbnailUrl
     FROM combos co
     WHERE co.status = 'active'
     ORDER BY co.sort_order, co.name`
  ).all()

  return c.json({ items: results })
})

// GET /combos/:slug — bundle detail with its constituent products.
combos.get('/:slug', async c => {
  const slug = c.req.param('slug')

  const combo = await c.env.DB.prepare(
    `SELECT id, slug, name, description, price, compare_at_price AS compareAtPrice, image_url AS imageUrl
     FROM combos WHERE slug = ?1 AND status = 'active'`
  )
    .bind(slug)
    .first<{ id: string; slug: string; name: string; description: string | null; price: number; compareAtPrice: number | null; imageUrl: string | null }>()

  if (!combo) {
    return c.json({ error: 'Not found' }, 404)
  }

  const items = await getComboItems(c.env.DB, combo.id)
  return c.json({ ...combo, items })
})

export const adminCombos = new Hono<{ Bindings: Bindings }>()
adminCombos.use('*', requireBearerToken)

type ComboBody = {
  slug?: string
  name?: string
  description?: string | null
  price?: number
  compareAtPrice?: number | null
  status?: 'active' | 'draft' | 'archived'
  sortOrder?: number
  imageUrl?: string | null
  items?: { productSlug: string; quantity?: number }[]
}

// Whitelisted so sortBy can never inject arbitrary SQL — only these columns are sortable.
const COMBO_SORT_COLUMNS: Record<string, string> = {
  name: 'co.name',
  slug: 'co.slug',
  price: 'co.price',
  itemCount: 'itemCount',
  status: 'co.status'
}

// GET /admin/combos?q=<text>&sortBy=&sortDir=&limit=10&offset=0 — every combo (any status), with item count.
adminCombos.get('/', async c => {
  const q = c.req.query('q')?.trim() || null
  const limit = Math.min(Number(c.req.query('limit') ?? 10) || 10, 100)
  const offset = Math.max(Number(c.req.query('offset') ?? 0) || 0, 0)
  const sortColumn = COMBO_SORT_COLUMNS[c.req.query('sortBy') ?? ''] ?? null
  const sortDir = c.req.query('sortDir') === 'desc' ? 'DESC' : 'ASC'
  const orderBy = sortColumn ? `${sortColumn} ${sortDir}, co.name ASC` : 'co.sort_order, co.name'

  const [countRow, { results }] = await Promise.all([
    c.env.DB
      .prepare(`SELECT COUNT(*) AS total FROM combos co WHERE (?1 IS NULL OR co.name LIKE '%' || ?1 || '%')`)
      .bind(q)
      .first<{ total: number }>(),
    c.env.DB
      .prepare(
        `SELECT co.id, co.slug, co.name, co.price, co.compare_at_price AS compareAtPrice, co.status, co.sort_order AS sortOrder,
                (SELECT COUNT(*) FROM combo_items ci WHERE ci.combo_id = co.id) AS itemCount
         FROM combos co
         WHERE (?1 IS NULL OR co.name LIKE '%' || ?1 || '%')
         ORDER BY ${orderBy}
         LIMIT ?2 OFFSET ?3`
      )
      .bind(q, limit, offset)
      .all()
  ])

  return c.json({ items: results, total: countRow?.total ?? 0, limit, offset })
})

// GET /admin/combos/:slug — full detail (incl. items) for the edit form.
adminCombos.get('/:slug', async c => {
  const slug = c.req.param('slug')

  const combo = await c.env.DB.prepare(
    `SELECT id, slug, name, description, price, compare_at_price AS compareAtPrice, status, sort_order AS sortOrder, image_url AS imageUrl
     FROM combos WHERE slug = ?1`
  )
    .bind(slug)
    .first<{
      id: string
      slug: string
      name: string
      description: string | null
      price: number
      compareAtPrice: number | null
      status: string
      sortOrder: number
      imageUrl: string | null
    }>()

  if (!combo) {
    return c.json({ error: 'Not found' }, 404)
  }

  const items = await getComboItems(c.env.DB, combo.id)
  return c.json({ ...combo, items })
})

/** Replaces all of a combo's line items — simplest way to keep it in sync with the picker in the admin form. */
async function replaceComboItems(db: D1Database, comboId: string, items: { productSlug: string; quantity?: number }[]) {
  await db.prepare('DELETE FROM combo_items WHERE combo_id = ?1').bind(comboId).run()

  for (const item of items) {
    const product = await db.prepare('SELECT id FROM products WHERE slug = ?1').bind(item.productSlug).first<{ id: string }>()
    if (!product) continue
    await db
      .prepare('INSERT INTO combo_items (id, combo_id, product_id, quantity) VALUES (?1, ?2, ?3, ?4)')
      .bind(crypto.randomUUID(), comboId, product.id, Math.max(1, item.quantity ?? 1))
      .run()
  }
}

// POST /admin/combos
adminCombos.post('/', async c => {
  const body = await c.req.json<ComboBody>()

  if (!body.slug || !body.name || typeof body.price !== 'number') {
    return c.json({ error: 'slug, name, and price (number) are required' }, 400)
  }
  if (!body.items?.length) {
    return c.json({ error: 'At least one product is required' }, 400)
  }

  const existing = await c.env.DB.prepare('SELECT id FROM combos WHERE slug = ?1').bind(body.slug).first()
  if (existing) {
    return c.json({ error: `Combo with slug "${body.slug}" already exists` }, 409)
  }

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO combos (id, slug, name, description, price, compare_at_price, status, sort_order, image_url)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
  )
    .bind(
      id,
      body.slug,
      body.name,
      body.description ?? null,
      body.price,
      body.compareAtPrice ?? null,
      body.status ?? 'active',
      body.sortOrder ?? 0,
      body.imageUrl ?? null
    )
    .run()

  await replaceComboItems(c.env.DB, id, body.items)

  return c.json({ id, slug: body.slug }, 201)
})

// PATCH /admin/combos/:slug
adminCombos.patch('/:slug', async c => {
  const slug = c.req.param('slug')
  const body = await c.req.json<ComboBody>()

  const existing = await c.env.DB.prepare('SELECT id FROM combos WHERE slug = ?1').bind(slug).first<{ id: string }>()
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
  if (body.price !== undefined) set('price', body.price)
  if (body.compareAtPrice !== undefined) set('compare_at_price', body.compareAtPrice)
  if (body.status !== undefined) set('status', body.status)
  if (body.sortOrder !== undefined) set('sort_order', body.sortOrder)
  if (body.imageUrl !== undefined) set('image_url', body.imageUrl)

  if (fields.length > 0) {
    values.push(existing.id)
    await c.env.DB.prepare(`UPDATE combos SET ${fields.join(', ')} WHERE id = ?${fields.length + 1}`)
      .bind(...values)
      .run()
  }

  if (body.items !== undefined) {
    if (!body.items.length) {
      return c.json({ error: 'At least one product is required' }, 400)
    }
    await replaceComboItems(c.env.DB, existing.id, body.items)
  } else if (fields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400)
  }

  return c.json({ slug, updated: true })
})

// DELETE /admin/combos/:slug — combo_items cascade automatically.
adminCombos.delete('/:slug', async c => {
  const slug = c.req.param('slug')
  const result = await c.env.DB.prepare('DELETE FROM combos WHERE slug = ?1').bind(slug).run()

  if (result.meta.changes === 0) {
    return c.json({ error: 'Not found' }, 404)
  }

  return c.json({ deleted: slug })
})
