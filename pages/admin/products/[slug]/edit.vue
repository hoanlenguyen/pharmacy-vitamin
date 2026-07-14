<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="mb-6 font-display text-2xl font-bold text-gray-900">Edit Product</h1>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="!existing" class="text-sm text-red-600">Product not found.</p>

    <div v-else class="rounded-xl border border-gray-100 bg-white p-6 shadow-card">
      <AdminProductForm
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
import type { ProductFormPayload } from '~/components/AdminProductForm.vue'

definePageMeta({ layout: 'admin' })

const { isAuthenticated, authHeaders } = useAdminAuth()
// See pages/admin/products/new.vue — isAuthenticated only hydrates post-mount.
onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})

const route = useRoute()
const slug = String(route.params.slug)

// Public detail endpoint already has everything the edit form needs to prefill.
const { data: existing, pending } = await useFetch<{
  name: string
  price: number
  originalPrice?: number
  sku?: string
  summary?: string
  images: { url: string; alt: string }[]
}>(`/api/products/${slug}`)

const initialValues = computed<Partial<ProductFormPayload>>(() => ({
  slug,
  name: existing.value?.name,
  price: existing.value?.price,
  compareAtPrice: existing.value?.originalPrice,
  sku: existing.value?.sku,
  summary: existing.value?.summary,
  imageUrl: existing.value?.images?.[0]?.url,
  status: 'active'
}))

const submitting = ref(false)
const errorMessage = ref('')

async function handleSubmit(payload: ProductFormPayload) {
  submitting.value = true
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/products/${slug}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: {
        name: payload.name,
        price: payload.price,
        compareAtPrice: payload.compareAtPrice ?? null,
        sku: payload.sku || null,
        summary: payload.summary || null,
        status: payload.status,
        imageUrl: payload.imageUrl || undefined
      }
    })
    await navigateTo('/admin')
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage ?? err?.data?.error ?? 'Failed to save changes.'
  } finally {
    submitting.value = false
  }
}
</script>
