<!--
  Public brand directory — /brands. Links to /brands/:slug for each brand's
  product listing. Reachable from TopLinkRow "Find a Brand" and TheFooter
  "Brand Finder".
-->
<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <nav class="mb-6 flex items-center gap-1 text-xs text-gray-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="transition-colors hover:text-rose-600">Home</NuxtLink>
      <ChevronRight class="h-3 w-3 text-gray-300" aria-hidden="true" />
      <span class="text-gray-700">Brands</span>
    </nav>

    <div class="mb-8 flex items-center gap-3">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <Award class="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h1 class="font-display text-2xl font-bold text-gray-900">Brands</h1>
        <p class="mt-1 text-sm text-gray-500">Browse authentic products by brand.</p>
      </div>
    </div>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="brands.length === 0" class="text-sm text-gray-400">No brands yet.</p>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="brand in brands"
        :key="brand.slug"
        :to="`/brands/${brand.slug}`"
        class="group flex items-center gap-4 rounded-xl border border-gray-100 p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
      >
        <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-soft-gradient">
          <img v-if="brand.logoUrl" :src="brand.logoUrl" :alt="brand.name" class="h-full w-full object-cover" />
          <Award v-else class="h-5 w-5 text-rose-400" aria-hidden="true" />
        </div>
        <div class="min-w-0">
          <p class="font-medium text-gray-800 group-hover:text-rose-700">{{ brand.name }}</p>
          <p class="text-xs text-gray-400">{{ brand.productCount }} product{{ brand.productCount === 1 ? '' : 's' }}</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Award, ChevronRight } from '@lucide/vue'

useHead({ title: 'Brands — Pharmacy Vitamin' })

type Brand = { slug: string; name: string; description: string | null; logoUrl: string | null; productCount: number }

const { data, pending } = await useFetch<{ brands: Brand[] }>('/api/brands')
const brands = computed(() => data.value?.brands ?? [])
</script>
