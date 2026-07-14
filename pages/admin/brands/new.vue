<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="mb-6 font-display text-2xl font-bold text-gray-900">Add Brand</h1>
    <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-card">
      <AdminBrandForm mode="create" :submitting="submitting" :error-message="errorMessage" @submit="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BrandFormPayload } from '~/components/AdminBrandForm.vue'

definePageMeta({ layout: 'admin' })

const { isAuthenticated, authHeaders } = useAdminAuth()
onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})

const submitting = ref(false)
const errorMessage = ref('')

async function handleSubmit(payload: BrandFormPayload) {
  submitting.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/admin/brands', { method: 'POST', headers: authHeaders(), body: payload })
    await navigateTo('/admin/brands')
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage ?? err?.data?.error ?? 'Failed to create brand.'
  } finally {
    submitting.value = false
  }
}
</script>
