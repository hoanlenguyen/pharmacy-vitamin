import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { requireBearerToken } from '../lib/auth'

export const categories = new Hono<{ Bindings: Bindings }>()

type CategoryRow = { id: string; slug: string; name: string; parentId: string | null; productCount: number }
type CategoryNode = { slug: string; name: string; productCount: number; children: CategoryNode[] }

// GET /categories — nested tree, top-level categories first. productCount is the number of
// active products directly tagged to that category (not summed across its subcategories).
categories.get('/', async c => {
  const { results } = await c.env.DB.prepare(
    `SELECT c.id, c.slug, c.name, c.parent_id AS parentId,
            (SELECT COUNT(*) FROM product_categories pc
             JOIN products p ON p.id = pc.product_id
             WHERE pc.category_id = c.id AND p.status = 'active') AS productCount
     FROM categories c
     ORDER BY c.sort_order, c.name`
  ).all<CategoryRow>()

  const nodeBySlug = new Map<string, CategoryNode>()
  for (const row of results) {
    nodeBySlug.set(row.id, { slug: row.slug, name: row.name, productCount: row.productCount, children: [] })
  }

  const roots: CategoryNode[] = []
  for (const row of results) {
    const node = nodeBySlug.get(row.id)!
    if (row.parentId && nodeBySlug.has(row.parentId)) {
      nodeBySlug.get(row.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return c.json({ categories: roots })
})

export const adminCategories = new Hono<{ Bindings: Bindings }>()
adminCategories.use('*', requireBearerToken)

type CategoryBody = {
  slug?: string
  name?: string
  parentSlug?: string | null
  description?: string | null
  sortOrder?: number
}

// GET /admin/categories — flat list (with parent slug + usage counts) for the admin table/selects.
adminCategories.get('/', async c => {
  const { results } = await c.env.DB.prepare(
    `SELECT c.id, c.slug, c.name, c.description, c.sort_order AS sortOrder,
            parent.slug AS parentSlug,
            (SELECT COUNT(*) FROM product_categories pc WHERE pc.category_id = c.id) AS productCount,
            (SELECT COUNT(*) FROM categories child WHERE child.parent_id = c.id) AS childCount
     FROM categories c
     LEFT JOIN categories parent ON parent.id = c.parent_id
     ORDER BY c.sort_order, c.name`
  ).all()

  return c.json({ items: results })
})

// POST /admin/categories
adminCategories.post('/', async c => {
  const body = await c.req.json<CategoryBody>()

  if (!body.slug || !body.name) {
    return c.json({ error: 'slug and name are required' }, 400)
  }

  const existing = await c.env.DB.prepare('SELECT id FROM categories WHERE slug = ?1').bind(body.slug).first()
  if (existing) {
    return c.json({ error: `Category with slug "${body.slug}" already exists` }, 409)
  }

  let parentId: string | null = null
  if (body.parentSlug) {
    const parent = await c.env.DB.prepare('SELECT id FROM categories WHERE slug = ?1').bind(body.parentSlug).first<{ id: string }>()
    if (!parent) return c.json({ error: `Unknown parent category slug "${body.parentSlug}"` }, 400)
    parentId = parent.id
  }

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    'INSERT INTO categories (id, parent_id, name, slug, description, sort_order) VALUES (?1, ?2, ?3, ?4, ?5, ?6)'
  )
    .bind(id, parentId, body.name, body.slug, body.description ?? null, body.sortOrder ?? 0)
    .run()

  return c.json({ id, slug: body.slug }, 201)
})

// PATCH /admin/categories/:slug
adminCategories.patch('/:slug', async c => {
  const slug = c.req.param('slug')
  const body = await c.req.json<CategoryBody>()

  const existing = await c.env.DB.prepare('SELECT id FROM categories WHERE slug = ?1').bind(slug).first<{ id: string }>()
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
  if (body.sortOrder !== undefined) set('sort_order', body.sortOrder)

  if (body.parentSlug !== undefined) {
    if (body.parentSlug === null) {
      set('parent_id', null)
    } else {
      const parent = await c.env.DB.prepare('SELECT id FROM categories WHERE slug = ?1').bind(body.parentSlug).first<{ id: string }>()
      if (!parent) return c.json({ error: `Unknown parent category slug "${body.parentSlug}"` }, 400)
      if (parent.id === existing.id) return c.json({ error: 'A category cannot be its own parent' }, 400)
      set('parent_id', parent.id)
    }
  }

  if (fields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400)
  }

  values.push(existing.id)
  await c.env.DB.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?${fields.length + 1}`)
    .bind(...values)
    .run()

  return c.json({ slug, updated: true })
})

// DELETE /admin/categories/:slug — blocked if still in use, since
// product_categories/child categories cascade/orphan silently otherwise.
adminCategories.delete('/:slug', async c => {
  const slug = c.req.param('slug')
  const existing = await c.env.DB.prepare('SELECT id FROM categories WHERE slug = ?1').bind(slug).first<{ id: string }>()
  if (!existing) {
    return c.json({ error: 'Not found' }, 404)
  }

  const [inUse, hasChildren] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) AS n FROM product_categories WHERE category_id = ?1').bind(existing.id).first<{ n: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS n FROM categories WHERE parent_id = ?1').bind(existing.id).first<{ n: number }>()
  ])

  if ((inUse?.n ?? 0) > 0) {
    return c.json({ error: `Cannot delete: ${inUse!.n} product(s) still use this category` }, 409)
  }
  if ((hasChildren?.n ?? 0) > 0) {
    return c.json({ error: `Cannot delete: ${hasChildren!.n} subcategory(ies) reference this category` }, 409)
  }

  await c.env.DB.prepare('DELETE FROM categories WHERE id = ?1').bind(existing.id).run()
  return c.json({ deleted: slug })
})
