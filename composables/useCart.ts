export type CartLine = {
  id: string
  name: string
  price: number
  originalPrice?: number
  slug?: string
  quantity: number
}

export type CartInput = Omit<CartLine, 'quantity'>

// Module-scope state — shared singleton across every component that calls useCart().
const items = ref<CartLine[]>([])

export function useCart() {
  function addItem(product: CartInput, quantity = 1) {
    const existing = items.value.find(line => line.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ ...product, quantity })
    }
  }

  function removeItem(id: string) {
    items.value = items.value.filter(line => line.id !== id)
  }

  function updateQuantity(id: string, quantity: number) {
    const line = items.value.find(item => item.id === id)
    if (line) line.quantity = Math.max(1, quantity)
  }

  const count = computed(() => items.value.reduce((sum, line) => sum + line.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, line) => sum + line.price * line.quantity, 0))

  return { items, addItem, removeItem, updateQuantity, count, subtotal }
}
