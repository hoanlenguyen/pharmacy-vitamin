export default defineEventHandler(async event => {
  assertAdminToken(event)
  const body = await readBody(event)
  return await workerFetch(event, '/admin/products', { method: 'POST', body, auth: true })
})
