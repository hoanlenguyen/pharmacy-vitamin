export default defineEventHandler(async event => {
  const body = await readBody(event)
  return await workerFetch(event, '/orders', { method: 'POST', body })
})
