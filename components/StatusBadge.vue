<!-- Small color-coded pill for order/product status values. -->
<template>
  <span class="rounded-full px-2 py-0.5 text-xs font-medium capitalize" :class="colorClass">
    {{ status }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ status: string }>()

const colorMap: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  paid: 'bg-emerald-50 text-emerald-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  draft: 'bg-gray-100 text-gray-500',
  pending: 'bg-amber-50 text-amber-700',
  archived: 'bg-amber-50 text-amber-700',
  shipped: 'bg-sky-50 text-sky-700',
  cancelled: 'bg-red-50 text-red-700'
}

const colorClass = computed(() => colorMap[props.status] ?? 'bg-gray-100 text-gray-500')
</script>
