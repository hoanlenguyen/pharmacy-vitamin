export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug')
  return await workerFetch(event, `/brands/${slug}`)
})
