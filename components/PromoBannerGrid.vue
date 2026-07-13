<!--
  Maps to: 3-column promo banner strip on mint07.com
  Each card: background block + bold keyword + subtext + CTA button.
-->
<template>
  <section class="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 md:grid-cols-3">
    <div
      v-for="banner in banners"
      :key="banner.title"
      class="group relative flex min-h-[180px] flex-col items-start justify-end gap-2 overflow-hidden rounded-xl p-6 shadow-card transition-shadow hover:shadow-card-hover"
      :class="banner.bgClass"
    >
      <component
        :is="banner.icon"
        class="absolute right-4 top-4 h-14 w-14 opacity-20 transition-transform group-hover:scale-110"
        :class="banner.iconClass"
        aria-hidden="true"
      />
      <p class="font-display text-lg font-bold" :class="banner.titleClass">{{ banner.title }}</p>
      <p class="text-sm text-gray-600">{{ banner.subtitle }}</p>
      <NuxtLink
        :to="banner.to"
        class="mt-2 rounded-full bg-rose-gradient px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
      >
        Shop Now
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Droplet, Heart, Sparkle } from '@lucide/vue'

const banners = [
  {
    title: 'Makeup',
    subtitle: 'Best trending picks',
    to: '/makeup',
    icon: Sparkle,
    bgClass: 'bg-rose-50',
    iconClass: 'text-rose-500',
    titleClass: 'text-rose-800'
  },
  {
    title: 'Skin Care',
    subtitle: 'Quality, authentic products',
    to: '/skin-care',
    icon: Droplet,
    bgClass: 'bg-accent-50',
    iconClass: 'text-accent-500',
    titleClass: 'text-accent-800'
  },
  {
    title: 'Personal Care',
    subtitle: 'A wide range of body care',
    to: '/personal-care',
    icon: Heart,
    bgClass: 'bg-rose-50',
    iconClass: 'text-rose-500',
    titleClass: 'text-rose-800'
  }
]
</script>
