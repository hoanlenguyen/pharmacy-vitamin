<template>
  <div class="mx-auto max-w-3xl">
    <NuxtLink to="/admin/orders" class="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600">
      <ArrowLeft class="h-3.5 w-3.5" aria-hidden="true" />
      Back to Orders
    </NuxtLink>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="!order" class="text-sm text-red-600">Order not found.</p>

    <div v-else class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="font-display text-2xl font-bold text-gray-900">{{ order.orderNumber }}</h1>
        <div class="flex items-center gap-3">
          <StatusBadge :status="order.status" />
          <select
            v-model="statusInput"
            class="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            :disabled="updating"
            @change="handleStatusChange"
          >
            <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>
      <p v-if="statusError" class="text-sm text-red-600">{{ statusError }}</p>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-card">
          <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Customer</h2>
          <NuxtLink
            v-if="order.customerId"
            :to="`/admin/users/${encodeURIComponent(order.customerId)}`"
            class="font-medium text-gray-800 hover:text-rose-600"
          >
            {{ order.customerName }}
          </NuxtLink>
          <p v-else-if="order.customerName" class="font-medium text-gray-800">{{ order.customerName }} <span class="text-xs font-normal text-gray-400">(guest)</span></p>
          <p class="text-sm text-gray-500">{{ order.customerEmail }}</p>
          <p class="text-sm text-gray-500">{{ order.customerPhone }}</p>
        </div>

        <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-card">
          <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Shipping Address</h2>
          <p class="font-medium text-gray-800">{{ order.shipRecipientName }}</p>
          <p class="text-sm text-gray-500">{{ order.shipPhone }}</p>
          <p class="text-sm text-gray-500">{{ [order.shipLine1, order.shipLine2, order.shipCity, order.shipCountry].filter(Boolean).join(', ') }}</p>
        </div>
      </div>

      <div class="rounded-xl border border-gray-100 bg-white shadow-card">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
            <tr>
              <th class="px-4 py-3">Product</th>
              <th class="px-4 py-3">Unit Price</th>
              <th class="px-4 py-3">Qty</th>
              <th class="px-4 py-3">Line Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in order.items" :key="item.id">
              <td class="px-4 py-3 font-medium text-gray-800">{{ item.productName }}</td>
              <td class="px-4 py-3 text-gray-500">{{ formatCurrency(item.unitPrice) }}</td>
              <td class="px-4 py-3 text-gray-500">{{ item.quantity }}</td>
              <td class="px-4 py-3 text-gray-700">{{ formatCurrency(item.lineTotal) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="space-y-1 border-t border-gray-100 p-5 text-sm">
          <div class="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{{ formatCurrency(order.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span>{{ formatCurrency(order.shippingFee) }}</span>
          </div>
          <div v-if="order.discountTotal > 0" class="flex justify-between text-gray-500">
            <span>Discount</span>
            <span>-{{ formatCurrency(order.discountTotal) }}</span>
          </div>
          <div class="flex justify-between border-t border-gray-100 pt-2 font-display text-base font-bold text-gray-900">
            <span>Total</span>
            <span>{{ formatCurrency(order.total) }}</span>
          </div>
        </div>
      </div>

      <p class="text-xs text-gray-400">
        Placed {{ formatDate(order.placedAt) }} · Payment: {{ paymentLabel(order.paymentMethod) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'

definePageMeta({ layout: 'admin' })

type OrderDetail = {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  shippingFee: number
  discountTotal: number
  total: number
  paymentMethod: string
  placedAt: string
  customerId: string | null
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  shipRecipientName: string | null
  shipPhone: string | null
  shipLine1: string | null
  shipLine2: string | null
  shipCity: string | null
  shipCountry: string | null
  items: { id: string; productName: string; unitPrice: number; quantity: number; lineTotal: number }[]
}

const { isAuthenticated, authHeaders } = useAdminAuth()
const route = useRoute()
const id = String(route.params.id)

const order = ref<OrderDetail | null>(null)
const pending = ref(true)
const statusInput = ref('')
const updating = ref(false)
const statusError = ref('')

const statusOptions = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

async function loadOrder() {
  pending.value = true
  try {
    order.value = await $fetch<OrderDetail>(`/api/admin/orders/${encodeURIComponent(id)}`, { headers: authHeaders() })
    statusInput.value = order.value.status
  } catch {
    order.value = null
  } finally {
    pending.value = false
  }
}

async function handleStatusChange() {
  if (!order.value || statusInput.value === order.value.status) return
  updating.value = true
  statusError.value = ''
  try {
    await $fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { status: statusInput.value }
    })
    order.value.status = statusInput.value
  } catch (err: any) {
    statusError.value = err?.data?.statusMessage ?? err?.data?.error ?? 'Failed to update status.'
    statusInput.value = order.value.status
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})
watch(isAuthenticated, value => { if (value) loadOrder() }, { immediate: true })

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}
function formatDate(value: string) {
  return new Date(value.replace(' ', 'T')).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function paymentLabel(method: string) {
  return { cod: 'Cash on Delivery', card: 'Card', bank_transfer: 'Bank Transfer' }[method] ?? method
}
</script>
