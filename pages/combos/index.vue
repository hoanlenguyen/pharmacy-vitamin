<!--
  Public Combos listing — /combos. Each combo is a real multi-product bundle (managed from
  Admin > Combos) sold at its own bundle price, not individual products.
-->
<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <nav class="mb-6 flex items-center gap-1 text-xs text-gray-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="transition-colors hover:text-rose-600">Home</NuxtLink>
      <ChevronRight class="h-3 w-3 text-gray-300" aria-hidden="true" />
      <span class="text-gray-700">Combos</span>
    </nav>

    <div class="mb-8 flex items-start gap-3">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <Gift class="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h1 class="font-display text-2xl font-bold text-gray-900">Combos</h1>
        <p class="mt-1 text-sm text-gray-500">Bundle deals — save more when you buy together.</p>
      </div>
    </div>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>
    <p v-else-if="combos.length === 0" class="text-sm text-gray-400">No combos available right now — check back soon.</p>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="combo in combos"
        :key="combo.slug"
        class="group flex flex-col rounded-xl border border-gray-100 p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
      >
        <NuxtLink :to="`/combos/${combo.slug}`" class="flex flex-1 flex-col">
          <div class="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-rose-soft-gradient">
            <img v-if="combo.thumbnailUrl" :src="combo.thumbnailUrl" :alt="combo.name" class="h-full w-full object-cover" loading="lazy" />
            <Gift v-else class="h-8 w-8 text-rose-300" aria-hidden="true" />
          </div>

          <p class="text-sm font-semibold text-gray-800 group-hover:text-rose-700">{{ combo.name }}</p>
          <p class="mt-1 text-xs text-gray-500">{{ combo.itemCount }} product{{ combo.itemCount === 1 ? '' : 's' }}</p>

          <div class="mt-auto flex items-baseline gap-2 pt-3">
            <span class="text-sm font-semibold text-rose-600">{{ formatCurrency(combo.price) }}</span>
            <span v-if="combo.compareAtPrice" class="text-xs text-gray-400 line-through">{{ formatCurrency(combo.compareAtPrice) }}</span>
          </div>
        </NuxtLink>

        <button
          type="button"
          class="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-rose-gradient py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          @click="addComboToCart(combo)"
        >
          <ShoppingBag class="h-3.5 w-3.5" aria-hidden="true" />
          {{ justAddedSlug === combo.slug ? 'Added!' : 'Add to Cart' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Gift, ShoppingBag } from '@lucide/vue'

useHead({ title: 'Combos — Pharmacy Vitamin' })

type ComboSummary = {
  slug: string
  name: string
  description: string | null
  price: number
  compareAtPrice: number | null
  itemCount: number
  thumbnailUrl: string | null
}

const { data, pending } = await useFetch<{ items: ComboSummary[] }>('/api/combos')
const combos = computed(() => data.value?.items ?? [])

const { addItem } = useCartStore()
const justAddedSlug = ref<string | null>(null)

function addComboToCart(combo: ComboSummary) {
  addItem({
    id: `combo:${combo.slug}`,
    name: combo.name,
    price: combo.price,
    originalPrice: combo.compareAtPrice ?? undefined,
    slug: combo.slug,
    kind: 'combo'
  })
  justAddedSlug.value = combo.slug
  setTimeout(() => (justAddedSlug.value = null), 1200)
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('en-US').format(value)}đ`
}
</script>
