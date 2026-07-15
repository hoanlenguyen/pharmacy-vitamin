<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="mb-6 font-display text-2xl font-bold text-gray-900">Edit Combo</h1>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="!existing" class="text-sm text-red-600">Combo not found.</p>

    <div v-else class="rounded-xl border border-gray-100 bg-white p-6 shadow-card">
      <AdminComboForm
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
import type { ComboFormPayload } from '~/components/AdminComboForm.vue'

definePageMeta({ layout: 'admin' })

const { isAuthenticated, authHeaders } = useAdminAuth()
const route = useRoute()
const slug = String(route.params.slug)

type AdminComboDetail = {
  slug: string
  name: string
  description: string | null
  price: number
  compareAtPrice: number | null
  status: 'active' | 'draft' | 'archived'
  sortOrder: number
  items: { productSlug: string; productName: string; quantity: number }[]
}

const existing = ref<AdminComboDetail | null>(null)
const pending = ref(true)

async function loadCombo() {
  pending.value = true
  try {
    existing.value = await $fetch<AdminComboDetail>(`/api/admin/combos/${slug}`, { headers: authHeaders() })
  } catch {
    existing.value = null
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  if (!isAuthenticated.value) navigateTo('/admin/login')
})
watch(isAuthenticated, value => { if (value) loadCombo() }, { immediate: true })

const initialValues = computed<Partial<ComboFormPayload> & { items?: { productSlug: string; productName: string; quantity: number }[] }>(() => ({
  slug,
  name: existing.value?.name ?? '',
  description: existing.value?.description ?? undefined,
  price: existing.value?.price ?? 0,
  compareAtPrice: existing.value?.compareAtPrice ?? undefined,
  status: existing.value?.status ?? 'active',
  sortOrder: existing.value?.sortOrder ?? 0,
  items: existing.value?.items ?? []
}))

const submitting = ref(false)
const errorMessage = ref('')

async function handleSubmit(payload: ComboFormPayload) {
  submitting.value = true
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/combos/${slug}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: {
        name: payload.name,
        description: payload.description || null,
        price: payload.price,
        compareAtPrice: payload.compareAtPrice ?? null,
        status: payload.status,
        sortOrder: payload.sortOrder,
        items: payload.items
      }
    })
    await navigateTo('/admin/combos')
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage ?? err?.data?.error ?? 'Failed to save changes.'
  } finally {
    submitting.value = false
  }
}
</script>
