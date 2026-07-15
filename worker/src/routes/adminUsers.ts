import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { requireBearerToken } from '../lib/auth'

export const adminUsers = new Hono<{ Bindings: Bindings }>()
adminUsers.use('*', requireBearerToken)

// Whitelisted so sortBy can never inject arbitrary SQL — only these columns are sortable.
const USER_SORT_COLUMNS: Record<string, string> = {
  name: 'u.name',
  email: 'u.email',
  orderCount: 'orderCount',
  totalSpent: 'totalSpent',
  createdAt: 'u.created_at'
}

// GET /admin/users?q=<name>&email=&phone=&sortBy=&sortDir=&limit=10&offset=0 — list, with
// order count + lifetime spend. The three text filters are independent (combined with AND).
adminUsers.get('/', async c => {
  const q = c.req.query('q')?.trim() || null
  const email = c.req.query('email')?.trim() || null
  const phone = c.req.query('phone')?.trim() || null
  const limit = Math.min(Number(c.req.query('limit') ?? 10) || 10, 100)
  const offset = Math.max(Number(c.req.query('offset') ?? 0) || 0, 0)
  const sortByParam = c.req.query('sortBy')
  const sortDirParam = c.req.query('sortDir')
  const sortColumn = USER_SORT_COLUMNS[sortByParam ?? ''] ?? USER_SORT_COLUMNS.createdAt
  // No explicit direction: default to ascending for a freshly-clicked column, but preserve
  // the original "newest first" default when no sort was requested at all.
  const sortDir = sortDirParam === 'asc' ? 'ASC' : sortDirParam === 'desc' ? 'DESC' : sortByParam ? 'ASC' : 'DESC'
  const orderBy = `${sortColumn} ${sortDir}${sortColumn === USER_SORT_COLUMNS.name ? '' : ', u.name ASC'}`

  const whereSql = `
    (?1 IS NULL OR u.name LIKE '%' || ?1 || '%')
    AND (?2 IS NULL OR u.email LIKE '%' || ?2 || '%')
    AND (?3 IS NULL OR u.phone LIKE '%' || ?3 || '%')
  `

  const [countRow, { results }] = await Promise.all([
    c.env.DB
      .prepare(`SELECT COUNT(*) AS total FROM users u WHERE ${whereSql}`)
      .bind(q, email, phone)
      .first<{ total: number }>(),
    c.env.DB
      .prepare(
        `SELECT
           u.id, u.email, u.name, u.phone, u.created_at AS createdAt,
           (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS orderCount,
           (SELECT COALESCE(SUM(o.total), 0) FROM orders o WHERE o.user_id = u.id) AS totalSpent
         FROM users u
         WHERE ${whereSql}
         ORDER BY ${orderBy}
         LIMIT ?4 OFFSET ?5`
      )
      .bind(q, email, phone, limit, offset)
      .all()
  ])

  return c.json({ items: results, total: countRow?.total ?? 0, limit, offset })
})

// GET /admin/users/:id — profile + addresses + their orders (summary).
adminUsers.get('/:id', async c => {
  const id = c.req.param('id')

  const user = await c.env.DB.prepare('SELECT id, email, name, phone, created_at AS createdAt FROM users WHERE id = ?1')
    .bind(id)
    .first()

  if (!user) {
    return c.json({ error: 'Not found' }, 404)
  }

  const [addresses, orders] = await Promise.all([
    c.env.DB.prepare(
      `SELECT id, label, recipient_name AS recipientName, phone, line1, line2, city, region, postal_code AS postalCode, country, is_default AS isDefault
       FROM addresses WHERE user_id = ?1 ORDER BY is_default DESC`
    )
      .bind(id)
      .all(),
    c.env.DB.prepare(
      `SELECT id, order_number AS orderNumber, status, total, placed_at AS placedAt
       FROM orders WHERE user_id = ?1 ORDER BY placed_at DESC`
    )
      .bind(id)
      .all()
  ])

  return c.json({ ...user, addresses: addresses.results, orders: orders.results })
})
