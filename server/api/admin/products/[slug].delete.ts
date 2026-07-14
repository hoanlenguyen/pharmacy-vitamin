export default defineEventHandler(async event => {
  assertAdminToken(event)
  const slug = getRouterParam(event, 'slug')
  return await workerFetch(event, `/admin/products/${slug}`, { method: 'DELETE', auth: true })
})
