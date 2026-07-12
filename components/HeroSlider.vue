<!--
  Maps to: full-width rotating hero slider on mint07.com (5 slides in source).
  Minimal auto-rotating carousel with dots — swap placeholder blocks for real slide images.
-->
<template>
  <section class="relative w-full overflow-hidden bg-mint-100">
    <div class="mx-auto flex h-64 max-w-7xl items-center justify-center md:h-96">
      <div class="text-center">
        <p class="text-sm uppercase tracking-widest text-mint-700">Slide {{ active + 1 }} / {{ slides.length }}</p>
        <p class="mt-2 text-2xl font-semibold text-mint-800">{{ slides[active] }}</p>
      </div>
    </div>
    <div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
      <button
        v-for="(slide, i) in slides"
        :key="slide"
        class="h-2 w-2 rounded-full"
        :class="i === active ? 'bg-mint-700' : 'bg-mint-300'"
        @click="active = i"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
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
