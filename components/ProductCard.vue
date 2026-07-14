<!--
  Maps to: repeating product card pattern used across all 3 carousel sections on mint07.com.
  Supports: sold-count badge, rating, sale vs. strikethrough price OR price range (variants),
  simple "Add to cart" CTA vs. "Choose options" CTA for variable products.
-->
<template>
  <div class="group flex flex-col rounded-xl border border-gray-100 p-3 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
    <component :is="product.slug ? NuxtLink : 'div'" :to="product.slug ? `/products/${product.slug}` : undefined">
      <div class="relative mb-3 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-rose-soft-gradient text-xs text-rose-300">
        <img
          v-if="product.imageUrl && !imageFailed"
          :src="product.imageUrl"
          :alt="product.name"
          class="h-full w-full object-cover"
          loading="lazy"
          @error="imageFailed = true"
        />
        <ImageIcon v-else class="h-8 w-8" aria-hidden="true" />
        <span
          v-if="product.soldCount"
          class="absolute left-1.5 top-1.5 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-medium text-white"
        >
          Sold {{ product.soldCount }}
        </span>
      </div>

      <p class="line-clamp-2 text-sm font-medium text-gray-800 group-hover:text-rose-700">{{ product.name }}</p>
    </component>

    <p v-if="product.rating" class="mt-1 flex items-center gap-1 text-xs text-amber-500">
      <Star class="h-3.5 w-3.5 fill-current" aria-hidden="true" />
      {{ product.rating.toFixed(2) }} ({{ product.reviewCount }})
    </p>

    <div class="mt-2 flex items-baseline gap-2">
      <span class="text-sm font-semibold text-rose-600">{{ formattedPrice }}</span>
      <span v-if="product.originalPrice" class="text-xs text-gray-400 line-through">
        {{ formatCurrency(product.originalPrice) }}
      </span>
    </div>

    <NuxtLink
      v-if="product.hasVariants && product.slug"
      :to="`/products/${product.slug}`"
      class="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-rose-gradient py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
    >
      <ShoppingCart class="h-3.5 w-3.5" aria-hidden="true" />
      Choose Options
    </NuxtLink>
    <button
      v-else-if="!product.hasVariants"
      type="button"
      class="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-rose-gradient py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
      @click="handleAddToCart"
    >
      <ShoppingCart class="h-3.5 w-3.5" aria-hidden="true" />
      {{ justAdded ? 'Added!' : 'Add to Cart' }}
    </button>
    <button
      v-else
      type="button"
      disabled
      class="mt-3 flex cursor-not-allowed items-center justify-center gap-1.5 rounded-full bg-gray-200 py-1.5 text-xs font-semibold text-gray-500"
    >
      <ShoppingCart class="h-3.5 w-3.5" aria-hidden="true" />
      Choose Options
    </button>
    <p v-if="product.hasVariants" class="mt-1 text-[10px] text-gray-400">
      This product has multiple variants — choose on the product page.
    </p>
  </div>
</template>

<script setup lang="ts">
import { Image as ImageIcon, ShoppingCart, Star } from '@lucide/vue'
import { resolveComponent } from 'vue'

export type Product = {
  name: string
  price: number
  priceMax?: number
  originalPrice?: number
  rating?: number
  reviewCount?: number
  soldCount?: number
  hasVariants?: boolean
  slug?: string
  imageUrl?: string
}

const props = defineProps<{ product: Product }>()

const NuxtLink = resolveComponent('NuxtLink')
const { addItem } = useCart()
const justAdded = ref(false)
const imageFailed = ref(false)

function handleAddToCart() {
  addItem({
    id: props.product.slug ?? props.product.name,
    name: props.product.name,
    price: props.product.price,
    originalPrice: props.product.originalPrice,
    slug: props.product.slug
  })
  justAdded.value = true
  setTimeout(() => (justAdded.value = false), 1200)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

const formattedPrice = computed(() => {
  if (props.product.priceMax) {
    return `${formatCurrency(props.product.price)} – ${formatCurrency(props.product.priceMax)}`
  }
  return formatCurrency(props.product.price)
})
</script>
