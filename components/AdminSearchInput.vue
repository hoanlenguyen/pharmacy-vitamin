<!--
  Standalone search/filter box used above admin list tables (Products, Flash Deals, Brands,
  Combos, Users, Orders) — a pill input with a clear (X) button that appears once there's
  text to clear.
-->
<template>
  <div class="relative w-64">
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="w-full rounded-full border border-gray-300 py-2 pl-4 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="modelValue"
      type="button"
      aria-label="Clear search"
      class="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 hover:text-rose-600"
      @click="$emit('update:modelValue', '')"
    >
      <X class="h-4 w-4" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { X } from '@lucide/vue'

defineProps<{ modelValue: string; placeholder?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
