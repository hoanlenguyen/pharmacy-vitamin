<!--
  Public brand page — /brands/:slug. Product grid filtered by brand,
  linked from product cards/detail pages and the brand directory.
-->
<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <nav class="mb-6 flex items-center gap-1 text-xs text-gray-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="transition-colors hover:text-rose-600">Home</NuxtLink>
      <ChevronRight class="h-3 w-3 text-gray-300" aria-hidden="true" />
      <NuxtLink to="/brands" class="transition-colors hover:text-rose-600">Brands</NuxtLink>
      <template v-if="brand">
        <ChevronRight class="h-3 w-3 text-gray-300" aria-hidden="true" />
        <span class="text-gray-700">{{ brand.name }}</span>
      </template>
    </nav>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>

    <div v-else-if="!brand" class="flex flex-col items-center gap-3 py-24 text-center">
      <PackageSearch class="h-10 w-10 text-rose-300" aria-hidden="true" />
      <p class="font-display text-lg font-bold text-gray-900">Brand not found</p>
      <NuxtLink to="/brands" class="text-sm font-medium text-rose-600 hover:underline">Back to Brands</NuxtLink>
    </div>

    <template v-else>
      <div class="mb-8 flex items-center gap-3">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-soft-gradient">
          <img v-if="brand.logoUrl" :src="brand.logoUrl" :alt="brand.name" class="h-full w-full object-cover" />
          <Award v-else class="h-6 w-6 text-rose-400" aria-hidden="true" />
        </div>
        <div>
          <h1 class="font-display text-2xl font-bold text-gray-900">{{ brand.name }}</h1>
          <p class="mt-1 text-sm text-gray-500">
            {{ brand.description || `${brand.productCount} product${brand.productCount === 1 ? '' : 's'}` }}
          </p>
        </div>
      </div>

      <p v-if="productsPending" class="text-sm text-gray-400">Loading products…</p>
      <p v-else-if="products.length === 0" class="text-sm text-gray-400">No products from this brand yet.</p>
      <template v-else>
        <div class="flex flex-col gap-6 lg:flex-row">
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
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Award, ChevronRight, PackageSearch } from '@lucide/vue'
import type { Product } from '~/components/ProductCard.vue'

const route = useRoute()

type BrandDetail = { slug: string; name: string; description: string | null; logoUrl: string | null; productCount: number }

const { data: brand, pending } = await useFetch<BrandDetail>(() => `/api/brands/${route.params.slug}`)

useHead({ title: computed(() => (brand.value ? `${brand.value.name} — Pharmacy Vitamin` : 'Brand not found')) })

const PAGE_SIZE = 15
const page = computed(() => Math.max(1, Number(route.query.page ?? 1) || 1))

const { data: productsData, pending: productsPending } = await useFetch<{ items: Product[]; total: number }>('/api/products', {
  query: computed(() => ({ brand: route.params.slug, limit: PAGE_SIZE, offset: (page.value - 1) * PAGE_SIZE }))
})
const products = computed(() => productsData.value?.items ?? [])
const totalPages = computed(() => Math.max(1, Math.ceil((productsData.value?.total ?? 0) / PAGE_SIZE)))

function goToPage(nextPage: number) {
  navigateTo({ path: route.path, query: { ...route.query, page: nextPage } })
}
</script>
