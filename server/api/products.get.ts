export default defineEventHandler(async event => {
  const query = getQuery(event)
  return await workerFetch(event, '/products', { query })
})
