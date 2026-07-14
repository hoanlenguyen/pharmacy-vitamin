<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="mb-6 font-display text-2xl font-bold text-gray-900">Add Category</h1>
    <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-card">
      <AdminCategoryForm mode="create" :submitting="submitting" :error-message="errorMessage" @submit="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryFormPayload } from '~/components/AdminCategoryForm.vue'

definePageMeta({ layout: 'admin' })

const { isAuthenticated, authHeaders } = useAdminAuth()
onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})

const submitting = ref(false)
const errorMessage = ref('')

async function handleSubmit(payload: CategoryFormPayload) {
  submitting.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/admin/categories', { method: 'POST', headers: authHeaders(), body: payload })
    await navigateTo('/admin/categories')
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage ?? err?.data?.error ?? 'Failed to create category.'
  } finally {
    submitting.value = false
  }
}
</script>
