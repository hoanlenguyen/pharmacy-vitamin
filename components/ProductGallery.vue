<!--
  Maps to: product image gallery on mint07.com product pages (main image + thumbnail strip).
  Renders real photos when available; falls back to an icon placeholder per-image
  (handles both "no images yet" and a broken/unreachable URL).
-->
<template>
  <div>
    <div class="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-rose-soft-gradient">
      <img
        v-if="activeImage && !failed.has(active)"
        :src="activeImage.url"
        :alt="activeImage.alt"
        class="h-full w-full object-cover"
        @error="failed.add(active)"
      />
      <ImageIcon v-else class="h-16 w-16 text-rose-300" aria-hidden="true" />
      <span
        v-if="discountPercent"
        class="absolute left-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white"
      >
        -{{ discountPercent }}%
      </span>
    </div>

    <div v-if="images.length > 1" class="mt-3 flex gap-2">
      <button
        v-for="(image, i) in images"
        :key="image.url"
        type="button"
        class="flex aspect-square w-16 items-center justify-center overflow-hidden rounded-lg border-2 bg-rose-soft-gradient transition-colors"
        :class="active === i ? 'border-rose-500' : 'border-transparent hover:border-rose-200'"
        :aria-label="`View image ${i + 1}`"
        :aria-current="active === i"
        @click="active = i"
      >
        <img v-if="!failed.has(i)" :src="image.url" :alt="image.alt" class="h-full w-full object-cover" @error="failed.add(i)" />
        <ImageIcon v-else class="h-5 w-5 text-rose-300" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Image as ImageIcon } from '@lucide/vue'

const props = withDefaults(
  defineProps<{ images?: { url: string; alt: string }[]; discountPercent?: number }>(),
  { images: () => [] }
)

const active = ref(0)
const failed = reactive(new Set<number>())

const activeImage = computed(() => props.images[active.value])
</script>
