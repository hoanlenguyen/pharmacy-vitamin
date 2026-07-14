<!--
  Maps to: single product page on mint07.com
  (gallery + buy box left/right, description/reviews tabs, related products below).
  Data comes from /api/products/:slug, which proxies the Cloudflare Worker + D1.
-->
<template>
  <div v-if="pending" class="mx-auto max-w-7xl px-4 py-24 text-center text-sm text-gray-400">Loading…</div>

  <div v-else-if="product" class="mx-auto max-w-7xl px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="mb-6 flex flex-wrap items-center gap-1 text-xs text-gray-500" aria-label="Breadcrumb">
      <template v-for="crumb in product.breadcrumb" :key="crumb.label">
        <NuxtLink :to="crumb.to" class="transition-colors hover:text-rose-600">{{ crumb.label }}</NuxtLink>
        <ChevronRight class="h-3 w-3 text-gray-300" aria-hidden="true" />
      </template>
      <span class="text-gray-700">{{ product.name }}</span>
    </nav>

    <div class="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <ProductGallery :images="product.images" :discount-percent="discountPercent" />

      <div>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="category in product.categories"
            :key="category.slug"
            class="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-600"
          >
            {{ category.name }}
          </span>
        </div>

        <h1 class="mt-3 font-display text-2xl font-bold text-gray-900 lg:text-3xl">{{ product.name }}</h1>

        <div v-if="product.rating || product.soldCount" class="mt-2 flex items-center gap-3 text-sm text-gray-500">
          <span v-if="product.rating" class="flex items-center gap-1 text-amber-500">
            <Star class="h-4 w-4 fill-current" aria-hidden="true" />
            {{ product.rating.toFixed(1) }}
            <span class="text-gray-400">({{ product.reviewCount }} reviews)</span>
          </span>
          <span v-if="product.rating && product.soldCount" aria-hidden="true">·</span>
          <span v-if="product.soldCount">Sold {{ product.soldCount }}</span>
        </div>

        <div class="mt-4 flex items-baseline gap-3 rounded-xl bg-rose-50/60 px-4 py-3">
          <span class="font-display text-2xl font-bold text-rose-600">{{ formatCurrency(product.price) }}</span>
          <span v-if="product.originalPrice" class="text-sm text-gray-400 line-through">
            {{ formatCurrency(product.originalPrice) }}
          </span>
        </div>

        <p v-if="product.summary" class="mt-4 text-sm leading-relaxed text-gray-600">{{ product.summary }}</p>

        <div v-if="product.variants?.length" class="mt-6">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{{ product.variants[0].optionName }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="variant in product.variants"
              :key="variant.id"
              type="button"
              class="rounded-full border px-4 py-1.5 text-sm transition-colors"
              :class="selectedVariantId === variant.id ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-300 text-gray-600 hover:border-rose-300'"
              @click="selectedVariantId = variant.id"
            >
              {{ variant.value }}
            </button>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <QuantityStepper v-model="quantity" :aria-label="`${product.name} quantity`" />
          <button
            type="button"
            class="flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90 sm:flex-none"
            @click="handleAddToCart"
          >
            <ShoppingCart class="h-4 w-4" aria-hidden="true" />
            {{ justAdded ? 'Added to Cart!' : 'Add to Cart' }}
          </button>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-3 border-t border-gray-100 pt-6 sm:grid-cols-3">
          <div v-for="badge in trustBadges" :key="badge.label" class="flex items-center gap-2 text-xs text-gray-600">
            <component :is="badge.icon" class="h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
            {{ badge.label }}
          </div>
        </div>

        <dl class="mt-6 space-y-1 border-t border-gray-100 pt-4 text-xs text-gray-500">
          <div v-if="product.sku" class="flex gap-2">
            <dt class="font-medium text-gray-600">SKU:</dt>
            <dd>{{ product.sku }}</dd>
          </div>
          <div class="flex gap-2">
            <dt class="font-medium text-gray-600">Categories:</dt>
            <dd>{{ product.categories.map(c => c.name).join(', ') }}</dd>
          </div>
          <div v-if="product.brand" class="flex gap-2">
            <dt class="font-medium text-gray-600">Brand:</dt>
            <dd>{{ product.brand }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Description / Reviews tabs -->
    <div class="mt-12">
      <div class="flex gap-6 border-b border-gray-200 text-sm font-medium text-gray-500">
        <button
          v-for="tab in ['Description', 'Reviews']"
          :key="tab"
          type="button"
          class="border-b-2 border-transparent pb-3 transition-colors hover:text-rose-600"
          :class="{ 'border-rose-500 text-rose-600': activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }}
          <span v-if="tab === 'Reviews'" class="ml-1 text-xs text-gray-400">({{ product.reviewCount ?? 0 }})</span>
        </button>
      </div>

      <div v-if="activeTab === 'Description'" class="grid grid-cols-1 gap-8 py-6 lg:grid-cols-3">
        <div v-if="product.skinConcerns?.length || product.howToUse?.length">
          <template v-if="product.skinConcerns?.length">
            <h3 class="font-display text-sm font-bold text-gray-900">Good For</h3>
            <ul class="mt-3 space-y-2">
              <li v-for="concern in product.skinConcerns" :key="concern" class="flex items-start gap-2 text-sm text-gray-600">
                <Check class="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                {{ concern }}
              </li>
            </ul>
          </template>

          <template v-if="product.howToUse?.length">
            <h3 class="mt-6 font-display text-sm font-bold text-gray-900">How to Use</h3>
            <ol class="mt-3 space-y-2">
              <li v-for="(step, i) in product.howToUse" :key="step" class="flex items-start gap-2.5 text-sm text-gray-600">
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[11px] font-semibold text-rose-600">
                  {{ i + 1 }}
                </span>
                {{ step }}
              </li>
            </ol>
          </template>
        </div>
        <p v-else class="text-sm text-gray-500">No description details yet.</p>

        <div v-if="product.ingredients?.length" class="lg:col-span-2">
          <h3 class="font-display text-sm font-bold text-gray-900">Key Ingredients</h3>
          <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div v-for="ingredient in product.ingredients" :key="ingredient.name" class="rounded-lg border border-rose-100 bg-rose-50/40 p-3">
              <p class="text-sm font-semibold text-rose-800">{{ ingredient.name }}</p>
              <p class="mt-0.5 text-xs text-gray-600">{{ ingredient.benefit }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center gap-2 py-12 text-center">
        <MessageSquare class="h-8 w-8 text-rose-300" aria-hidden="true" />
        <p v-if="product.rating" class="flex items-center gap-1 text-amber-500">
          <Star class="h-4 w-4 fill-current" aria-hidden="true" />
          <span class="font-semibold text-gray-800">{{ product.rating.toFixed(1) }}</span>
          <span class="text-sm text-gray-400">average from {{ product.reviewCount }} reviews</span>
        </p>
        <p class="text-sm text-gray-500">Full reviews are coming soon.</p>
      </div>
    </div>

    <!-- Related products -->
    <section v-if="relatedProducts?.length" class="mt-12 border-t border-gray-100 pt-8">
      <h2 class="mb-4 font-display text-xl font-bold text-gray-900">You May Also Like</h2>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <ProductCard v-for="related in relatedProducts" :key="related.slug" :product="related" />
      </div>
    </section>
  </div>

  <div v-else class="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-24 text-center">
    <PackageSearch class="h-10 w-10 text-rose-300" aria-hidden="true" />
    <p class="font-display text-lg font-bold text-gray-900">Product not found</p>
    <NuxtLink to="/" class="text-sm font-medium text-rose-600 hover:underline">Back to shop</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { Check, ChevronRight, MessageSquare, PackageSearch, RotateCcw, ShieldCheck, ShoppingCart, Star, Truck } from '@lucide/vue'
import type { Product } from '~/components/ProductCard.vue'

type ProductDetail = {
  id: string
  slug: string
  name: string
  brand?: string
  sku?: string
  price: number
  originalPrice?: number
  rating?: number
  reviewCount?: number
  soldCount?: number
  categories: { name: string; slug: string; isPrimary: boolean }[]
  breadcrumb: { label: string; to: string }[]
  summary?: string
  images: { url: string; alt: string }[]
  imageCount: number
  skinConcerns: string[]
  howToUse: string[]
  ingredients: { name: string; benefit: string }[]
  variants: { id: string; price: number; originalPrice?: number; stockQuantity: number; optionName: string; value: string }[]
}

const route = useRoute()

const { data: product, pending } = await useFetch<ProductDetail>(() => `/api/products/${route.params.slug}`)

useHead({
  title: computed(() => (product.value ? `${product.value.name} — Pharmacy Vitamin` : 'Product not found'))
})

const discountPercent = computed(() => {
  if (!product.value?.originalPrice) return undefined
  return Math.round(((product.value.originalPrice - product.value.price) / product.value.originalPrice) * 100)
})

const activeTab = ref('Description')
const quantity = ref(1)
const justAdded = ref(false)
const selectedVariantId = ref<string>()
const { addItem } = useCart()

watchEffect(() => {
  if (product.value?.variants?.length && !selectedVariantId.value) {
    selectedVariantId.value = product.value.variants[0].id
  }
})

const activeVariant = computed(() => product.value?.variants?.find(v => v.id === selectedVariantId.value))

function handleAddToCart() {
  if (!product.value) return
  const variant = activeVariant.value
  addItem(
    {
      id: variant ? `${product.value.slug}:${variant.id}` : product.value.slug,
      name: variant ? `${product.value.name} (${variant.value})` : product.value.name,
      price: variant?.price ?? product.value.price,
      originalPrice: variant?.originalPrice ?? product.value.originalPrice,
      slug: product.value.slug
    },
    quantity.value
  )
  justAdded.value = true
  setTimeout(() => (justAdded.value = false), 1200)
}

const trustBadges = [
  { label: 'Free shipping over a set order value', icon: Truck },
  { label: 'Authentic, nationwide warranty', icon: ShieldCheck },
  { label: 'Flexible 14-day returns', icon: RotateCcw }
]

const primaryCategorySlug = computed(() => product.value?.categories.find(c => c.isPrimary)?.slug ?? product.value?.categories[0]?.slug)

// By the time this runs, the `product` useFetch above has already resolved
// (both are awaited in sequence), so primaryCategorySlug is already correct
// for the initial request; the reactive query keeps it correct on client nav too.
const { data: relatedData } = await useFetch<{ items: Product[] }>('/api/products', {
  query: computed(() => ({ category: primaryCategorySlug.value, limit: 5 }))
})

const relatedProducts = computed(() => relatedData.value?.items.filter(p => p.slug !== route.params.slug) ?? [])

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}
</script>
