<!--
  Maps to: 3-column promo banner strip on mint07.com
  Each card: background block + bold keyword + subtext + CTA button.
-->
<template>
  <section class="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 md:grid-cols-3">
    <div
      v-for="banner in banners"
      :key="banner.title"
      class="flex flex-col items-start justify-end gap-2 rounded-lg bg-mint-50 p-6"
      style="min-height: 180px"
    >
      <p class="text-lg font-bold text-mint-800">{{ banner.title }}</p>
      <p class="text-sm text-gray-600">{{ banner.subtitle }}</p>
      <NuxtLink
        :to="banner.to"
        class="mt-2 rounded bg-mint-600 px-4 py-2 text-xs font-semibold text-white hover:bg-mint-700"
      >
        Shop Now
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const banners = [
  { title: 'Makeup', subtitle: 'Best trending picks', to: '/makeup' },
  { title: 'Skin Care', subtitle: 'Quality, authentic products', to: '/skin-care' },
  { title: 'Personal Care', subtitle: 'A wide range of body care', to: '/personal-care' }
]
</script>
