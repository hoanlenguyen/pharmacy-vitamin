<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="font-display text-2xl font-bold text-gray-900">Categories</h1>
      <NuxtLink
        to="/admin/categories/new"
        class="flex items-center gap-1.5 rounded-full bg-rose-gradient px-5 py-2 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90"
      >
        <Plus class="h-4 w-4" aria-hidden="true" />
        Add Category
      </NuxtLink>
    </div>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="error" class="text-sm text-red-600">Failed to load categories: {{ error.message }}</p>
    <p v-else-if="tree.length === 0" class="text-sm text-gray-400">No categories yet.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-card">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
          <tr>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Slug</th>
            <th class="px-4 py-3">Products</th>
            <th class="px-4 py-3">Menu</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="item in tree" :key="item.id">
            <td class="px-4 py-3 font-medium text-gray-800">
              <span :style="{ paddingLeft: `${item.depth * 20}px` }" class="flex items-center gap-1.5">
                <CornerDownRight v-if="item.depth > 0" class="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden="true" />
                {{ item.name }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ item.slug }}</td>
            <td class="px-4 py-3 text-gray-500">{{ item.productCount }}</td>
            <td class="px-4 py-3">
              <button
                type="button"
                class="flex items-center gap-1.5 text-xs font-medium"
                :class="item.showInMenu ? 'text-emerald-600 hover:text-emerald-700' : 'text-gray-400 hover:text-gray-600'"
                :aria-label="item.showInMenu ? `Hide ${item.name} from menu` : `Show ${item.name} in menu`"
                :disabled="togglingSlug === item.slug"
                @click="toggleShowInMenu(item)"
              >
                <Eye v-if="item.showInMenu" class="h-4 w-4" aria-hidden="true" />
                <EyeOff v-else class="h-4 w-4" aria-hidden="true" />
                {{ item.showInMenu ? 'Visible' : 'Hidden' }}
              </button>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-3">
                <NuxtLink :to="`/admin/categories/${item.slug}/edit`" class="text-gray-400 hover:text-rose-600" aria-label="Edit">
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
import { CornerDownRight, Eye, EyeOff, Pencil, Plus, Trash2 } from '@lucide/vue'

definePageMeta({ layout: 'admin' })

type AdminCategory = {
  id: string
  slug: string
  name: string
  description: string | null
  sortOrder: number
  parentSlug: string | null
  productCount: number
  childCount: number
  showInMenu: 0 | 1
}
type TreeRow = AdminCategory & { depth: number }

const { isAuthenticated, authHeaders } = useAdminAuth()

const categories = ref<AdminCategory[]>([])
const pending = ref(false)
const error = ref<Error | null>(null)
const deleteError = ref('')
const togglingSlug = ref<string | null>(null)

async function toggleShowInMenu(item: AdminCategory) {
  togglingSlug.value = item.slug
  try {
    await $fetch(`/api/admin/categories/${item.slug}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { showInMenu: !item.showInMenu }
    })
    item.showInMenu = item.showInMenu ? 0 : 1
  } catch (err: any) {
    deleteError.value = err?.data?.statusMessage ?? err?.data?.error ?? 'Failed to update menu visibility.'
  } finally {
    togglingSlug.value = null
  }
}

async function loadCategories() {
  pending.value = true
  error.value = null
  try {
    const data = await $fetch<{ items: AdminCategory[] }>('/api/admin/categories', { headers: authHeaders() })
    categories.value = data.items
  } catch (err: any) {
    error.value = err
  } finally {
    pending.value = false
  }
}

// Flat list -> depth-first tree order, so children render indented under their parent.
const tree = computed<TreeRow[]>(() => {
  const childrenOf = (parentSlug: string | null) =>
    categories.value.filter(c => c.parentSlug === parentSlug).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))

  const rows: TreeRow[] = []
  function walk(parentSlug: string | null, depth: number) {
    for (const cat of childrenOf(parentSlug)) {
      rows.push({ ...cat, depth })
      walk(cat.slug, depth + 1)
    }
  }
  walk(null, 0)

  // Fallback: include anything walk() missed (e.g. a dangling parentSlug), flat.
  for (const cat of categories.value) {
    if (!rows.some(r => r.slug === cat.slug)) rows.push({ ...cat, depth: 0 })
  }
  return rows
})

async function handleDelete(slug: string) {
  if (!confirm(`Delete "${slug}"? This can't be undone.`)) return
  deleteError.value = ''
  try {
    await $fetch(`/api/admin/categories/${slug}`, { method: 'DELETE', headers: authHeaders() })
    await loadCategories()
  } catch (err: any) {
    deleteError.value = err?.data?.statusMessage ?? err?.data?.error ?? 'Failed to delete category.'
  }
}

onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})
watch(isAuthenticated, value => { if (value) loadCategories() }, { immediate: true })
</script>
