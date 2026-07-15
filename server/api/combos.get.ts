export default defineEventHandler(async event => {
  return await workerFetch(event, '/combos')
})
