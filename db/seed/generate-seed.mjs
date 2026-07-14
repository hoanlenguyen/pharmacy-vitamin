// Generates db/seed.sql from the structured data below.
//
// Run: node db/seed/generate-seed.mjs > db/seed.sql
//
// IDs here are deterministic slug-based strings (readable, stable across
// re-runs) — fine for seed data. Records created at runtime by the API
// should use crypto.randomUUID() instead.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

function sql(value) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return String(value)
  return `'${String(value).replace(/'/g, "''")}'`
}

const brands = [{ slug: 'caryophy', name: 'Caryophy', description: 'Korean skincare brand focused on gentle, repair-driven formulas.' }]

// parent: slug of parent category, or null for top-level.
const categories = [
  { slug: 'makeup', name: 'Makeup', parent: null },
  { slug: 'skin-care', name: 'Skin Care', parent: null },
  { slug: 'personal-care', name: 'Personal Care', parent: null },
  { slug: 'supplements', name: 'Supplements', parent: null },
  { slug: 'beauty-tools', name: 'Beauty Tools', parent: null },
  { slug: 'cleansing', name: 'Cleansing', parent: 'skin-care' },
  { slug: 'moisturizing', name: 'Moisturizing', parent: 'skin-care' },
  { slug: 'masks', name: 'Masks', parent: 'moisturizing' }
]

// categories: array of category slugs this product belongs to.
// primaryCategory: which one drives the canonical breadcrumb/URL.
// variants: optional { optionName, values: [{ value, price, compareAtPrice? }] }
const products = [
  {
    slug: 'brightening-sunscreen-spf50-pa-50ml',
    name: 'Brightening Sunscreen SPF50+ PA++++ 50ml',
    price: 139000,
    compareAtPrice: 350000,
    categories: ['skin-care'],
    primaryCategory: 'skin-care'
  },
  {
    slug: 'hyaluronic-acid-cleansing-water-200ml',
    name: 'Hyaluronic Acid Cleansing Water 200ml',
    price: 99000,
    categories: ['skin-care', 'cleansing'],
    primaryCategory: 'cleansing',
    variants: { optionName: 'Size', values: [{ value: '200ml', price: 99000 }, { value: '400ml', price: 159000 }] }
  },
  {
    slug: 'vitamin-c-brightening-serum-30ml',
    name: 'Vitamin C Brightening Serum 30ml',
    price: 259000,
    compareAtPrice: 420000,
    categories: ['skin-care'],
    primaryCategory: 'skin-care'
  },
  {
    slug: 'calming-sheet-mask-pack-of-5',
    name: 'Calming Sheet Mask (Pack of 5)',
    price: 89000,
    compareAtPrice: 120000,
    categories: ['skin-care', 'moisturizing', 'masks'],
    primaryCategory: 'masks'
  },
  {
    slug: 'gentle-foaming-cleanser-150ml',
    name: 'Gentle Foaming Cleanser 150ml',
    price: 175000,
    compareAtPrice: 210000,
    categories: ['skin-care', 'cleansing'],
    primaryCategory: 'cleansing'
  },
  {
    slug: 'caryophy-skin-repair-mask-sheet-25g',
    name: 'Skin Repair Sheet Mask 25g',
    brand: 'caryophy',
    sku: '8809501251087-1',
    price: 22000,
    compareAtPrice: 50000,
    soldCount: 1205,
    ratingAvg: 4.9,
    ratingCount: 86,
    categories: ['skin-care', 'moisturizing', 'masks'],
    primaryCategory: 'masks',
    summary:
      'A soothing sheet mask built for stressed, post-treatment skin. A lightweight essence delivers an instant moisture boost while calming redness and irritation, leaving skin softer and visibly calmer after a single use.',
    bullets: {
      skin_concern: [
        'Sensitive or easily irritated skin',
        'Dehydrated skin lacking moisture',
        'Redness and a weakened skin barrier'
      ],
      how_to_use: [
        'Cleanse with a gentle cleanser and toner.',
        'Unfold the sheet mask and smooth it onto clean, dry skin.',
        'Leave on for 15–20 minutes.',
        'Remove the sheet and pat the remaining essence into skin.'
      ]
    },
    ingredients: [
      { name: 'Panthenol (Vitamin B5)', benefit: 'Calms irritation and locks in moisture' },
      { name: 'Beta-Glucan', benefit: 'Strengthens the skin barrier and aids recovery' },
      { name: 'Centella Asiatica Extract', benefit: 'Soothes redness and supports skin repair' },
      { name: 'Grape Extract', benefit: 'Antioxidant support against environmental stress' },
      { name: 'Chamomile Extract (Guaiazulene)', benefit: 'Gentle, cooling relief for reactive skin' }
    ]
  },
  {
    slug: 'aqua-tone-up-sunscreen-spf50-pa',
    name: 'Aqua Tone-Up Sunscreen SPF50+ PA++++',
    price: 345000,
    compareAtPrice: 560000,
    soldCount: 1196,
    categories: ['skin-care'],
    primaryCategory: 'skin-care',
    variants: { optionName: 'Size', values: [{ value: '50ml', price: 345000, compareAtPrice: 560000 }, { value: '70ml', price: 445000 }] }
  },
  {
    slug: 'pore-clearing-gommage-peel-120g',
    name: 'Pore-Clearing Gommage Peel 120g',
    price: 130000,
    compareAtPrice: 150000,
    soldCount: 1758,
    categories: ['skin-care'],
    primaryCategory: 'skin-care'
  },
  {
    slug: 'uv-protection-milk-spf50-pa-60ml',
    name: 'UV Protection Milk SPF50+ PA+++ 60ml',
    price: 508000,
    compareAtPrice: 558000,
    soldCount: 345,
    categories: ['skin-care'],
    primaryCategory: 'skin-care'
  },
  {
    slug: 'tinted-sunscreen-fluid-cream-40ml',
    name: 'Tinted Sunscreen Fluid Cream 40ml',
    price: 869000,
    compareAtPrice: 1050000,
    soldCount: 2075,
    categories: ['skin-care'],
    primaryCategory: 'skin-care'
  },
  {
    slug: 'glow-highlighter-5-9g',
    name: 'Glow Highlighter 5.9g',
    price: 149000,
    soldCount: 1146,
    categories: ['makeup'],
    primaryCategory: 'makeup',
    variants: { optionName: 'Shade', values: [{ value: 'Shade 01', price: 149000 }, { value: 'Shade 02', price: 155000 }] }
  },
  {
    slug: 'single-blusher-5g',
    name: 'Single Blusher 5g',
    price: 99000,
    compareAtPrice: 159000,
    soldCount: 545,
    categories: ['makeup'],
    primaryCategory: 'makeup',
    variants: { optionName: 'Shade', values: [{ value: 'Shade 01', price: 99000, compareAtPrice: 159000 }, { value: 'Shade 02', price: 99000, compareAtPrice: 159000 }] }
  },
  {
    slug: 'moisturizing-lip-balm-stick-4g',
    name: 'Moisturizing Lip Balm Stick 4g',
    price: 149000,
    compareAtPrice: 155000,
    ratingAvg: 5,
    ratingCount: 44,
    categories: ['makeup'],
    primaryCategory: 'makeup'
  },
  {
    slug: 'tip-concealer',
    name: 'Tip Concealer',
    price: 119000,
    compareAtPrice: 200000,
    ratingAvg: 5,
    ratingCount: 30,
    categories: ['makeup'],
    primaryCategory: 'makeup',
    variants: { optionName: 'Shade', values: [{ value: 'Shade 01', price: 119000, compareAtPrice: 200000 }, { value: 'Shade 02', price: 119000, compareAtPrice: 200000 }] }
  },
  {
    slug: 'waterproof-brush-eyeliner',
    name: 'Waterproof Brush Eyeliner',
    price: 95000,
    compareAtPrice: 150000,
    ratingAvg: 5,
    ratingCount: 42,
    categories: ['makeup'],
    primaryCategory: 'makeup'
  },
  {
    slug: 'overnight-lip-sleeping-mask-20ml',
    name: 'Overnight Lip Sleeping Mask 20ml',
    price: 389000,
    compareAtPrice: 460000,
    ratingAvg: 5,
    ratingCount: 26,
    categories: ['makeup'],
    primaryCategory: 'makeup',
    variants: { optionName: 'Size', values: [{ value: '8ml', price: 189000 }, { value: '20ml', price: 389000, compareAtPrice: 460000 }] }
  },
  {
    slug: 'velvet-lip-tint',
    name: 'Velvet Lip Tint',
    price: 310000,
    compareAtPrice: 359000,
    ratingAvg: 5,
    ratingCount: 11,
    categories: ['makeup'],
    primaryCategory: 'makeup',
    variants: { optionName: 'Shade', values: [{ value: 'Shade 01', price: 310000, compareAtPrice: 359000 }, { value: 'Shade 02', price: 310000, compareAtPrice: 359000 }] }
  },
  {
    slug: 'lip-cream',
    name: 'Lip Cream',
    price: 185000,
    compareAtPrice: 199000,
    ratingAvg: 5,
    ratingCount: 6,
    categories: ['makeup'],
    primaryCategory: 'makeup'
  },
  {
    slug: 'volumizing-waterproof-mascara',
    name: 'Volumizing Waterproof Mascara',
    price: 149000,
    compareAtPrice: 189000,
    soldCount: 1749,
    categories: ['makeup'],
    primaryCategory: 'makeup'
  }
]

// Sample customers + orders — demonstrates the admin Orders/Users views.
// No real checkout flow exists yet, so this is the only source of order data.
const users = [
  { key: 'lan', email: 'lan.nguyen@example.com', name: 'Nguyễn Thị Lan', phone: '0901234567' },
  { key: 'minh', email: 'minh.tran@example.com', name: 'Trần Văn Minh', phone: '0912345678' },
  { key: 'huong', email: 'huong.pham@example.com', name: 'Phạm Thị Hương', phone: '0923456789' }
]

const addresses = [
  { userKey: 'lan', recipientName: 'Nguyễn Thị Lan', phone: '0901234567', line1: '123 Nguyễn Huệ', city: 'Ho Chi Minh City', isDefault: true },
  { userKey: 'minh', recipientName: 'Trần Văn Minh', phone: '0912345678', line1: '45 Lê Lợi', city: 'Ho Chi Minh City', isDefault: true },
  { userKey: 'huong', recipientName: 'Phạm Thị Hương', phone: '0923456789', line1: '78 Trần Hưng Đạo', city: 'Ho Chi Minh City', isDefault: true }
]

// unitPrice defaults to the product's current price if omitted.
const orders = [
  {
    number: 'PV-000001',
    userKey: 'lan',
    status: 'delivered',
    paymentMethod: 'cod',
    placedAt: '2026-06-20 09:15:00',
    shippingFee: 0,
    items: [
      { productSlug: 'caryophy-skin-repair-mask-sheet-25g', quantity: 2 },
      { productSlug: 'brightening-sunscreen-spf50-pa-50ml', quantity: 1 }
    ]
  },
  {
    number: 'PV-000002',
    userKey: 'minh',
    status: 'shipped',
    paymentMethod: 'bank_transfer',
    placedAt: '2026-07-01 14:30:00',
    shippingFee: 20000,
    items: [
      { productSlug: 'vitamin-c-brightening-serum-30ml', quantity: 1 },
      { productSlug: 'velvet-lip-tint', quantity: 1 }
    ]
  },
  {
    number: 'PV-000003',
    userKey: 'huong',
    status: 'paid',
    paymentMethod: 'card',
    placedAt: '2026-07-05 11:00:00',
    shippingFee: 20000,
    items: [{ productSlug: 'moisturizing-lip-balm-stick-4g', quantity: 3 }]
  },
  {
    number: 'PV-000004',
    userKey: 'lan',
    status: 'pending',
    paymentMethod: 'cod',
    placedAt: '2026-07-12 16:45:00',
    shippingFee: 20000,
    items: [{ productSlug: 'caryophy-skin-repair-mask-sheet-25g', quantity: 1 }]
  }
]

const lines = [
  '-- Generated by db/seed/generate-seed.mjs — do not hand-edit, regenerate instead.',
  '-- Placeholder image URLs point at a not-yet-real domain; swap for R2 public URLs once photos are uploaded.',
  ''
]

// --- brands ---
for (const b of brands) {
  const id = `brand:${b.slug}`
  lines.push(
    `INSERT INTO brands (id, name, slug, description) VALUES (${sql(id)}, ${sql(b.name)}, ${sql(b.slug)}, ${sql(b.description ?? null)});`
  )
}
lines.push('')

// --- categories (top-level first, so parent_id always resolves) ---
const categoryId = slug => `cat:${slug}`
for (const c of categories) {
  const id = categoryId(c.slug)
  const parentId = c.parent ? categoryId(c.parent) : null
  lines.push(
    `INSERT INTO categories (id, parent_id, name, slug) VALUES (${sql(id)}, ${sql(parentId)}, ${sql(c.name)}, ${sql(c.slug)});`
  )
}
lines.push('')

// --- products + related rows ---
for (const p of products) {
  const productId = `prod:${p.slug}`
  const brandId = p.brand ? `brand:${p.brand}` : null

  lines.push(
    `INSERT INTO products (id, slug, brand_id, sku, name, summary, price, compare_at_price, rating_avg, rating_count, sold_count, status) VALUES (` +
      [
        sql(productId),
        sql(p.slug),
        sql(brandId),
        sql(p.sku ?? null),
        sql(p.name),
        sql(p.summary ?? null),
        sql(p.price),
        sql(p.compareAtPrice ?? null),
        sql(p.ratingAvg ?? 0),
        sql(p.ratingCount ?? 0),
        sql(p.soldCount ?? 0),
        sql('active')
      ].join(', ') +
      ');'
  )

  for (const catSlug of p.categories) {
    const isPrimary = catSlug === p.primaryCategory ? 1 : 0
    lines.push(
      `INSERT INTO product_categories (product_id, category_id, is_primary) VALUES (${sql(productId)}, ${sql(categoryId(catSlug))}, ${isPrimary});`
    )
  }

  // 3 placeholder image slots per product, matching the current UI's gallery mock.
  for (let i = 1; i <= 3; i++) {
    lines.push(
      `INSERT INTO product_images (id, product_id, url, alt_text, sort_order) VALUES (${sql(`img:${p.slug}:${i}`)}, ${sql(productId)}, ${sql(`https://assets.pharmacy-vitamin.example/${p.slug}-${i}.jpg`)}, ${sql(p.name)}, ${i - 1});`
    )
  }

  if (p.bullets) {
    let order = 0
    for (const [type, items] of Object.entries(p.bullets)) {
      for (const content of items) {
        lines.push(
          `INSERT INTO product_bullets (id, product_id, type, content, sort_order) VALUES (${sql(`bul:${p.slug}:${order}`)}, ${sql(productId)}, ${sql(type)}, ${sql(content)}, ${order});`
        )
        order++
      }
    }
  }

  if (p.ingredients) {
    p.ingredients.forEach((ing, i) => {
      lines.push(
        `INSERT INTO product_ingredients (id, product_id, name, benefit, sort_order) VALUES (${sql(`ing:${p.slug}:${i}`)}, ${sql(productId)}, ${sql(ing.name)}, ${sql(ing.benefit)}, ${i});`
      )
    })
  }

  if (p.variants) {
    const optionSlug = p.variants.optionName.toLowerCase()
    const optionId = `opt:${p.slug}:${optionSlug}`
    lines.push(
      `INSERT INTO product_options (id, product_id, name, sort_order) VALUES (${sql(optionId)}, ${sql(productId)}, ${sql(p.variants.optionName)}, 0);`
    )
    p.variants.values.forEach((v, i) => {
      const valueSlug = v.value.toLowerCase().replace(/\s+/g, '-')
      const optionValueId = `optval:${p.slug}:${optionSlug}:${valueSlug}`
      const variantId = `var:${p.slug}:${valueSlug}`
      lines.push(
        `INSERT INTO product_option_values (id, option_id, value, sort_order) VALUES (${sql(optionValueId)}, ${sql(optionId)}, ${sql(v.value)}, ${i});`
      )
      lines.push(
        `INSERT INTO product_variants (id, product_id, sku, price, compare_at_price, stock_quantity) VALUES (${sql(variantId)}, ${sql(productId)}, ${sql(null)}, ${sql(v.price)}, ${sql(v.compareAtPrice ?? null)}, 50);`
      )
      lines.push(
        `INSERT INTO product_variant_option_values (variant_id, option_value_id) VALUES (${sql(variantId)}, ${sql(optionValueId)});`
      )
    })
  }

  lines.push('')
}

// --- users, addresses, orders ---
const priceBySlug = new Map(products.map(p => [p.slug, p.price]))
const userId = key => `user:${key}`
const addressId = i => `addr:${i}`

for (const u of users) {
  lines.push(
    `INSERT INTO users (id, email, password_hash, name, phone) VALUES (${sql(userId(u.key))}, ${sql(u.email)}, ${sql('seed-placeholder-not-a-real-hash')}, ${sql(u.name)}, ${sql(u.phone)});`
  )
}
lines.push('')

addresses.forEach((a, i) => {
  lines.push(
    `INSERT INTO addresses (id, user_id, recipient_name, phone, line1, city, country, is_default) VALUES (${sql(addressId(i))}, ${sql(userId(a.userKey))}, ${sql(a.recipientName)}, ${sql(a.phone)}, ${sql(a.line1)}, ${sql(a.city)}, ${sql('VN')}, ${a.isDefault ? 1 : 0});`
  )
})
lines.push('')

orders.forEach(o => {
  const orderId = `order:${o.number}`
  const addressIndex = addresses.findIndex(a => a.userKey === o.userKey)
  const lineItems = o.items.map(item => {
    const unitPrice = item.unitPrice ?? priceBySlug.get(item.productSlug)
    if (unitPrice === undefined) throw new Error(`Unknown product slug in order ${o.number}: ${item.productSlug}`)
    return { ...item, unitPrice, lineTotal: unitPrice * item.quantity }
  })
  const subtotal = lineItems.reduce((sum, i) => sum + i.lineTotal, 0)
  const total = subtotal + o.shippingFee

  lines.push(
    `INSERT INTO orders (id, order_number, user_id, status, shipping_address_id, subtotal, shipping_fee, discount_total, total, payment_method, placed_at) VALUES (${sql(orderId)}, ${sql(o.number)}, ${sql(userId(o.userKey))}, ${sql(o.status)}, ${sql(addressId(addressIndex))}, ${subtotal}, ${o.shippingFee}, 0, ${total}, ${sql(o.paymentMethod)}, ${sql(o.placedAt)});`
  )

  lineItems.forEach((item, i) => {
    const productName = products.find(p => p.slug === item.productSlug)?.name ?? item.productSlug
    lines.push(
      `INSERT INTO order_items (id, order_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, line_total) VALUES (${sql(`orderitem:${o.number}:${i}`)}, ${sql(orderId)}, ${sql(`prod:${item.productSlug}`)}, ${sql(productName)}, ${item.unitPrice}, ${item.quantity}, ${item.lineTotal});`
    )
  })
  lines.push('')
})

const outPath = resolve(__dirname, '..', 'seed.sql')
writeFileSync(outPath, lines.join('\n') + '\n', 'utf8')
console.log(`Wrote ${outPath} (${products.length} products, ${brands.length} brands, ${categories.length} categories)`)
