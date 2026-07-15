<template>
  <div>
    <h1 class="mb-6 font-display text-2xl font-bold text-gray-900">Users</h1>

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <AdminSearchInput v-model="nameFilter" placeholder="Search users by name…" />
      <AdminSearchInput v-model="emailFilter" placeholder="Search by email…" />
      <AdminSearchInput v-model="phoneFilter" placeholder="Search by phone number…" />
    </div>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="error" class="text-sm text-red-600">Failed to load users: {{ error.message }}</p>
    <p v-else-if="users.length === 0" class="text-sm text-gray-400">No users yet.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-card">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
          <tr>
            <AdminSortableTh label="Name" sort-key="name" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <AdminSortableTh label="Email" sort-key="email" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <th class="px-4 py-3">Phone</th>
            <AdminSortableTh label="Orders" sort-key="orderCount" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <AdminSortableTh label="Total Spent" sort-key="totalSpent" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
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

    <Pagination :page="page" :total-pages="totalPages" @update:page="page = $event" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const PAGE_SIZE = 10

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

const nameFilter = ref('')
const emailFilter = ref('')
const phoneFilter = ref('')
const sortBy = ref('createdAt')
const sortDir = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const users = ref<AdminUser[]>([])
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const pending = ref(false)
const error = ref<Error | null>(null)

async function loadUsers() {
  pending.value = true
  error.value = null
  try {
    const data = await $fetch<{ items: AdminUser[]; total: number }>('/api/admin/users', {
      headers: authHeaders(),
      query: {
        q: nameFilter.value || undefined,
        email: emailFilter.value || undefined,
        phone: phoneFilter.value || undefined,
        sortBy: sortBy.value,
        sortDir: sortDir.value,
        limit: PAGE_SIZE,
        offset: (page.value - 1) * PAGE_SIZE
      }
    })
    users.value = data.items
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
watch(isAuthenticated, value => { if (value) loadUsers() }, { immediate: true })
watch(page, () => { if (isAuthenticated.value) loadUsers() })
watch([nameFilter, emailFilter, phoneFilter, sortBy, sortDir], () => {
  page.value = 1
  if (isAuthenticated.value) loadUsers()
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}
</script>
