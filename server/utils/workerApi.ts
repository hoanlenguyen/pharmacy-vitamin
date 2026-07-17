import type { H3Event } from 'h3'
import { $fetch as ofetch } from 'ofetch'

/**
 * Calls the Cloudflare Worker API server-to-server. The real Worker bearer
 * token lives only here (runtimeConfig, server-only) — it never reaches the
 * browser, so public routes don't need to pass `auth`.
 *
 * Uses plain ofetch (not Nuxt's auto-imported $fetch) — the destination is an
 * external Worker URL, not an internal Nitro route, and Nitro's typed-route
 * inference otherwise blows up trying to match a fully dynamic `path` against
 * every known /api/* literal.
 */
export async function workerFetch<T>(
  event: H3Event,
  path: string,
  options: {
    method?: string
    query?: Record<string, unknown>
    body?: RequestInit['body'] | Record<string, any>
    auth?: boolean
    extraHeaders?: Record<string, string>
  } = {}
): Promise<T> {
  const config = useRuntimeConfig(event)

  // Read process.env at *runtime* with the build-baked runtimeConfig as fallback. On Vercel,
  // runtimeConfig values sourced from `process.env.X` in nuxt.config are frozen at build time,
  // so a cached/redeployed build can keep a stale default (e.g. localhost). Vercel injects the
  // real env vars into the serverless runtime, so reading them here stays correct regardless of
  // when the bundle was built.
  const baseURL = process.env.WORKER_API_URL || config.workerApiUrl
  const token = process.env.WORKER_API_TOKEN || config.workerApiToken

  try {
    return await ofetch<T>(path, {
      baseURL,
      method: (options.method as 'GET') ?? 'GET',
      query: options.query,
      body: options.body,
      headers: {
        ...(options.auth ? { Authorization: `Bearer ${token}` } : {}),
        ...options.extraHeaders
      }
    })
  } catch (error: any) {
    // Surface the Worker's actual status/message instead of collapsing to a 500.
    throw createError({
      statusCode: error?.response?.status ?? 502,
      statusMessage: error?.data?.error ?? 'Upstream request failed'
    })
  }
}

/**
 * Gate for /api/admin/* routes. The admin UI stores a shared token in
 * sessionStorage and sends it as X-Admin-Token; this checks it server-side
 * before proxying to the Worker with the real API token.
 *
 * TODO: replace with real per-user auth once the `users` table (Phase B) is wired up.
 */
export function assertAdminToken(event: H3Event) {
  const config = useRuntimeConfig(event)
  const provided = getHeader(event, 'x-admin-token')
  // Runtime env first (see workerFetch above), falling back to build-baked config.
  const expected = process.env.ADMIN_UI_TOKEN || process.env.WORKER_API_TOKEN || config.adminUiToken

  if (!expected || provided !== expected) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}
