import type { MiddlewareHandler } from 'hono'
import type { Bindings } from './types'

export const requireBearerToken: MiddlewareHandler<{ Bindings: Bindings }> = async (c, next) => {
  const header = c.req.header('Authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''

  if (!c.env.API_TOKEN || token !== c.env.API_TOKEN) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  await next()
}
