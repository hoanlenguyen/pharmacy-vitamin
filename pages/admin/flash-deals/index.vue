<!--
  Admin > Flash Deals — curate which existing products show up on the storefront's
  /flash-deals page. Flash Deals has no data of its own; it's a boolean flag on products
  (products.is_flash_deal), toggled per row here (same pattern as Categories' Visible/Hidden).
-->
<template>
  <div class="mx-auto max-w-5xl px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="font-display text-2xl font-bold text-gray-900">Flash Deals</h1>
    </div>
    <p class="mb-6 text-sm text-gray-500">
      Toggle which products appear on the storefront's <NuxtLink to="/flash-deals" class="text-rose-600 hover:underline">Flash Deals</NuxtLink> page.
    </p>

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <AdminSearchInput v-model="search" placeholder="Search products by name…" />
      <label class="flex items-center gap-2 text-sm text-gray-600">
        <input v-model="onlyFlashDeals" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400" />
        Only show current Flash Deals
      </label>
    </div>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="error" class="text-sm text-red-600">Failed to load products: {{ error.message }}</p>
    <p v-else-if="products.length === 0" class="text-sm text-gray-400">No products match.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-card">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
          <tr>
            <AdminSortableTh label="Name" sort-key="name" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <AdminSortableTh label="Price" sort-key="price" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <AdminSortableTh label="Status" sort-key="status" :active-sort-by="sortBy" :active-sort-dir="sortDir" @sort="setSort" />
            <th class="px-4 py-3">Flash Deal</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="item in products" :key="item.id">
            <td class="px-4 py-3 font-medium text-gray-800">{{ item.name }}</td>
            <td class="px-4 py-3 text-gray-700">{{ formatCurrency(item.price) }}</td>
            <td class="px-4 py-3">
              <StatusBadge :status="item.status" />
            </td>
            <td class="px-4 py-3">
              <button
                type="button"
                class="flex items-center gap-1.5 text-xs font-medium"
                :class="item.isFlashDeal ? 'text-emerald-600 hover:text-emerald-700' : 'text-gray-400 hover:text-gray-600'"
                :aria-label="item.isFlashDeal ? `Remove ${item.name} from Flash Deals` : `Add ${item.name} to Flash Deals`"
                :disabled="togglingSlug === item.slug"
                @click="toggleFlashDeal(item)"
              >
                <Zap v-if="item.isFlashDeal" class="h-4 w-4" aria-hidden="true" />
                <ZapOff v-else class="h-4 w-4" aria-hidden="true" />
                {{ item.isFlashDeal ? 'On' : 'Off' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :page="page" :total-pages="totalPages" @update:page="page = $event" />
    <p v-if="toggleError" class="mt-3 text-sm text-red-600">{{ toggleError }}</p>
  </div>
</template>

<script setup lang="ts">
import { Zap, ZapOff } from '@lucide/vue'

definePageMeta({ layout: 'admin' })

const PAGE_SIZE = 10

type AdminProduct = {
  id: string
  slug: string
  name: string
  price: number
  status: 'draft' | 'active' | 'archived'
  isFlashDeal: 0 | 1
}

const { isAuthenticated, authHeaders } = useAdminAuth()

const search = ref('')
const onlyFlashDeals = ref(false)
const sortBy = ref('name')
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(1)
const products = ref<AdminProduct[]>([])
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const pending = ref(false)
const error = ref<Error | null>(null)
const togglingSlug = ref<string | null>(null)
const toggleError = ref('')

async function loadProducts() {
  pending.value = true
  error.value = null
  try {
    const data = await $fetch<{ items: AdminProduct[]; total: number }>('/api/admin/products', {
      headers: authHeaders(),
      query: {
        q: search.value || undefined,
        flashDeal: onlyFlashDeals.value ? 'true' : undefined,
        sortBy: sortBy.value,
        sortDir: sortDir.value,
        limit: PAGE_SIZE,
        offset: (page.value - 1) * PAGE_SIZE
      }
    })
    products.value = data.items
    total.value = data.total
  } catch (err: any) {
    error.value = err
  } finally {
    pending.value = false
  }
}

async function toggleFlashDeal(item: AdminProduct) {
  togglingSlug.value = item.slug
  toggleError.value = ''
  try {
    await $fetch(`/api/admin/products/${item.slug}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { isFlashDeal: !item.isFlashDeal }
    })
    item.isFlashDeal = item.isFlashDeal ? 0 : 1
    if (onlyFlashDeals.value && !item.isFlashDeal) {
      products.value = products.value.filter(p => p.slug !== item.slug)
    }
  } catch (err: any) {
    toggleError.value = err?.data?.statusMessage ?? err?.data?.error ?? 'Failed to update Flash Deal status.'
  } finally {
    togglingSlug.value = null
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
watch(isAuthenticated, value => { if (value) loadProducts() }, { immediate: true })
watch(page, () => { if (isAuthenticated.value) loadProducts() })
// A changed search/filter/sort invalidates whatever page you were on, so jump back to
// page 1 rather than risk landing past the end of the new result set.
watch([search, onlyFlashDeals, sortBy, sortDir], () => {
  page.value = 1
  if (isAuthenticated.value) loadProducts()
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}
</script>
