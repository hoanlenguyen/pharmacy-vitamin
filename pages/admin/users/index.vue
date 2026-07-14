<template>
  <div>
    <h1 class="mb-6 font-display text-2xl font-bold text-gray-900">Users</h1>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="error" class="text-sm text-red-600">Failed to load users: {{ error.message }}</p>
    <p v-else-if="users.length === 0" class="text-sm text-gray-400">No users yet.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-card">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
          <tr>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Phone</th>
            <th class="px-4 py-3">Orders</th>
            <th class="px-4 py-3">Total Spent</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="item in users"
            :key="item.id"
            class="cursor-pointer hover:bg-rose-50/40"
            @click="navigateTo(`/admin/users/${encodeURIComponent(item.id)}`)"
          >
            <td class="px-4 py-3 font-medium text-gray-800">{{ item.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ item.email }}</td>
            <td class="px-4 py-3 text-gray-500">{{ item.phone }}</td>
            <td class="px-4 py-3 text-gray-500">{{ item.orderCount }}</td>
            <td class="px-4 py-3 text-gray-700">{{ formatCurrency(item.totalSpent) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type AdminUser = {
  id: string
  email: string
  name: string
  phone: string
  createdAt: string
  orderCount: number
  totalSpent: number
}

const { isAuthenticated, authHeaders } = useAdminAuth()

const users = ref<AdminUser[]>([])
const pending = ref(false)
const error = ref<Error | null>(null)

async function loadUsers() {
  pending.value = true
  error.value = null
  try {
    const data = await $fetch<{ items: AdminUser[] }>('/api/admin/users', { headers: authHeaders() })
    users.value = data.items
  } catch (err: any) {
    error.value = err
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})
watch(isAuthenticated, value => { if (value) loadUsers() }, { immediate: true })

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}
</script>
