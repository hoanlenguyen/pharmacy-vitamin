<!--
  Homepage content (chrome — announcement bar, header, nav, footer — lives in layouts/default.vue):
  1. Hero slider
  2. Quick-category pill row
  3. 3-column promo banner strip
  4. "Best Price Every Day" product section (with countdown)
  5. "Monthly Sale Program" product section (biggest discounts)
  6. "Makeup" product section (category filter)

  Product data comes from /api/products (proxies the Cloudflare Worker + D1) —
  the section tabs are still presentational only, matching ProductSection's
  existing behavior (no per-tab sub-filtering yet).
-->
<template>
  <div>
    <HeroSlider />
    <CategoryPillRow />
    <PromoBannerGrid />

    <ProductSection
      title="Best Price Every Day"
      :products="dailyDeals?.items ?? []"
      :countdown-seconds="32400"
    />

    <ProductSection
      title="Monthly Sale Program"
      :products="monthlySale?.items ?? []"
      :tabs="['Best Price', 'Brand Deals', 'Flash Deals']"
    />

    <ProductSection
      title="Makeup"
      :products="makeupPicks?.items ?? []"
      :tabs="['All', 'Lips', 'Face', 'Eyes']"
    />
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/components/ProductCard.vue'

const { data: dailyDeals } = await useFetch<{ items: Product[] }>('/api/products', { query: { limit: 5 } })
const { data: monthlySale } = await useFetch<{ items: Product[] }>('/api/products', { query: { sort: 'discount', limit: 7 } })
const { data: makeupPicks } = await useFetch<{ items: Product[] }>('/api/products', { query: { category: 'makeup', limit: 7 } })
</script>
