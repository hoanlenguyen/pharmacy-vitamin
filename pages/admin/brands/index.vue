<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="font-display text-2xl font-bold text-gray-900">Brands</h1>
      <NuxtLink
        to="/admin/brands/new"
        class="flex items-center gap-1.5 rounded-full bg-rose-gradient px-5 py-2 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90"
      >
        <Plus class="h-4 w-4" aria-hidden="true" />
        Add Brand
      </NuxtLink>
    </div>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="error" class="text-sm text-red-600">Failed to load brands: {{ error.message }}</p>
    <p v-else-if="brands.length === 0" class="text-sm text-gray-400">No brands yet.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-card">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
          <tr>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Slug</th>
            <th class="px-4 py-3">Products</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="item in brands" :key="item.id">
            <td class="px-4 py-3 font-medium text-gray-800">{{ item.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ item.slug }}</td>
            <td class="px-4 py-3 text-gray-500">{{ item.productCount }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-3">
                <NuxtLink :to="`/admin/brands/${item.slug}/edit`" class="text-gray-400 hover:text-rose-600" aria-label="Edit">
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
    <p v-if="deleteError" class="mt-3 text-sm text-red-600">{{ deleteError }}</p>
  </div>
</template>

<script setup lang="ts">
import { Pencil, Plus, Trash2 } from '@lucide/vue'

definePageMeta({ layout: 'admin' })

type AdminBrand = {
  id: string
  slug: string
  name: string
  description: string | null
  logoUrl: string | null
  productCount: number
}

const { isAuthenticated, authHeaders } = useAdminAuth()

const brands = ref<AdminBrand[]>([])
const pending = ref(false)
const error = ref<Error | null>(null)
const deleteError = ref('')

async function loadBrands() {
  pending.value = true
  error.value = null
  try {
    const data = await $fetch<{ items: AdminBrand[] }>('/api/admin/brands', { headers: authHeaders() })
    brands.value = data.items
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
    await $fetch(`/api/admin/brands/${slug}`, { method: 'DELETE', headers: authHeaders() })
    await loadBrands()
  } catch (err: any) {
    deleteError.value = err?.data?.statusMessage ?? err?.data?.error ?? 'Failed to delete brand.'
  }
}

// See pages/admin/index.vue — isAuthenticated only hydrates post-mount.
onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})
watch(isAuthenticated, value => { if (value) loadBrands() }, { immediate: true })
</script>
