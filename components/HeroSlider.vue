<!--
  Maps to: full-width rotating hero slider on mint07.com (5 slides in source).
  Minimal auto-rotating carousel with dots — swap placeholder blocks for real slide images.
-->
<template>
  <section class="relative w-full overflow-hidden bg-rose-soft-gradient">
    <div class="mx-auto flex h-64 max-w-7xl items-center justify-center md:h-96">
      <Transition name="slide" mode="out-in">
        <div :key="active" class="flex flex-col items-center text-center">
          <Sparkles class="mb-3 h-8 w-8 text-rose-400" aria-hidden="true" />
          <p class="text-xs font-semibold uppercase tracking-widest text-rose-500">
            Slide {{ active + 1 }} / {{ slides.length }}
          </p>
          <p class="mt-2 font-display text-2xl font-bold text-gray-900 md:text-4xl">
            {{ slides[active] }}
          </p>
          <button
            type="button"
            class="mt-5 rounded-full bg-rose-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90"
          >
            Shop Now
          </button>
        </div>
      </Transition>
    </div>
    <div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
      <button
        v-for="(slide, i) in slides"
        :key="slide"
        type="button"
        class="h-2 rounded-full transition-all"
        :class="i === active ? 'w-6 bg-rose-500' : 'w-2 bg-rose-200 hover:bg-rose-300'"
        :aria-label="`Go to slide ${i + 1}: ${slide}`"
        :aria-current="i === active"
        @click="active = i"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { Sparkles } from '@lucide/vue'

// Placeholder slide captions — replace with real slide images/links.
const slides = [
  'Anniversary Sale Banner',
  'Seasonal Promotion Banner',
  'Flash Sale Banner',
  'Bundle Offer Banner',
  'New Store Announcement Banner'
]
const active = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    active.value = (active.value + 1) % slides.length
  }, 5000)
})
onBeforeUnmount(() => timer && clearInterval(timer))
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 250ms ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .slide-enter-active,
  .slide-leave-active {
    transition: none;
  }
}
</style>
