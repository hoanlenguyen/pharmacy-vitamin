const STORAGE_KEY = 'pharmacy-vitamin-admin-token'

// Module-scope singleton composable (auth is lightweight and non-persistent, so it stays a
// plain composable rather than a Pinia store like the cart).
const token = ref<string | null>(null)
let hydrated = false

/**
 * Shared-secret gate for the admin UI (sessionStorage, tab-scoped).
 * TODO: replace with real per-user auth once the `users` table (Phase B) is wired up.
 */
export function useAdminAuth() {
  // Read sessionStorage after mount, not during the client's initial render —
  // otherwise the client's first render (token already set) mismatches the
  // server's render (no sessionStorage there), which Vue flags as a hydration error.
  onMounted(() => {
    if (!hydrated) {
      token.value = sessionStorage.getItem(STORAGE_KEY)
      hydrated = true
    }
  })

  const isAuthenticated = computed(() => Boolean(token.value))

  function login(value: string) {
    token.value = value
    if (import.meta.client) sessionStorage.setItem(STORAGE_KEY, value)
  }

  function logout() {
    token.value = null
    if (import.meta.client) sessionStorage.removeItem(STORAGE_KEY)
  }

  /** Headers to attach to admin API calls. */
  function authHeaders(): Record<string, string> {
    return token.value ? { 'X-Admin-Token': token.value } : {}
  }

  return { token, isAuthenticated, login, logout, authHeaders }
}
