import { Hono } from 'hono'
import type { Bindings } from '../lib/types'

export const orders = new Hono<{ Bindings: Bindings }>()

// Guest checkout has no cart/coupon backend yet — shipping is a flat fee, free above a
// threshold, computed server-side so the client can't just send whatever total it wants.
const FREE_SHIPPING_THRESHOLD = 500000
const FLAT_SHIPPING_FEE = 30000
const VALID_PAYMENT_METHODS = new Set(['bank_transfer', 'cod'])

type CreateOrderBody = {
  customer?: { name?: string; email?: string; phone?: string }
  shipping?: {
    name?: string
    phone?: string
    line1?: string
    line2?: string
    city?: string
    region?: string
    postalCode?: string
    country?: string
  }
  items?: { slug?: string; variantId?: string; quantity?: number }[]
  paymentMethod?: string
  notes?: string
}

// POST /orders — guest checkout. Resolves each cart line against the catalog server-side
// (never trusts client-supplied prices), snapshots the result onto order_items, and stores
// customer/shipping details directly on the order since there's no logged-in user or
// pre-existing address row to attach them to.
orders.post('/', async c => {
  const body = await c.req.json<CreateOrderBody>()

  const customer = body.customer
  const shipping = body.shipping
  const items = body.items ?? []
  const paymentMethod = body.paymentMethod

  if (!customer?.name || !customer?.email || !customer?.phone) {
    return c.json({ error: 'customer.name, customer.email, and customer.phone are required' }, 400)
  }
  if (!shipping?.name || !shipping?.phone || !shipping?.line1 || !shipping?.city || !shipping?.country) {
    return c.json({ error: 'shipping.name, phone, line1, city, and country are required' }, 400)
  }
  if (!items.length) {
    return c.json({ error: 'At least one item is required' }, 400)
  }
  if (!paymentMethod || !VALID_PAYMENT_METHODS.has(paymentMethod)) {
    return c.json({ error: `paymentMethod must be one of: ${[...VALID_PAYMENT_METHODS].join(', ')}` }, 400)
  }

  type ResolvedLine = {
    productId: string
    variantId: string | null
    nameSnapshot: string
    unitPrice: number
    quantity: number
    lineTotal: number
  }
  const resolvedLines: ResolvedLine[] = []

  for (const item of items) {
    const quantity = Math.floor(Number(item.quantity))
    if (!item.slug || !Number.isFinite(quantity) || quantity < 1) {
      return c.json({ error: 'Each item needs a slug and a positive quantity' }, 400)
    }

    const product = await c.env.DB.prepare(`SELECT id, name, price FROM products WHERE slug = ?1 AND status = 'active'`)
      .bind(item.slug)
      .first<{ id: string; name: string; price: number }>()
    if (!product) {
      return c.json({ error: `Unknown or inactive product: ${item.slug}` }, 400)
    }

    let unitPrice = product.price
    let nameSnapshot = product.name
    let variantId: string | null = null

    if (item.variantId) {
      const variant = await c.env.DB.prepare(
        `SELECT v.id, v.price, ov.value AS optionValue
         FROM product_variants v
         JOIN product_variant_option_values vov ON vov.variant_id = v.id
         JOIN product_option_values ov ON ov.id = vov.option_value_id
         WHERE v.id = ?1 AND v.product_id = ?2`
      )
        .bind(item.variantId, product.id)
        .first<{ id: string; price: number; optionValue: string }>()
      if (!variant) {
        return c.json({ error: `Unknown variant for ${item.slug}` }, 400)
      }
      unitPrice = variant.price
      nameSnapshot = `${product.name} (${variant.optionValue})`
      variantId = variant.id
    }

    resolvedLines.push({ productId: product.id, variantId, nameSnapshot, unitPrice, quantity, lineTotal: unitPrice * quantity })
  }

  const subtotal = resolvedLines.reduce((sum, line) => sum + line.lineTotal, 0)
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE
  const total = subtotal + shippingFee

  const lastOrder = await c.env.DB.prepare(
    `SELECT order_number AS orderNumber FROM orders WHERE order_number LIKE 'PV-%' ORDER BY order_number DESC LIMIT 1`
  ).first<{ orderNumber: string }>()
  const nextSeq = lastOrder ? Number(lastOrder.orderNumber.slice(3)) + 1 : 1
  const orderNumber = `PV-${String(nextSeq).padStart(6, '0')}`

  const orderId = crypto.randomUUID()

  await c.env.DB.prepare(
    `INSERT INTO orders (
       id, order_number, status, subtotal, shipping_fee, discount_total, total, payment_method,
       customer_name, customer_email, customer_phone,
       shipping_name, shipping_phone, shipping_line1, shipping_line2, shipping_city, shipping_region, shipping_postal_code, shipping_country,
       notes
     ) VALUES (?1, ?2, 'pending', ?3, ?4, 0, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18)`
  )
    .bind(
      orderId,
      orderNumber,
      subtotal,
      shippingFee,
      total,
      paymentMethod,
      customer.name,
      customer.email,
      customer.phone,
      shipping.name,
      shipping.phone,
      shipping.line1,
      shipping.line2 ?? null,
      shipping.city,
      shipping.region ?? null,
      shipping.postalCode ?? null,
      shipping.country,
      body.notes ?? null
    )
    .run()

  await c.env.DB.batch(
    resolvedLines.map(line =>
      c.env.DB.prepare(
        `INSERT INTO order_items (id, order_id, product_id, variant_id, product_name_snapshot, unit_price_snapshot, quantity, line_total)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
      ).bind(crypto.randomUUID(), orderId, line.productId, line.variantId, line.nameSnapshot, line.unitPrice, line.quantity, line.lineTotal)
    )
  )

  return c.json({ id: orderId, orderNumber, subtotal, shippingFee, total }, 201)
})

// GET /orders/:orderNumber — public lookup for the order-confirmation page. Order numbers
// are sequential but not guessable enough to matter for a demo checkout with no payment
// data attached; nothing sensitive beyond what the customer themselves just submitted.
orders.get('/:orderNumber', async c => {
  const orderNumber = c.req.param('orderNumber')

  const order = await c.env.DB.prepare(
    `SELECT
       id, order_number AS orderNumber, status, subtotal, shipping_fee AS shippingFee, discount_total AS discountTotal, total,
       payment_method AS paymentMethod, placed_at AS placedAt,
       customer_name AS customerName, customer_email AS customerEmail, customer_phone AS customerPhone,
       shipping_name AS shippingName, shipping_phone AS shippingPhone, shipping_line1 AS shippingLine1, shipping_line2 AS shippingLine2,
       shipping_city AS shippingCity, shipping_region AS shippingRegion, shipping_postal_code AS shippingPostalCode, shipping_country AS shippingCountry,
       notes
     FROM orders WHERE order_number = ?1`
  )
    .bind(orderNumber)
    .first()

  if (!order) {
    return c.json({ error: 'Not found' }, 404)
  }

  const { results: items } = await c.env.DB.prepare(
    `SELECT oi.id, oi.product_name_snapshot AS productName, oi.unit_price_snapshot AS unitPrice, oi.quantity, oi.line_total AS lineTotal,
            p.slug AS productSlug
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?1`
  )
    .bind(order.id)
    .all()

  return c.json({ ...order, items })
})
