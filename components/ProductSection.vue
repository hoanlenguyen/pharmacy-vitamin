<!--
  Maps to: reusable wrapper used 3x on mint07.com homepage
  ("Best Price Every Day", "Monthly Sale Program", "Makeup"):
  heading + optional tab filters + optional countdown/CTA row + product grid.
-->
<template>
  <section class="mx-auto max-w-7xl px-4 py-8">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-xl font-bold text-gray-800">{{ title }}</h2>

      <div v-if="tabs?.length" class="flex gap-4 text-sm font-medium text-gray-500">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="hover:text-mint-700"
          :class="{ 'text-mint-700': tab === activeTab }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>

      <div v-if="countdownSeconds" class="flex items-center gap-2 text-sm text-gray-600">
        <span>Ends in:</span>
        <span class="rounded bg-gray-800 px-2 py-1 font-mono text-xs text-white">{{ formattedCountdown }}</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <ProductCard v-for="product in products" :key="product.name" :product="product" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from './ProductCard.vue'

const props = defineProps<{
  title: string
  products: Product[]
  tabs?: string[]
  countdownSeconds?: number
}>()

const activeTab = ref(props.tabs?.[0] ?? '')

const remaining = ref(props.countdownSeconds ?? 0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (!props.countdownSeconds) return
  timer = setInterval(() => {
    remaining.value = Math.max(0, remaining.value - 1)
  }, 1000)
})
onBeforeUnmount(() => timer && clearInterval(timer))

const formattedCountdown = computed(() => {
  const h = Math.floor(remaining.value / 3600)
  const m = Math.floor((remaining.value % 3600) / 60)
  const s = remaining.value % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
})
</script>
