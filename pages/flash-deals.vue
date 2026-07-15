<!--
  Public Flash Deals listing — /flash-deals. Shows products flagged is_flash_deal from
  Admin > Flash Deals, same grid+pagination treatment as a real category page.
-->
<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <nav class="mb-6 flex items-center gap-1 text-xs text-gray-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="transition-colors hover:text-rose-600">Home</NuxtLink>
      <ChevronRight class="h-3 w-3 text-gray-300" aria-hidden="true" />
      <span class="text-gray-700">Flash Deals</span>
    </nav>

    <div class="mb-8 flex items-start gap-3">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <Zap class="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h1 class="font-display text-2xl font-bold text-gray-900">ƯU ĐÃI NGAY HÔM NAY</h1>
        <p class="mt-1 text-sm text-gray-500">Limited-time discounts across the store.</p>
      </div>
    </div>

    <p v-if="!pending && products.length === 0" class="text-sm text-gray-400">No Flash Deals right now — check back soon.</p>

    <div v-else class="flex flex-col gap-6 lg:flex-row">
      <div class="min-w-0 flex-1">
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <ProductCard v-for="product in products" :key="product.slug ?? product.name" :product="product" />
        </div>
        <Pagination :page="page" :total-pages="totalPages" @update:page="goToPage" />
      </div>
      <aside class="w-full shrink-0 lg:w-64">
        <RecentlyViewedWidget />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Zap } from '@lucide/vue'
import type { Product } from '~/components/ProductCard.vue'

useHead({ title: 'Flash Deals — Pharmacy Vitamin' })

const route = useRoute()
const PAGE_SIZE = 15
const page = computed(() => Math.max(1, Number(route.query.page ?? 1) || 1))

const { data, pending } = await useFetch<{ items: Product[]; total: number }>('/api/products', {
  query: computed(() => ({ flashDeal: 'true', limit: PAGE_SIZE, offset: (page.value - 1) * PAGE_SIZE }))
})

const products = computed(() => data.value?.items ?? [])
const totalPages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / PAGE_SIZE)))

function goToPage(nextPage: number) {
  navigateTo({ path: '/flash-deals', query: { ...route.query, page: nextPage } })
}
</script>
