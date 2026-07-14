import { Hono } from 'hono'
import type { Bindings } from './lib/types'
import { products } from './routes/products'
import { categories, adminCategories } from './routes/categories'
import { brands, adminBrands } from './routes/brands'
import { admin } from './routes/admin'
import { images } from './routes/images'
import { adminUsers } from './routes/adminUsers'
import { adminOrders } from './routes/adminOrders'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', c => c.json({ ok: true, service: 'pharmacy-vitamin-api' }))

app.route('/products', products)
app.route('/categories', categories)
app.route('/brands', brands)
app.route('/admin', admin)
app.route('/admin/brands', adminBrands)
app.route('/admin/categories', adminCategories)
app.route('/admin/users', adminUsers)
app.route('/admin/orders', adminOrders)
app.route('/images', images)

export default app
