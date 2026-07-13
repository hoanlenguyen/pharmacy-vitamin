<!--
  Generic multi-column footer placeholder.
  Note: the source homepage fetch was truncated before reaching mint07.com's real footer,
  so this structure is a common e-commerce default (columns + newsletter + copyright) —
  swap column content for the real footer once you have it.
-->
<template>
  <footer class="mt-auto border-t border-gray-200 bg-gray-50">
    <div class="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4">
      <div v-for="col in columns" :key="col.title">
        <p class="mb-3 text-sm font-semibold text-gray-900">{{ col.title }}</p>
        <ul class="space-y-2">
          <li v-for="link in col.links" :key="link.label">
            <NuxtLink :to="link.to" class="text-sm text-gray-500 transition-colors hover:text-rose-600">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div>
        <p class="mb-3 text-sm font-semibold text-gray-900">Follow Us</p>
        <div class="flex gap-3">
          <a
            v-for="social in socials"
            :key="social.label"
            :href="social.href"
            :aria-label="social.label"
            target="_blank"
            rel="noopener noreferrer"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600 transition-colors hover:bg-rose-500 hover:text-white"
          >
            <component :is="social.icon" class="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
    <div class="border-t border-gray-200 px-4 py-4 text-center text-xs text-gray-400">
      © {{ new Date().getFullYear() }} Pharmacy Vitamin. All rights reserved.
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Camera, MessageCircle, Music2 } from '@lucide/vue'

const columns = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Blog', to: '/blog' }
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Shipping Policy', to: '/shipping' },
      { label: 'Return Policy', to: '/returns' },
      { label: 'Payment Info', to: '/payment' }
    ]
  },
  {
    title: 'Shop',
    links: [
      { label: 'Store Directory', to: '/stores' },
      { label: 'Brand Finder', to: '/brands' },
      { label: 'Membership', to: '/membership' }
    ]
  }
]

// TODO: replace with real social profile URLs + official brand marks
const socials = [
  { label: 'Facebook', href: '#', icon: MessageCircle },
  { label: 'Instagram', href: '#', icon: Camera },
  { label: 'TikTok', href: '#', icon: Music2 }
]
</script>
