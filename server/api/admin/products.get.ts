export default defineEventHandler(async event => {
  assertAdminToken(event)
  return await workerFetch(event, '/admin/products', { auth: true })
})
