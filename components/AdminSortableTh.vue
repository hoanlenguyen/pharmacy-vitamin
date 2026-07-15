<!--
  Reusable sortable column header for admin list tables (Products, Flash Deals, Brands,
  Combos, Users, Orders). Clicking the label toggles sort direction (or switches to this
  column, ascending).
-->
<template>
  <th class="px-4 py-3">
    <button type="button" class="flex items-center gap-1 transition-colors hover:text-rose-600" @click="$emit('sort', sortKey)">
      {{ label }}
      <ChevronUp v-if="isActive && activeSortDir === 'asc'" class="h-3 w-3" aria-hidden="true" />
      <ChevronDown v-else-if="isActive && activeSortDir === 'desc'" class="h-3 w-3" aria-hidden="true" />
      <ChevronsUpDown v-else class="h-3 w-3 text-gray-300" aria-hidden="true" />
    </button>
  </th>
</template>

<script setup lang="ts">
import { ChevronDown, ChevronsUpDown, ChevronUp } from '@lucide/vue'

const props = defineProps<{
  label: string
  sortKey: string
  activeSortBy: string
  activeSortDir: 'asc' | 'desc'
}>()

defineEmits<{ sort: [key: string] }>()

const isActive = computed(() => props.activeSortBy === props.sortKey)
</script>
