<template>
  <div>
    <h1 class="mb-6 font-display text-2xl font-bold text-gray-900">Orders</h1>

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <AdminSearchInput v-model="orderIdFilter" placeholder="Search by order ID…" />
      <AdminSearchInput v-model="customerFilter" placeholder="Search by customer name…" />
      <AdminSearchInput v-model="phoneFilter" placeholder="Search by phone number…" />
    </div>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="error" class="text-sm text-red-600">Failed to load orders: {{ error.message }}</p>
    <p v-else-if="orders.length === 0" class="text-sm text-gray-400">No orders yet.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-card">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
          <tr>
            <AdminSortableTh label="Order #" sort-key="orderNumber" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <AdminSortableTh label="Customer" sort-key="customerName" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <AdminSortableTh label="Items" sort-key="itemCount" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <AdminSortableTh label="Total" sort-key="total" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <th class="px-4 py-3">Payment</th>
            <AdminSortableTh label="Status" sort-key="status" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <AdminSortableTh label="Placed" sort-key="placedAt" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
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

    <Pagination :page="page" :total-pages="totalPages" @update:page="page = $event" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const PAGE_SIZE = 10

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

const orderIdFilter = ref('')
const customerFilter = ref('')
const phoneFilter = ref('')
const sortBy = ref('placedAt')
const sortDir = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const orders = ref<AdminOrder[]>([])
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const pending = ref(false)
const error = ref<Error | null>(null)

async function loadOrders() {
  pending.value = true
  error.value = null
  try {
    const data = await $fetch<{ items: AdminOrder[]; total: number }>('/api/admin/orders', {
      headers: authHeaders(),
      query: {
        orderNumber: orderIdFilter.value || undefined,
        q: customerFilter.value || undefined,
        phone: phoneFilter.value || undefined,
        sortBy: sortBy.value,
        sortDir: sortDir.value,
        limit: PAGE_SIZE,
        offset: (page.value - 1) * PAGE_SIZE
      }
    })
    orders.value = data.items
    total.value = data.total
  } catch (err: any) {
    error.value = err
  } finally {
    pending.value = false
  }
}

function setSort(key: string) {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortDir.value = 'asc'
  }
}

onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})
watch(isAuthenticated, value => { if (value) loadOrders() }, { immediate: true })
watch(page, () => { if (isAuthenticated.value) loadOrders() })
watch([orderIdFilter, customerFilter, phoneFilter, sortBy, sortDir], () => {
  page.value = 1
  if (isAuthenticated.value) loadOrders()
})

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
