<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="mb-6 font-display text-2xl font-bold text-gray-900">Add Product</h1>
    <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-card">
      <AdminProductForm mode="create" :submitting="submitting" :error-message="errorMessage" @submit="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductFormPayload } from '~/components/AdminProductForm.vue'

definePageMeta({ layout: 'admin' })

const { isAuthenticated, authHeaders } = useAdminAuth()
// isAuthenticated only becomes true after mount (see useAdminAuth.ts), so this
// must run in onMounted too, not synchronously — otherwise a direct visit/refresh
// with a valid stored token would redirect away before the token even hydrates.
onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})

const submitting = ref(false)
const errorMessage = ref('')

async function handleSubmit(payload: ProductFormPayload) {
  submitting.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/admin/products', {
      method: 'POST',
      headers: authHeaders(),
      body: payload
    })
    await navigateTo('/admin')
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage ?? err?.data?.error ?? 'Failed to create product.'
  } finally {
    submitting.value = false
  }
}
</script>
