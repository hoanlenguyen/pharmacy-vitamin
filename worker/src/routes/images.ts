import { Hono } from 'hono'
import type { Bindings } from '../lib/types'

export const images = new Hono<{ Bindings: Bindings }>()

// GET /images/products/<uuid>.<ext> — public read, proxied through the Worker's
// R2 binding (no public bucket/custom domain needed).
images.get('/:key{.+}', async c => {
  const key = c.req.param('key')
  const object = await c.env.IMAGES.get(key)

  if (!object) {
    return c.notFound()
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
})
