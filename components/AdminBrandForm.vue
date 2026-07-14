<!--
  Shared create/edit form for admin brands — used by pages/admin/brands/new.vue
  and pages/admin/brands/[slug]/edit.vue.
-->
<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <label class="block">
        <span class="text-xs font-medium text-gray-600">Slug{{ mode === 'create' ? ' *' : '' }}</span>
        <input
          v-model="form.slug"
          type="text"
          :disabled="mode === 'edit'"
          required
          placeholder="e.g. caryophy"
          class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:bg-gray-100 disabled:text-gray-400"
        />
      </label>

      <label class="block">
        <span class="text-xs font-medium text-gray-600">Name *</span>
        <input
          v-model="form.name"
          type="text"
          required
          class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </label>

      <label class="block sm:col-span-2">
        <span class="text-xs font-medium text-gray-600">Logo URL</span>
        <input
          v-model="form.logoUrl"
          type="text"
          placeholder="https://…"
          class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </label>
    </div>

    <label class="block">
      <span class="text-xs font-medium text-gray-600">Description</span>
      <textarea
        v-model="form.description"
        rows="3"
        class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
      />
    </label>

    <div class="flex items-center gap-3 border-t border-gray-100 pt-5">
      <button
        type="submit"
        :disabled="submitting"
        class="flex items-center gap-2 rounded-full bg-rose-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" aria-hidden="true" />
        {{ mode === 'create' ? 'Create Brand' : 'Save Changes' }}
      </button>
      <NuxtLink to="/admin/brands" class="text-sm font-medium text-gray-500 hover:text-rose-600">Cancel</NuxtLink>
      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { Loader2 } from '@lucide/vue'

export type BrandFormPayload = {
  slug?: string
  name: string
  description?: string
  logoUrl?: string
}

const props = defineProps<{
  mode: 'create' | 'edit'
  initial?: Partial<BrandFormPayload>
  submitting?: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{ submit: [payload: BrandFormPayload] }>()

const form = reactive<BrandFormPayload>({
  slug: props.initial?.slug ?? '',
  name: props.initial?.name ?? '',
  description: props.initial?.description ?? '',
  logoUrl: props.initial?.logoUrl ?? ''
})

function handleSubmit() {
  emit('submit', { ...form })
}
</script>
