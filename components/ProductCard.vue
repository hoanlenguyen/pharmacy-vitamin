<!--
  Maps to: repeating product card pattern used across all 3 carousel sections on mint07.com.
  Supports: sold-count badge, rating, sale vs. strikethrough price OR price range (variants),
  simple "Add to cart" CTA vs. "Choose options" CTA for variable products.
-->
<template>
  <!-- List layout: horizontal row (image, name/rating, price, CTA) for the shop toolbar's list view. -->
  <div
    v-if="layout === 'list'"
    class="group flex items-center gap-4 rounded-xl border border-gray-100 p-3 shadow-card transition-all hover:shadow-card-hover"
  >
    <component
      :is="product.slug ? NuxtLink : 'div'"
      :to="product.slug ? `/products/${product.slug}` : undefined"
      class="flex min-w-0 flex-1 items-center gap-4"
    >
      <div class="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-rose-soft-gradient text-xs text-rose-300">
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

      <div class="min-w-0">
        <p ref="nameEl" class="line-clamp-1 text-sm font-medium text-gray-800 group-hover:text-rose-700" :title="nameTruncated ? product.name : undefined">
          {{ product.name }}
        </p>
        <p v-if="product.rating" class="mt-1 flex items-center gap-1 text-xs text-amber-500">
          <Star class="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          {{ product.rating.toFixed(2) }} ({{ product.reviewCount }})
        </p>
      </div>
    </component>

    <div class="hidden shrink-0 items-baseline gap-2 sm:flex">
      <span class="text-sm font-semibold text-rose-600">{{ formattedPrice }}</span>
      <span v-if="product.originalPrice" class="text-xs text-gray-400 line-through">
        {{ formatCurrency(product.originalPrice) }}
      </span>
    </div>

    <div class="w-36 shrink-0">
      <NuxtLink
        v-if="product.hasVariants && product.slug"
        :to="`/products/${product.slug}`"
        title="This product has multiple variants — choose on the product page."
        class="flex items-center justify-center gap-1.5 rounded-full bg-rose-gradient py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
      >
        <ShoppingCart class="h-3.5 w-3.5" aria-hidden="true" />
        Choose Options
      </NuxtLink>
      <button
        v-else-if="!product.hasVariants"
        type="button"
        class="flex w-full items-center justify-center gap-1.5 rounded-full bg-rose-gradient py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        @click="handleAddToCart"
      >
        <ShoppingCart class="h-3.5 w-3.5" aria-hidden="true" />
        {{ justAdded ? 'Added!' : 'Add to Cart' }}
      </button>
      <button
        v-else
        type="button"
        disabled
        title="This product has multiple variants — choose on the product page."
        class="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-full bg-gray-200 py-1.5 text-xs font-semibold text-gray-500"
      >
        <ShoppingCart class="h-3.5 w-3.5" aria-hidden="true" />
        Choose Options
      </button>
    </div>
  </div>

  <!-- Grid layout (default) -->
  <div v-else class="group flex flex-col rounded-xl border border-gray-100 p-3 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
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

      <p
        ref="nameEl"
        class="line-clamp-2 min-h-10 text-sm font-medium text-gray-800 group-hover:text-rose-700"
        :title="nameTruncated ? product.name : undefined"
      >
        {{ product.name }}
      </p>
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

    <!-- mt-auto pins the CTA to the bottom of the card regardless of how much
         (or how little) content renders above it, so buttons stay aligned
         across a row of cards with different name lengths/ratings. -->
    <div class="mt-auto pt-3">
      <NuxtLink
        v-if="product.hasVariants && product.slug"
        :to="`/products/${product.slug}`"
        title="This product has multiple variants — choose on the product page."
        class="flex items-center justify-center gap-1.5 rounded-full bg-rose-gradient py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
      >
        <ShoppingCart class="h-3.5 w-3.5" aria-hidden="true" />
        Choose Options
      </NuxtLink>
      <button
        v-else-if="!product.hasVariants"
        type="button"
        class="flex w-full items-center justify-center gap-1.5 rounded-full bg-rose-gradient py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        @click="handleAddToCart"
      >
        <ShoppingCart class="h-3.5 w-3.5" aria-hidden="true" />
        {{ justAdded ? 'Added!' : 'Add to Cart' }}
      </button>
      <button
        v-else
        type="button"
        disabled
        title="This product has multiple variants — choose on the product page."
        class="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-full bg-gray-200 py-1.5 text-xs font-semibold text-gray-500"
      >
        <ShoppingCart class="h-3.5 w-3.5" aria-hidden="true" />
        Choose Options
      </button>
    </div>
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

const props = withDefaults(defineProps<{ product: Product; layout?: 'grid' | 'list' }>(), { layout: 'grid' })

const NuxtLink = resolveComponent('NuxtLink')
const { addItem } = useCartStore()
const justAdded = ref(false)
const imageFailed = ref(false)

const nameEl = ref<HTMLElement>()
const nameTruncated = ref(false)

function checkNameTruncation() {
  const el = nameEl.value
  // line-clamp-2 truncates vertically, so overflow shows up as extra scrollHeight, not scrollWidth.
  if (el) nameTruncated.value = el.scrollHeight > el.clientHeight
}

onMounted(() => {
  checkNameTruncation()
  const observer = new ResizeObserver(checkNameTruncation)
  if (nameEl.value) observer.observe(nameEl.value)
  onBeforeUnmount(() => observer.disconnect())
})

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
  return `${new Intl.NumberFormat('en-US').format(value)}đ`
}

const formattedPrice = computed(() => {
  if (props.product.priceMax) {
    return `${formatCurrency(props.product.price)} – ${formatCurrency(props.product.priceMax)}`
  }
  return formatCurrency(props.product.price)
})
</script>
