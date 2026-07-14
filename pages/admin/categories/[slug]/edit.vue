<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="mb-6 font-display text-2xl font-bold text-gray-900">Edit Category</h1>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="!existing" class="text-sm text-red-600">Category not found.</p>

    <div v-else class="rounded-xl border border-gray-100 bg-white p-6 shadow-card">
      <AdminCategoryForm
        mode="edit"
        :initial="initialValues"
        :submitting="submitting"
        :error-message="errorMessage"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryFormPayload } from '~/components/AdminCategoryForm.vue'

definePageMeta({ layout: 'admin' })

const { isAuthenticated, authHeaders } = useAdminAuth()

const route = useRoute()
const slug = String(route.params.slug)

type AdminCategory = {
  slug: string
  name: string
  description: string | null
  sortOrder: number
  parentSlug: string | null
}

const existing = ref<AdminCategory | null>(null)
const pending = ref(true)

async function loadCategory() {
  pending.value = true
  try {
    const data = await $fetch<{ items: AdminCategory[] }>('/api/admin/categories', { headers: authHeaders() })
    existing.value = data.items.find(c => c.slug === slug) ?? null
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})
watch(isAuthenticated, value => { if (value) loadCategory() }, { immediate: true })

const initialValues = computed<Partial<CategoryFormPayload>>(() => ({
  slug,
  name: existing.value?.name,
  parentSlug: existing.value?.parentSlug ?? undefined,
  description: existing.value?.description ?? undefined,
  sortOrder: existing.value?.sortOrder ?? 0
}))

const submitting = ref(false)
const errorMessage = ref('')

async function handleSubmit(payload: CategoryFormPayload) {
  submitting.value = true
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/categories/${slug}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: {
        name: payload.name,
        parentSlug: payload.parentSlug ?? null,
        description: payload.description || null,
        sortOrder: payload.sortOrder
      }
    })
    await navigateTo('/admin/categories')
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage ?? err?.data?.error ?? 'Failed to save changes.'
  } finally {
    submitting.value = false
  }
}
</script>
