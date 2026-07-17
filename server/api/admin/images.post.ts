export default defineEventHandler(async event => {
  assertAdminToken(event)

  const filename = getQuery(event).filename as string | undefined
  const contentType = getHeader(event, 'content-type') ?? 'application/octet-stream'
  const body = await readRawBody(event, false)

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Empty request body' })
  }

  const result = await workerFetch<{ url: string }>(event, '/admin/images', {
    method: 'POST',
    query: filename ? { filename } : undefined,
    body,
    auth: true,
    // workerFetch doesn't set this by default — image uploads need the real content-type, not JSON.
    extraHeaders: { 'Content-Type': contentType }
  })

  // The Worker returns a path relative to its own origin; resolve it here so the
  // browser (which never talks to the Worker directly) gets a loadable absolute URL.
  // workerBaseUrl trims stray whitespace so it can't corrupt the stored image URL.
  return { url: `${workerBaseUrl(event)}${result.url}` }
})
