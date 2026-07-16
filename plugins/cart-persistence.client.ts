import { useCartStore } from '~/stores/cart'

const STORAGE_KEY = 'pharmacy-vitamin-cart'

// Bridges the cart store to localStorage on the client: rehydrate the saved cart, then mirror
// every subsequent change back to storage. Cart-dependent UI is wrapped in <ClientOnly>, so
// populating the store here (before the client render) can't cause a hydration mismatch.
export default defineNuxtPlugin(() => {
  const cart = useCartStore()
  cart.hydrate()

  watch(
    () => cart.items,
    items => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    },
    { deep: true }
  )
})
