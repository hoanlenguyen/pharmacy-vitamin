export default defineEventHandler(async event => {
  assertAdminToken(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  return await workerFetch(event, `/admin/orders/${id}`, { method: 'PATCH', body, auth: true })
})
