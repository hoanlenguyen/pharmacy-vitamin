<!--
  Maps to: secondary top link row on mint07.com (About / Find brand / Support / Blog / Store locations)
-->
<template>
  <div class="hidden border-b border-rose-100 bg-rose-50/60 md:block">
    <div class="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2 text-xs text-gray-600">
      <NuxtLink
        v-for="link in links"
        :key="link.label"
        :to="link.to"
        class="transition-colors hover:text-rose-700"
      >
        {{ link.label }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const links = [
  { label: 'About Us', to: '/about' },
  { label: 'Find a Brand', to: '/brands' },
  { label: 'Support', to: '/support' },
  { label: 'Blog', to: '/blog' },
  { label: 'Store Locations', to: '/stores' }
]
</script>
