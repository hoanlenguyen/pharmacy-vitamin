<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="mb-6 font-display text-2xl font-bold text-gray-900">Edit Brand</h1>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="!existing" class="text-sm text-red-600">Brand not found.</p>

    <div v-else class="rounded-xl border border-gray-100 bg-white p-6 shadow-card">
      <AdminBrandForm
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
import type { BrandFormPayload } from '~/components/AdminBrandForm.vue'

definePageMeta({ layout: 'admin' })

const { isAuthenticated, authHeaders } = useAdminAuth()

const route = useRoute()
const slug = String(route.params.slug)

type AdminBrand = { slug: string; name: string; description: string | null; logoUrl: string | null }

const existing = ref<AdminBrand | null>(null)
const pending = ref(true)

async function loadBrand() {
  pending.value = true
  try {
    const data = await $fetch<{ items: AdminBrand[] }>('/api/admin/brands', { headers: authHeaders() })
    existing.value = data.items.find(b => b.slug === slug) ?? null
  } finally {
    pending.value = false
  }
}

// isAuthenticated only hydrates post-mount (see composables/useAdminAuth.ts),
// so redirect/load reactively rather than checking once synchronously.
onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})
watch(isAuthenticated, value => { if (value) loadBrand() }, { immediate: true })

const initialValues = computed<Partial<BrandFormPayload>>(() => ({
  slug,
  name: existing.value?.name,
  description: existing.value?.description ?? undefined,
  logoUrl: existing.value?.logoUrl ?? undefined
}))

const submitting = ref(false)
const errorMessage = ref('')

async function handleSubmit(payload: BrandFormPayload) {
  submitting.value = true
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/brands/${slug}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { name: payload.name, description: payload.description || null, logoUrl: payload.logoUrl || null }
    })
    await navigateTo('/admin/brands')
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage ?? err?.data?.error ?? 'Failed to save changes.'
  } finally {
    submitting.value = false
  }
}
</script>
