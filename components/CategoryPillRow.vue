<!--
  Maps to: 3-pill quick-category shortcut row directly under the hero on mint07.com
-->
<template>
  <div class="flex flex-wrap justify-center gap-3 py-5">
    <NuxtLink
      v-for="pill in pills"
      :key="pill.label"
      :to="pill.to"
      class="flex items-center gap-1.5 rounded-full border border-rose-300 px-5 py-1.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
    >
      <component :is="pill.icon" class="h-4 w-4" aria-hidden="true" />
      {{ pill.label }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { Package, Tag, Zap } from '@lucide/vue'

const pills = [
  { label: 'Clearance Sale', to: '/clearance', icon: Tag },
  { label: 'Bundle Deals', to: '/combos', icon: Package },
  { label: 'Flash Deals', to: '/flash-deals', icon: Zap }
]
</script>
