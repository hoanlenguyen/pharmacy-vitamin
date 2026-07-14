<template>
  <div>
    <h1 class="mb-6 font-display text-2xl font-bold text-gray-900">Orders</h1>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="error" class="text-sm text-red-600">Failed to load orders: {{ error.message }}</p>
    <p v-else-if="orders.length === 0" class="text-sm text-gray-400">No orders yet.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-card">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
          <tr>
            <th class="px-4 py-3">Order #</th>
            <th class="px-4 py-3">Customer</th>
            <th class="px-4 py-3">Items</th>
            <th class="px-4 py-3">Total</th>
            <th class="px-4 py-3">Payment</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Placed</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="item in orders"
            :key="item.id"
            class="cursor-pointer hover:bg-rose-50/40"
            @click="navigateTo(`/admin/orders/${encodeURIComponent(item.id)}`)"
          >
            <td class="px-4 py-3 font-medium text-gray-800">{{ item.orderNumber }}</td>
            <td class="px-4 py-3 text-gray-600">
              <div>{{ item.customerName ?? '—' }}</div>
              <div class="text-xs text-gray-400">{{ item.customerEmail }}</div>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ item.itemCount }}</td>
            <td class="px-4 py-3 text-gray-700">{{ formatCurrency(item.total) }}</td>
            <td class="px-4 py-3 text-gray-500">{{ paymentLabel(item.paymentMethod) }}</td>
            <td class="px-4 py-3">
              <StatusBadge :status="item.status" />
            </td>
            <td class="px-4 py-3 text-gray-500">{{ formatDate(item.placedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type AdminOrder = {
  id: string
  orderNumber: string
  status: string
  total: number
  paymentMethod: string
  placedAt: string
  customerName: string | null
  customerEmail: string | null
  itemCount: number
}

const { isAuthenticated, authHeaders } = useAdminAuth()

const orders = ref<AdminOrder[]>([])
const pending = ref(false)
const error = ref<Error | null>(null)

async function loadOrders() {
  pending.value = true
  error.value = null
  try {
    const data = await $fetch<{ items: AdminOrder[] }>('/api/admin/orders', { headers: authHeaders() })
    orders.value = data.items
  } catch (err: any) {
    error.value = err
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})
watch(isAuthenticated, value => { if (value) loadOrders() }, { immediate: true })

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}
function formatDate(value: string) {
  return new Date(value.replace(' ', 'T')).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
function paymentLabel(method: string) {
  return { cod: 'Cash on Delivery', card: 'Card', bank_transfer: 'Bank Transfer' }[method] ?? method
}
</script>
