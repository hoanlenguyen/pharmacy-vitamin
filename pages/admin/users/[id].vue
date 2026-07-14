<template>
  <div class="mx-auto max-w-3xl">
    <NuxtLink to="/admin/users" class="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600">
      <ArrowLeft class="h-3.5 w-3.5" aria-hidden="true" />
      Back to Users
    </NuxtLink>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="!user" class="text-sm text-red-600">User not found.</p>

    <div v-else class="space-y-6">
      <h1 class="font-display text-2xl font-bold text-gray-900">{{ user.name }}</h1>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-card">
          <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Contact</h2>
          <p class="text-sm text-gray-700">{{ user.email }}</p>
          <p class="text-sm text-gray-500">{{ user.phone }}</p>
          <p class="mt-2 text-xs text-gray-400">Joined {{ formatDate(user.createdAt) }}</p>
        </div>

        <div v-if="user.addresses.length" class="rounded-xl border border-gray-100 bg-white p-5 shadow-card">
          <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Address</h2>
          <p class="font-medium text-gray-800">{{ user.addresses[0].recipientName }}</p>
          <p class="text-sm text-gray-500">{{ user.addresses[0].phone }}</p>
          <p class="text-sm text-gray-500">
            {{ [user.addresses[0].line1, user.addresses[0].city, user.addresses[0].country].filter(Boolean).join(', ') }}
          </p>
        </div>
      </div>

      <div>
        <h2 class="mb-3 font-display text-sm font-bold text-gray-900">Order History</h2>
        <p v-if="user.orders.length === 0" class="text-sm text-gray-400">No orders yet.</p>
        <div v-else class="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-card">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th class="px-4 py-3">Order #</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Total</th>
                <th class="px-4 py-3">Placed</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="o in user.orders"
                :key="o.id"
                class="cursor-pointer hover:bg-rose-50/40"
                @click="navigateTo(`/admin/orders/${encodeURIComponent(o.id)}`)"
              >
                <td class="px-4 py-3 font-medium text-gray-800">{{ o.orderNumber }}</td>
                <td class="px-4 py-3"><StatusBadge :status="o.status" /></td>
                <td class="px-4 py-3 text-gray-700">{{ formatCurrency(o.total) }}</td>
                <td class="px-4 py-3 text-gray-500">{{ formatDate(o.placedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'

definePageMeta({ layout: 'admin' })

type UserDetail = {
  id: string
  email: string
  name: string
  phone: string
  createdAt: string
  addresses: { recipientName: string; phone: string; line1: string; city: string; country: string }[]
  orders: { id: string; orderNumber: string; status: string; total: number; placedAt: string }[]
}

const { isAuthenticated, authHeaders } = useAdminAuth()
const route = useRoute()
const id = String(route.params.id)

const user = ref<UserDetail | null>(null)
const pending = ref(true)

async function loadUser() {
  pending.value = true
  try {
    user.value = await $fetch<UserDetail>(`/api/admin/users/${encodeURIComponent(id)}`, { headers: authHeaders() })
  } catch {
    user.value = null
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})
watch(isAuthenticated, value => { if (value) loadUser() }, { immediate: true })

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}
function formatDate(value: string) {
  return new Date(value.replace(' ', 'T')).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>
