<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="font-display text-2xl font-bold text-gray-900">Combos</h1>
      <NuxtLink
        to="/admin/combos/new"
        class="flex items-center gap-1.5 rounded-full bg-rose-gradient px-5 py-2 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90"
      >
        <Plus class="h-4 w-4" aria-hidden="true" />
        Add Combo
      </NuxtLink>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <AdminSearchInput v-model="nameFilter" placeholder="Search combos by name…" />
    </div>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="error" class="text-sm text-red-600">Failed to load combos: {{ error.message }}</p>
    <p v-else-if="combos.length === 0" class="text-sm text-gray-400">No combos yet.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-card">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
          <tr>
            <AdminSortableTh label="Name" sort-key="name" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <AdminSortableTh label="Slug" sort-key="slug" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <AdminSortableTh label="Price" sort-key="price" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <AdminSortableTh label="Products" sort-key="itemCount" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <AdminSortableTh label="Status" sort-key="status" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="item in combos" :key="item.id">
            <td class="px-4 py-3 font-medium text-gray-800">{{ item.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ item.slug }}</td>
            <td class="px-4 py-3 text-gray-700">{{ formatCurrency(item.price) }}</td>
            <td class="px-4 py-3 text-gray-500">{{ item.itemCount }}</td>
            <td class="px-4 py-3">
              <StatusBadge :status="item.status" />
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-3">
                <NuxtLink :to="`/admin/combos/${item.slug}/edit`" class="text-gray-400 hover:text-rose-600" aria-label="Edit">
                  <Pencil class="h-4 w-4" aria-hidden="true" />
                </NuxtLink>
                <button type="button" class="text-gray-400 hover:text-red-600" aria-label="Delete" @click="handleDelete(item.slug)">
                  <Trash2 class="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :page="page" :total-pages="totalPages" @update:page="page = $event" />
    <p v-if="deleteError" class="mt-3 text-sm text-red-600">{{ deleteError }}</p>
  </div>
</template>

<script setup lang="ts">
import { Pencil, Plus, Trash2 } from '@lucide/vue'

definePageMeta({ layout: 'admin' })

const PAGE_SIZE = 10

type AdminCombo = {
  id: string
  slug: string
  name: string
  price: number
  compareAtPrice: number | null
  status: 'active' | 'draft' | 'archived'
  sortOrder: number
  itemCount: number
}

const { isAuthenticated, authHeaders } = useAdminAuth()

const nameFilter = ref('')
const sortBy = ref('name')
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(1)
const combos = ref<AdminCombo[]>([])
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const pending = ref(false)
const error = ref<Error | null>(null)
const deleteError = ref('')

async function loadCombos() {
  pending.value = true
  error.value = null
  try {
    const data = await $fetch<{ items: AdminCombo[]; total: number }>('/api/admin/combos', {
      headers: authHeaders(),
      query: {
        q: nameFilter.value || undefined,
        sortBy: sortBy.value,
        sortDir: sortDir.value,
        limit: PAGE_SIZE,
        offset: (page.value - 1) * PAGE_SIZE
      }
    })
    combos.value = data.items
    total.value = data.total
  } catch (err: any) {
    error.value = err
  } finally {
    pending.value = false
  }
}

async function handleDelete(slug: string) {
  if (!confirm(`Delete "${slug}"? This can't be undone.`)) return
  deleteError.value = ''
  try {
    await $fetch(`/api/admin/combos/${slug}`, { method: 'DELETE', headers: authHeaders() })
    await loadCombos()
  } catch (err: any) {
    deleteError.value = err?.data?.statusMessage ?? err?.data?.error ?? 'Failed to delete combo.'
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
watch(isAuthenticated, value => { if (value) loadCombos() }, { immediate: true })
watch(page, () => { if (isAuthenticated.value) loadCombos() })
watch([nameFilter, sortBy, sortDir], () => {
  page.value = 1
  if (isAuthenticated.value) loadCombos()
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}
</script>
