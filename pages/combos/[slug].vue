<!--
  Combo detail — /combos/:slug. Browse-only: shows the bundle's price and constituent
  products, each linking to its own product page. There's no "add bundle to cart" button —
  checkout only knows how to price individual products/variants, not a bundle line item, so
  buying happens per-product for now (see the note below the product list).
-->
<template>
  <div class="mx-auto max-w-5xl px-4 py-8">
    <nav class="mb-6 flex items-center gap-1 text-xs text-gray-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="transition-colors hover:text-rose-600">Home</NuxtLink>
      <ChevronRight class="h-3 w-3 text-gray-300" aria-hidden="true" />
      <NuxtLink to="/combos" class="transition-colors hover:text-rose-600">Combos</NuxtLink>
      <template v-if="combo">
        <ChevronRight class="h-3 w-3 text-gray-300" aria-hidden="true" />
        <span class="text-gray-700">{{ combo.name }}</span>
      </template>
    </nav>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>

    <div v-else-if="!combo" class="flex flex-col items-center gap-3 py-24 text-center">
      <PackageSearch class="h-10 w-10 text-rose-300" aria-hidden="true" />
      <p class="font-display text-lg font-bold text-gray-900">Combo not found</p>
      <NuxtLink to="/combos" class="text-sm font-medium text-rose-600 hover:underline">Back to Combos</NuxtLink>
    </div>

    <template v-else>
      <div class="mb-8">
        <h1 class="font-display text-2xl font-bold text-gray-900">{{ combo.name }}</h1>
        <p v-if="combo.description" class="mt-2 text-sm leading-relaxed text-gray-600">{{ combo.description }}</p>

        <div class="mt-4 flex flex-wrap items-center gap-4 rounded-xl bg-rose-50/60 px-4 py-3">
          <div class="flex items-baseline gap-3">
            <span class="font-display text-2xl font-bold text-rose-600">{{ formatCurrency(combo.price) }}</span>
            <span v-if="combo.compareAtPrice" class="text-sm text-gray-400 line-through">{{ formatCurrency(combo.compareAtPrice) }}</span>
            <span v-if="savings > 0" class="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
              Save {{ formatCurrency(savings) }}
            </span>
          </div>
          <button
            type="button"
            class="ml-auto flex items-center gap-2 rounded-full bg-rose-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90"
            @click="addComboToCart"
          >
            <ShoppingBag class="h-4 w-4" aria-hidden="true" />
            {{ justAdded ? 'Added!' : 'Add Bundle to Cart' }}
          </button>
        </div>
      </div>

      <h2 class="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gray-900">In This Bundle</h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NuxtLink
          v-for="item in combo.items"
          :key="item.productId"
          :to="`/products/${item.productSlug}`"
          class="group flex items-center gap-3 rounded-xl border border-gray-100 p-3 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
        >
          <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-rose-soft-gradient">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.productName" class="h-full w-full object-cover" loading="lazy" />
            <ImageIcon v-else class="h-6 w-6 text-rose-300" aria-hidden="true" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-800 group-hover:text-rose-700">{{ item.productName }}</p>
            <p class="mt-0.5 text-xs text-gray-500">
              {{ formatCurrency(item.unitPrice) }}<span v-if="item.quantity > 1"> × {{ item.quantity }}</span>
            </p>
          </div>
        </NuxtLink>
      </div>

      <p class="mt-6 text-xs text-gray-400">
        Add the whole bundle to your cart at the price above, or tap any product to view it on its own.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Image as ImageIcon, PackageSearch, ShoppingBag } from '@lucide/vue'

type ComboDetail = {
  slug: string
  name: string
  description: string | null
  price: number
  compareAtPrice: number | null
  items: { productId: string; productSlug: string; productName: string; quantity: number; unitPrice: number; imageUrl: string | null }[]
}

const route = useRoute()
const { data: combo, pending } = await useFetch<ComboDetail>(() => `/api/combos/${route.params.slug}`)

useHead({ title: computed(() => (combo.value ? `${combo.value.name} — Pharmacy Vitamin` : 'Combo not found')) })

const savings = computed(() => (combo.value?.compareAtPrice ? combo.value.compareAtPrice - combo.value.price : 0))

const { addItem } = useCartStore()
const justAdded = ref(false)

function addComboToCart() {
  if (!combo.value) return
  addItem({
    id: `combo:${combo.value.slug}`,
    name: combo.value.name,
    price: combo.value.price,
    originalPrice: combo.value.compareAtPrice ?? undefined,
    slug: combo.value.slug,
    kind: 'combo'
  })
  justAdded.value = true
  setTimeout(() => (justAdded.value = false), 1200)
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('en-US').format(value)}đ`
}
</script>
