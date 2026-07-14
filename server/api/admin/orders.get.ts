export default defineEventHandler(async event => {
  assertAdminToken(event)
  return await workerFetch(event, '/admin/orders', { auth: true })
})
