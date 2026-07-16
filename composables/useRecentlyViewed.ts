const STORAGE_KEY = 'pharmacy-vitamin-recently-viewed'
const MAX_ITEMS = 8

// Module-scope singleton composable.
const slugs = ref<string[]>([])
let hydrated = false

/** Tracks recently-viewed product slugs in localStorage (client-only, no backend). */
export function useRecentlyViewed() {
  // Read localStorage after mount, not during the client's initial render — otherwise the
  // client's first render (slugs already set) mismatches the server's render (no
  // localStorage there), which Vue flags as a hydration error.
  onMounted(() => {
    if (!hydrated) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        slugs.value = raw ? (JSON.parse(raw) as string[]) : []
      } catch {
        slugs.value = []
      }
      hydrated = true
    }
  })

  function recordView(slug: string) {
    if (!slug) return
    slugs.value = [slug, ...slugs.value.filter(s => s !== slug)].slice(0, MAX_ITEMS)
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs.value))
  }

  return { slugs, recordView }
}
