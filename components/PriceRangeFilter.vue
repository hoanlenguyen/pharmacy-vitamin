<!--
  "Lọc theo giá" dual-thumb price filter, mirroring mint07.com/?s=...'s sidebar.
  Two overlapping native range inputs (pointer-events limited to each thumb) simulate a
  dual-thumb slider without a dependency. Values only take effect on "Filter" click so
  dragging doesn't fire a request per pixel.
-->
<template>
  <div class="rounded-xl border border-gray-100 p-4 shadow-card">
    <h2 class="mb-1 font-display text-sm font-bold text-gray-900">Filter by Price</h2>
    <p class="mb-4 text-xs text-gray-500">Price: {{ formatCurrency(localLow) }} — {{ formatCurrency(localHigh) }}</p>

    <div class="relative h-4">
      <div class="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200"></div>
      <div class="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-rose-400" :style="trackVars"></div>
      <input
        v-model.number="localLow"
        type="range"
        :min="min"
        :max="max"
        class="price-range-thumb absolute inset-x-0 top-1/2 h-1 w-full -translate-y-1/2 appearance-none bg-transparent"
        aria-label="Minimum price"
        @input="localLow = Math.min(localLow, localHigh)"
      />
      <input
        v-model.number="localHigh"
        type="range"
        :min="min"
        :max="max"
        class="price-range-thumb absolute inset-x-0 top-1/2 h-1 w-full -translate-y-1/2 appearance-none bg-transparent"
        aria-label="Maximum price"
        @input="localHigh = Math.max(localHigh, localLow)"
      />
    </div>

    <button
      type="button"
      class="mt-5 w-full rounded-full bg-rose-gradient py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
      @click="$emit('apply', { min: localLow, max: localHigh })"
    >
      Filter
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ min: number; max: number; low: number; high: number }>()
defineEmits<{ apply: [{ min: number; max: number }] }>()

const localLow = ref(props.low)
const localHigh = ref(props.high)

// Bounds/active values come from the parent's query state (e.g. switching category
// changes min/max, clearing the filter resets low/high) — resync when they change externally.
watch(
  () => [props.min, props.max, props.low, props.high],
  () => {
    localLow.value = props.low
    localHigh.value = props.high
  }
)

const range = computed(() => props.max - props.min || 1)
const trackVars = computed(() => {
  const leftPct = ((localLow.value - props.min) / range.value) * 100
  const rightPct = ((localHigh.value - props.min) / range.value) * 100
  return { left: `${leftPct}%`, right: `${100 - rightPct}%` }
})

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('en-US').format(value)}đ`
}
</script>

<style scoped>
/* The track itself must ignore clicks so only the (invisible) native thumb below is
   draggable — Tailwind has no utility for ::-webkit-slider-thumb / ::-moz-range-thumb. */
.price-range-thumb {
  pointer-events: none;
}
.price-range-thumb::-webkit-slider-thumb {
  pointer-events: auto;
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 9999px;
  background: white;
  border: 2px solid theme('colors.rose.500');
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}
.price-range-thumb::-moz-range-thumb {
  pointer-events: auto;
  height: 16px;
  width: 16px;
  border-radius: 9999px;
  background: white;
  border: 2px solid theme('colors.rose.500');
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}
.price-range-thumb::-moz-range-track {
  background: transparent;
}
</style>
