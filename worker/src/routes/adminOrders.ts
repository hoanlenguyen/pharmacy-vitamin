import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { requireBearerToken } from '../lib/auth'

export const adminOrders = new Hono<{ Bindings: Bindings }>()
adminOrders.use('*', requireBearerToken)

const VALID_STATUSES = new Set(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])

// Whitelisted so sortBy can never inject arbitrary SQL — only these columns are sortable.
const ORDER_SORT_COLUMNS: Record<string, string> = {
  orderNumber: 'o.order_number',
  customerName: 'COALESCE(u.name, o.customer_name)',
  total: 'o.total',
  status: 'o.status',
  itemCount: 'itemCount',
  placedAt: 'o.placed_at'
}

// GET /admin/orders?orderNumber=&q=<customer name>&phone=&sortBy=&sortDir=&limit=10&offset=0
// — list, with customer + item count. Guest checkout orders have no linked user row, so
// customer name/email/phone fall back to the order's own snapshot columns. The three text
// filters are independent (combined with AND) so they can be used together to narrow down.
adminOrders.get('/', async c => {
  const orderNumber = c.req.query('orderNumber')?.trim() || null
  const q = c.req.query('q')?.trim() || null
  const phone = c.req.query('phone')?.trim() || null
  const limit = Math.min(Number(c.req.query('limit') ?? 10) || 10, 100)
  const offset = Math.max(Number(c.req.query('offset') ?? 0) || 0, 0)
  const sortByParam = c.req.query('sortBy')
  const sortDirParam = c.req.query('sortDir')
  const sortColumn = ORDER_SORT_COLUMNS[sortByParam ?? ''] ?? ORDER_SORT_COLUMNS.placedAt
  const sortDir = sortDirParam === 'asc' ? 'ASC' : sortDirParam === 'desc' ? 'DESC' : sortByParam ? 'ASC' : 'DESC'
  const orderBy = `${sortColumn} ${sortDir}${sortColumn === ORDER_SORT_COLUMNS.placedAt ? '' : ', o.placed_at DESC'}`

  const whereSql = `
    (?1 IS NULL OR o.order_number LIKE '%' || ?1 || '%')
    AND (?2 IS NULL OR COALESCE(u.name, o.customer_name) LIKE '%' || ?2 || '%')
    AND (?3 IS NULL OR COALESCE(u.phone, o.customer_phone) LIKE '%' || ?3 || '%')
  `

  const [countRow, { results }] = await Promise.all([
    c.env.DB
      .prepare(`SELECT COUNT(*) AS total FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE ${whereSql}`)
      .bind(orderNumber, q, phone)
      .first<{ total: number }>(),
    c.env.DB
      .prepare(
        `SELECT
           o.id, o.order_number AS orderNumber, o.status, o.total, o.payment_method AS paymentMethod, o.placed_at AS placedAt,
           COALESCE(u.name, NULLIF(o.customer_name, '')) AS customerName,
           COALESCE(u.email, NULLIF(o.customer_email, '')) AS customerEmail,
           COALESCE(u.phone, NULLIF(o.customer_phone, '')) AS customerPhone,
           (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS itemCount
         FROM orders o
         LEFT JOIN users u ON u.id = o.user_id
         WHERE ${whereSql}
         ORDER BY ${orderBy}
         LIMIT ?4 OFFSET ?5`
      )
      .bind(orderNumber, q, phone, limit, offset)
      .all()
  ])

  return c.json({ items: results, total: countRow?.total ?? 0, limit, offset })
})

// GET /admin/orders/:id — full detail: order + customer + shipping address + line items.
// Same guest-checkout fallback as above, plus shipping fields fall back to the order's own
// denormalized shipping_* columns when there's no linked addresses row.
adminOrders.get('/:id', async c => {
  const id = c.req.param('id')

  const order = await c.env.DB.prepare(
    `SELECT
       o.id, o.order_number AS orderNumber, o.status, o.subtotal, o.shipping_fee AS shippingFee,
       o.discount_total AS discountTotal, o.total, o.payment_method AS paymentMethod, o.placed_at AS placedAt, o.notes,
       u.id AS customerId,
       COALESCE(u.name, NULLIF(o.customer_name, '')) AS customerName,
       COALESCE(u.email, NULLIF(o.customer_email, '')) AS customerEmail,
       COALESCE(u.phone, NULLIF(o.customer_phone, '')) AS customerPhone,
       COALESCE(a.recipient_name, NULLIF(o.shipping_name, '')) AS shipRecipientName,
       COALESCE(a.phone, NULLIF(o.shipping_phone, '')) AS shipPhone,
       COALESCE(a.line1, NULLIF(o.shipping_line1, '')) AS shipLine1,
       COALESCE(a.line2, o.shipping_line2) AS shipLine2,
       COALESCE(a.city, NULLIF(o.shipping_city, '')) AS shipCity,
       COALESCE(a.region, o.shipping_region) AS shipRegion,
       COALESCE(a.postal_code, o.shipping_postal_code) AS shipPostalCode,
       COALESCE(a.country, NULLIF(o.shipping_country, '')) AS shipCountry
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
