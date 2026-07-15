<!--
  Admin dashboard: product table with delete + links to create/edit.
  Sign-in lives at pages/admin/login.vue. Supports ?brand=<slug> (set by the
  "Products" link on pages/admin/brands/index.vue) to filter to one brand.
-->
<template>
  <div class="mx-auto max-w-5xl px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="font-display text-2xl font-bold text-gray-900">Products</h1>
      <NuxtLink
        to="/admin/products/new"
        class="flex items-center gap-1.5 rounded-full bg-rose-gradient px-5 py-2 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90"
      >
        <Plus class="h-4 w-4" aria-hidden="true" />
        Add Product
      </NuxtLink>
    </div>

    <div v-if="brandFilter" class="mb-4 flex items-center gap-2">
      <span class="text-sm text-gray-500">Filtered by brand:</span>
      <span class="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-600">
        {{ brandFilterLabel }}
        <NuxtLink to="/admin" aria-label="Clear brand filter" class="text-rose-400 hover:text-rose-600">
          <X class="h-3.5 w-3.5" aria-hidden="true" />
        </NuxtLink>
      </span>
    </div>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="error" class="text-sm text-red-600">Failed to load products: {{ error.message }}</p>
    <p v-else-if="products.length === 0" class="text-sm text-gray-400">No products found.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-card">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
          <tr>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Brand</th>
            <th class="px-4 py-3">Category</th>
            <th class="px-4 py-3">Price</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Sold</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="item in products" :key="item.id">
            <td class="px-4 py-3 font-medium text-gray-800">{{ item.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ item.brandName ?? '—' }}</td>
            <td class="px-4 py-3 text-gray-500">{{ item.primaryCategory ?? '—' }}</td>
            <td class="px-4 py-3 text-gray-700">{{ formatCurrency(item.price) }}</td>
            <td class="px-4 py-3">
              <StatusBadge :status="item.status" />
            </td>
            <td class="px-4 py-3 text-gray-500">{{ item.soldCount }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-3">
                <NuxtLink :to="`/admin/products/${item.slug}/edit`" class="text-gray-400 hover:text-rose-600" aria-label="Edit">
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
  </div>
</template>

<script setup lang="ts">
import { Pencil, Plus, Trash2, X } from '@lucide/vue'

definePageMeta({ layout: 'admin' })

type AdminProduct = {
  id: string
  slug: string
  name: string
  price: number
  compareAtPrice: number | null
  status: 'draft' | 'active' | 'archived'
  soldCount: number
  brandName: string | null
  brandSlug: string | null
  primaryCategory: string | null
}

const { isAuthenticated, authHeaders } = useAdminAuth()
const route = useRoute()

const brandFilter = computed(() => (typeof route.query.brand === 'string' ? route.query.brand : undefined))
// Prefer the loaded rows' brand name (readable); fall back to the raw slug
// if the filter matched nothing (e.g. a brand with no products left).
const brandFilterLabel = computed(() => products.value.find(p => p.brandSlug === brandFilter.value)?.brandName ?? brandFilter.value)

const products = ref<AdminProduct[]>([])
const pending = ref(false)
const error = ref<Error | null>(null)

async function loadProducts() {
  pending.value = true
  error.value = null
  try {
    const data = await $fetch<{ items: AdminProduct[] }>('/api/admin/products', {
      headers: authHeaders(),
      query: brandFilter.value ? { brand: brandFilter.value } : undefined
    })
    products.value = data.items
  } catch (err: any) {
    error.value = err
  } finally {
    pending.value = false
  }
}

async function handleDelete(slug: string) {
  if (!confirm(`Delete "${slug}"? This can't be undone.`)) return
  await $fetch(`/api/admin/products/${slug}`, { method: 'DELETE', headers: authHeaders() })
  await loadProducts()
}

// isAuthenticated only becomes true after mount (see useAdminAuth.ts's hydration
// note), so redirect/load reactively rather than checking once synchronously here —
// otherwise a page refresh with an already-valid session token would misfire.
onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})
watch(isAuthenticated, value => { if (value) loadProducts() }, { immediate: true })
watch(brandFilter, () => { if (isAuthenticated.value) loadProducts() })

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}
</script>
