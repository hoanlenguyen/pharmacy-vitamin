import { defineStore } from 'pinia'

export type CartLine = {
  id: string
  name: string
  price: number
  originalPrice?: number
  slug?: string
  quantity: number
}

export type CartInput = Omit<CartLine, 'quantity'>

const STORAGE_KEY = 'pharmacy-vitamin-cart'

// Cart lines are persisted to localStorage so the cart survives a page reload. Only runs on
// the client — localStorage doesn't exist during SSR.
function loadPersisted(): CartLine[] {
  if (import.meta.server) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CartLine[]) : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartLine[]
  }),

  getters: {
    count: state => state.items.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: state => state.items.reduce((sum, line) => sum + line.price * line.quantity, 0)
  },

  actions: {
    // Rehydrate from localStorage. Called once on the client (see the plugin) rather than in
    // state() so the server-rendered markup and the first client render agree (no hydration
    // mismatch); localStorage is applied right after mount.
    hydrate() {
      const persisted = loadPersisted()
      if (persisted.length) this.items = persisted
    },

    addItem(product: CartInput, quantity = 1) {
      const existing = this.items.find(line => line.id === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        this.items.push({ ...product, quantity })
      }
    },

    removeItem(id: string) {
      this.items = this.items.filter(line => line.id !== id)
    },

    updateQuantity(id: string, quantity: number) {
      const line = this.items.find(item => item.id === id)
      if (line) line.quantity = Math.max(1, quantity)
    },

    clear() {
      this.items = []
    }
  }
})
