export default defineEventHandler(async event => {
  assertAdminToken(event)
  const slug = getRouterParam(event, 'slug')
  const body = await readBody(event)
  return await workerFetch(event, `/admin/brands/${slug}`, { method: 'PATCH', body, auth: true })
})
