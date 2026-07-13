<!--
  Maps to: top utility/announcement ticker on mint07.com
  Rotating tagline (left) + click-to-call phone numbers (right).
-->
<template>
  <div class="flex w-full items-center justify-between bg-rose-gradient px-4 py-2 text-xs text-white">
    <div class="flex flex-1 items-center gap-2 overflow-hidden">
      <Sparkles class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <Transition name="fade" mode="out-in">
        <p :key="activeIndex" class="truncate">
          {{ messages[activeIndex] }}
        </p>
      </Transition>
    </div>
    <div class="hidden shrink-0 gap-4 sm:flex">
      <a
        v-for="phone in phones"
        :key="phone"
        :href="`tel:${phone}`"
        class="flex items-center gap-1.5 hover:underline"
      >
        <Phone class="h-3.5 w-3.5" aria-hidden="true" />
        {{ phone }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Phone, Sparkles } from '@lucide/vue'

// Replace with real messages / phone numbers, or wire up to a CMS field.
const messages = [
  'Free shipping over a set order value',
  'Authentic products, nationwide warranty',
  'Cash on delivery available',
  'Flexible returns within 14 days'
]
const phones = ['0900 000 000', '0900 000 001']

const activeIndex = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % messages.length
  }, 4000)
})
onBeforeUnmount(() => timer && clearInterval(timer))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
