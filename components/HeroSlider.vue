<!--
  Maps to: full-width rotating hero slider on mint07.com.
  Auto-rotating image carousel with dots, sourced from public/banners/. Slides are stacked and
  cross-faded via opacity (rather than <Transition mode="out-in">, which stalls under
  prefers-reduced-motion when the CSS transition is disabled and transitionend never fires).
-->
<template>
  <section class="relative w-full overflow-hidden bg-rose-soft-gradient">
    <div class="relative mx-auto h-64 max-w-7xl md:h-96">
      <img
        v-for="(slide, i) in slides"
        :key="slide.src"
        :src="slide.src"
        :alt="slide.alt"
        class="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none"
        :class="i === active ? 'opacity-100' : 'opacity-0'"
        :aria-hidden="i !== active"
      />
    </div>
    <div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
      <button
        v-for="(slide, i) in slides"
        :key="slide.src"
        type="button"
        class="h-2 rounded-full transition-all"
        :class="i === active ? 'w-6 bg-rose-500' : 'w-2 bg-white/70 hover:bg-white'"
        :aria-label="`Go to slide ${i + 1}: ${slide.alt}`"
        :aria-current="i === active"
        @click="active = i"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
const slides = [
  { src: '/banners/banner_1.jpg', alt: 'Featured promotion banner 1' },
  { src: '/banners/banner_2.jpg', alt: 'Featured promotion banner 2' },
  { src: '/banners/banner_3.jpg', alt: 'Featured promotion banner 3' }
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
