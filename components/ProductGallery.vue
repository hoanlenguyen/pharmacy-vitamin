<!--
  Maps to: product image gallery on mint07.com product pages (main image + thumbnail strip).
  Placeholder-only — swap the gradient panels for real product photography.
-->
<template>
  <div>
    <div class="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-rose-soft-gradient">
      <ImageIcon class="h-16 w-16 text-rose-300" aria-hidden="true" />
      <span
        v-if="discountPercent"
        class="absolute left-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white"
      >
        -{{ discountPercent }}%
      </span>
    </div>

    <div class="mt-3 flex gap-2">
      <button
        v-for="i in imageCount"
        :key="i"
        type="button"
        class="flex aspect-square w-16 items-center justify-center rounded-lg border-2 bg-rose-soft-gradient transition-colors"
        :class="active === i ? 'border-rose-500' : 'border-transparent hover:border-rose-200'"
        :aria-label="`View image ${i}`"
        :aria-current="active === i"
        @click="active = i"
      >
        <ImageIcon class="h-5 w-5 text-rose-300" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Image as ImageIcon } from '@lucide/vue'

withDefaults(defineProps<{ imageCount?: number; discountPercent?: number }>(), { imageCount: 3 })

const active = ref(1)
</script>
