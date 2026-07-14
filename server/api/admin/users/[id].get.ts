export default defineEventHandler(async event => {
  assertAdminToken(event)
  const id = getRouterParam(event, 'id')
  return await workerFetch(event, `/admin/users/${id}`, { auth: true })
})
