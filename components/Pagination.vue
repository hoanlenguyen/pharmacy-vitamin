<!--
  Reusable prev/next + page-number pager for product listings (category, brand,
  search results) — mirrors mint07.com/shop/'s numbered pager pattern.
  Emits page changes; the parent owns the actual page state (usually synced to
  a route query param so pages are linkable/shareable).
-->
<template>
  <nav v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
    <button
      type="button"
      :disabled="page <= 1"
      aria-label="Previous page"
      class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
      @click="$emit('update:page', page - 1)"
    >
      <ChevronLeft class="h-4 w-4" aria-hidden="true" />
    </button>

    <template v-for="item in pageItems" :key="item.key">
      <span v-if="item.type === 'ellipsis'" class="px-2 text-sm text-gray-400">…</span>
      <button
        v-else
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors"
        :class="item.value === page ? 'bg-rose-gradient text-white' : 'text-gray-600 hover:bg-rose-50'"
        :aria-current="item.value === page ? 'page' : undefined"
        @click="$emit('update:page', item.value!)"
      >
        {{ item.value }}
      </button>
    </template>

    <button
      type="button"
      :disabled="page >= totalPages"
      aria-label="Next page"
      class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
      @click="$emit('update:page', page + 1)"
    >
      <ChevronRight class="h-4 w-4" aria-hidden="true" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const props = defineProps<{ page: number; totalPages: number }>()
defineEmits<{ 'update:page': [page: number] }>()

// Windowed page numbers with ellipsis, e.g. 1 … 4 5 [6] 7 8 … 20
const pageItems = computed(() => {
  const { page, totalPages } = props
  const windowSize = 1
  const items: { type: 'page' | 'ellipsis'; value?: number; key: string }[] = []

  const pushPage = (n: number) => items.push({ type: 'page', value: n, key: `p${n}` })
  const pushEllipsis = (key: string) => items.push({ type: 'ellipsis', key })

  pushPage(1)
  if (page - windowSize > 2) pushEllipsis('start')
  for (let n = Math.max(2, page - windowSize); n <= Math.min(totalPages - 1, page + windowSize); n++) {
    pushPage(n)
  }
  if (page + windowSize < totalPages - 1) pushEllipsis('end')
  if (totalPages > 1) pushPage(totalPages)

  return items
})
</script>
