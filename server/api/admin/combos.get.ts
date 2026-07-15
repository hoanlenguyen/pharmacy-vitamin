export default defineEventHandler(async event => {
  assertAdminToken(event)
  const query = getQuery(event)
  return await workerFetch(event, '/admin/combos', { query, auth: true })
})
