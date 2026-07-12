<!--
  Maps to: repeating product card pattern used across all 3 carousel sections on mint07.com.
  Supports: sold-count badge, rating, sale vs. strikethrough price OR price range (variants),
  simple "Add to cart" CTA vs. "Choose options" CTA for variable products.
-->
<template>
  <div class="flex flex-col rounded-lg border border-gray-100 p-3 shadow-sm">
    <div class="relative mb-3 flex h-32 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
      Product image
      <span
        v-if="product.soldCount"
        class="absolute left-1 top-1 rounded bg-mint-600 px-1.5 py-0.5 text-[10px] font-medium text-white"
      >
        Sold {{ product.soldCount }}
      </span>
    </div>

    <p class="line-clamp-2 text-sm font-medium text-gray-800">{{ product.name }}</p>

    <p v-if="product.rating" class="mt-1 text-xs text-amber-500">
      ★ {{ product.rating.toFixed(2) }} ({{ product.reviewCount }})
    </p>

    <div class="mt-2 flex items-baseline gap-2">
      <span class="text-sm font-semibold text-mint-700">{{ formattedPrice }}</span>
      <span v-if="product.originalPrice" class="text-xs text-gray-400 line-through">
        {{ formatCurrency(product.originalPrice) }}
      </span>
    </div>

    <button
      class="mt-3 rounded bg-mint-600 py-1.5 text-xs font-semibold text-white hover:bg-mint-700"
    >
      {{ product.hasVariants ? 'Choose Options' : 'Add to Cart' }}
    </button>
    <p v-if="product.hasVariants" class="mt-1 text-[10px] text-gray-400">
      This product has multiple variants — choose on the product page.
    </p>
  </div>
</template>

<script setup lang="ts">
export type Product = {
  name: string
  price: number
  priceMax?: number
  originalPrice?: number
  rating?: number
  reviewCount?: number
  soldCount?: number
  hasVariants?: boolean
}

const props = defineProps<{ product: Product }>()

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
