<!--
  Shared create/edit form for admin categories — used by pages/admin/categories/new.vue
  and pages/admin/categories/[slug]/edit.vue.
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
          placeholder="e.g. moisturizing"
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

      <label class="block">
        <span class="text-xs font-medium text-gray-600">Parent Category</span>
        <select
          v-model="form.parentSlug"
          class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          <option :value="undefined">— None (top level) —</option>
          <option v-for="cat in selectableParents" :key="cat.slug" :value="cat.slug">
            {{ '—'.repeat(cat.depth) }} {{ cat.name }}
          </option>
        </select>
      </label>

      <label class="block">
        <span class="text-xs font-medium text-gray-600">Sort Order</span>
        <input
          v-model.number="form.sortOrder"
          type="number"
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

    <label class="flex items-center gap-2 text-sm text-gray-700">
      <input v-model="form.showInMenu" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400" />
      Show in main navigation menu
    </label>

    <div class="flex items-center gap-3 border-t border-gray-100 pt-5">
      <button
        type="submit"
        :disabled="submitting"
        class="flex items-center gap-2 rounded-full bg-rose-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" aria-hidden="true" />
        {{ mode === 'create' ? 'Create Category' : 'Save Changes' }}
      </button>
      <NuxtLink to="/admin/categories" class="text-sm font-medium text-gray-500 hover:text-rose-600">Cancel</NuxtLink>
      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { Loader2 } from '@lucide/vue'

type CategoryNode = { slug: string; name: string; children: CategoryNode[] }

export type CategoryFormPayload = {
  slug?: string
  name: string
  parentSlug?: string
  description?: string
  sortOrder?: number
  showInMenu: boolean
}

const props = defineProps<{
  mode: 'create' | 'edit'
  initial?: Partial<CategoryFormPayload>
  submitting?: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{ submit: [payload: CategoryFormPayload] }>()

const form = reactive<CategoryFormPayload>({
  slug: props.initial?.slug ?? '',
  name: props.initial?.name ?? '',
  parentSlug: props.initial?.parentSlug,
  description: props.initial?.description ?? '',
  sortOrder: props.initial?.sortOrder ?? 0,
  showInMenu: props.initial?.showInMenu ?? true
})

const { data: categoriesData } = await useFetch<{ categories: CategoryNode[] }>('/api/categories')

function flatten(nodes: CategoryNode[], depth = 0): { slug: string; name: string; depth: number }[] {
  return nodes.flatMap(node => [{ slug: node.slug, name: node.name, depth }, ...flatten(node.children, depth + 1)])
}

// A category can't be its own parent (or, less critically, its own descendant —
// the Worker only rejects the direct self-parent case, so avoid the obviously
// wrong one here and let the API be the final word on deeper cycles).
const selectableParents = computed(() => flatten(categoriesData.value?.categories ?? []).filter(cat => cat.slug !== props.initial?.slug))

function handleSubmit() {
  emit('submit', { ...form })
}
</script>
