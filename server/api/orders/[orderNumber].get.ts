export default defineEventHandler(async event => {
  const orderNumber = getRouterParam(event, 'orderNumber')
  return await workerFetch(event, `/orders/${orderNumber}`)
})
