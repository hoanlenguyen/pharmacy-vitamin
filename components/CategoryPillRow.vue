<!--
  Maps to: 3-pill quick-category shortcut row directly under the hero on mint07.com
-->
<template>
  <div class="flex justify-center gap-4 py-4">
    <NuxtLink
      v-for="pill in pills"
      :key="pill.label"
      :to="pill.to"
      class="rounded-full border border-mint-300 px-5 py-1.5 text-sm font-medium text-mint-700 hover:bg-mint-50"
    >
      {{ pill.label }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const pills = [
  { label: 'Clearance Sale', to: '/clearance' },
  { label: 'Bundle Deals', to: '/combos' },
  { label: 'Flash Deals', to: '/flash-deals' }
]
</script>
