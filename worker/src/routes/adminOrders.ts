import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { requireBearerToken } from '../lib/auth'

export const adminOrders = new Hono<{ Bindings: Bindings }>()
adminOrders.use('*', requireBearerToken)

const VALID_STATUSES = new Set(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])

// GET /admin/orders — list, with customer + item count.
adminOrders.get('/', async c => {
  const { results } = await c.env.DB.prepare(
    `SELECT
       o.id, o.order_number AS orderNumber, o.status, o.total, o.payment_method AS paymentMethod, o.placed_at AS placedAt,
       u.name AS customerName, u.email AS customerEmail,
       (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS itemCount
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     ORDER BY o.placed_at DESC`
  ).all()

  return c.json({ items: results })
})

// GET /admin/orders/:id — full detail: order + customer + shipping address + line items.
adminOrders.get('/:id', async c => {
  const id = c.req.param('id')

  const order = await c.env.DB.prepare(
    `SELECT
       o.id, o.order_number AS orderNumber, o.status, o.subtotal, o.shipping_fee AS shippingFee,
       o.discount_total AS discountTotal, o.total, o.payment_method AS paymentMethod, o.placed_at AS placedAt,
       u.id AS customerId, u.name AS customerName, u.email AS customerEmail, u.phone AS customerPhone,
       a.recipient_name AS shipRecipientName, a.phone AS shipPhone, a.line1 AS shipLine1, a.line2 AS shipLine2,
       a.city AS shipCity, a.region AS shipRegion, a.postal_code AS shipPostalCode, a.country AS shipCountry
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     LEFT JOIN addresses a ON a.id = o.shipping_address_id
     WHERE o.id = ?1`
  )
    .bind(id)
    .first()

  if (!order) {
    return c.json({ error: 'Not found' }, 404)
  }

  const { results: items } = await c.env.DB.prepare(
    `SELECT id, product_id AS productId, product_name_snapshot AS productName, unit_price_snapshot AS unitPrice, quantity, line_total AS lineTotal
     FROM order_items WHERE order_id = ?1`
  )
    .bind(id)
    .all()

  return c.json({ ...order, items })
})

// PATCH /admin/orders/:id — status transitions only; nothing else about an order is editable.
adminOrders.patch('/:id', async c => {
  const id = c.req.param('id')
  const body = await c.req.json<{ status?: string }>()

  if (!body.status || !VALID_STATUSES.has(body.status)) {
    return c.json({ error: `status must be one of: ${[...VALID_STATUSES].join(', ')}` }, 400)
  }

  const result = await c.env.DB.prepare('UPDATE orders SET status = ?1 WHERE id = ?2').bind(body.status, id).run()

  if (result.meta.changes === 0) {
    return c.json({ error: 'Not found' }, 404)
  }

  return c.json({ id, status: body.status, updated: true })
})
