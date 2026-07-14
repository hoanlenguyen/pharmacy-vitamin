import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { requireBearerToken } from '../lib/auth'

export const adminUsers = new Hono<{ Bindings: Bindings }>()
adminUsers.use('*', requireBearerToken)

// GET /admin/users — list, with order count + lifetime spend.
adminUsers.get('/', async c => {
  const { results } = await c.env.DB.prepare(
    `SELECT
       u.id, u.email, u.name, u.phone, u.created_at AS createdAt,
       (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS orderCount,
       (SELECT COALESCE(SUM(o.total), 0) FROM orders o WHERE o.user_id = u.id) AS totalSpent
     FROM users u
     ORDER BY u.created_at DESC`
  ).all()

  return c.json({ items: results })
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
