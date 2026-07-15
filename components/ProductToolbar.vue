<!--
  Toolbar above a product grid — sort, results-per-page, grid/list toggle, and a compact
  "page X of Y" pager. Mirrors the toolbar row on mint07.com/shop/'s archive pages.
-->
<template>
  <div class="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-card">
    <div class="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Grid view"
        :aria-pressed="view === 'grid'"
        class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
        :class="view === 'grid' ? 'bg-rose-100 text-rose-600' : 'text-gray-400 hover:text-rose-500'"
        @click="$emit('update:view', 'grid')"
      >
        <LayoutGrid class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="List view"
        :aria-pressed="view === 'list'"
        class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
        :class="view === 'list' ? 'bg-rose-100 text-rose-600' : 'text-gray-400 hover:text-rose-500'"
        @click="$emit('update:view', 'list')"
      >
        <ListIcon class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>

    <div class="flex flex-1 flex-wrap items-center justify-end gap-3">
      <label class="flex items-center gap-1.5 text-xs text-gray-500">
        <select
          :value="sort"
          aria-label="Sort products"
          class="rounded-full border border-gray-300 bg-gray-50 py-1.5 pl-3 pr-7 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-400"
          @change="$emit('update:sort', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Relevance</option>
          <option value="sold">Best Selling</option>
          <option value="discount">Biggest Discount</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </label>

      <label class="flex items-center gap-1.5 text-xs text-gray-500">
        Show
        <select
          :value="perPage"
          aria-label="Results per page"
          class="rounded-full border border-gray-300 bg-gray-50 py-1.5 pl-3 pr-7 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-400"
          @change="$emit('update:perPage', Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </label>

      <div class="flex items-center gap-1.5 text-xs text-gray-500">
        <span>{{ page }} of {{ totalPages }}</span>
        <button
          type="button"
          aria-label="Next page"
          :disabled="page >= totalPages"
          class="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
          @click="$emit('update:page', page + 1)"
        >
          <ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, LayoutGrid, List as ListIcon } from '@lucide/vue'

defineProps<{
  sort: string
  perPage: number
  view: 'grid' | 'list'
  page: number
  totalPages: number
}>()

defineEmits<{
  'update:sort': [sort: string]
  'update:perPage': [perPage: number]
  'update:view': [view: 'grid' | 'list']
  'update:page': [page: number]
}>()

const perPageOptions = [16, 32, 48]
</script>
