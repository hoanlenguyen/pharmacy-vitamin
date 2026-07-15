<!--
  Sidebar widget listing recently-viewed products (localStorage-backed, client-only —
  see composables/useRecentlyViewed.ts). Renders nothing until there's history to show.
-->
<template>
  <aside v-if="products.length" class="rounded-xl border border-gray-100 p-4 shadow-card">
    <h2 class="mb-3 flex items-center gap-2 font-display text-sm font-bold text-gray-900">
      <History class="h-4 w-4 text-rose-500" aria-hidden="true" />
      Recently Viewed
    </h2>
    <ul class="space-y-3">
      <li v-for="product in products" :key="product.slug">
        <NuxtLink :to="`/products/${product.slug}`" class="group flex items-center gap-3">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-rose-soft-gradient">
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :alt="product.name"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <ImageIcon v-else class="h-5 w-5 text-rose-300" aria-hidden="true" />
          </div>
          <div class="min-w-0">
            <p class="line-clamp-2 text-xs font-medium text-gray-700 group-hover:text-rose-700">{{ product.name }}</p>
            <p class="mt-0.5 text-xs font-semibold text-rose-600">{{ formattedPrice(product) }}</p>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { History, Image as ImageIcon } from '@lucide/vue'
import type { Product } from '~/components/ProductCard.vue'

const { slugs } = useRecentlyViewed()

// server: false — this list is meaningless without localStorage, so skip the SSR fetch
// entirely and only load once useRecentlyViewed hydrates slugs on the client. immediate:
// false + a manual execute() avoids firing before slugs has hydrated from localStorage.
const { data, execute } = useFetch<{ items: Product[] }>('/api/products', {
  query: computed(() => ({ slugs: slugs.value.join(',') })),
  server: false,
  immediate: false
})

watch(
  slugs,
  value => {
    if (value.length) execute()
  },
  { immediate: true }
)

const products = computed(() => data.value?.items ?? [])

function formattedPrice(product: Product) {
  const format = (value: number) => `${new Intl.NumberFormat('en-US').format(value)}đ`
  return product.priceMax ? `${format(product.price)} – ${format(product.priceMax)}` : format(product.price)
}
</script>
