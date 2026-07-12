<!--
  Maps to: top utility/announcement ticker on mint07.com
  Rotating tagline (left) + click-to-call phone numbers (right).
-->
<template>
  <div class="flex w-full items-center justify-between bg-mint-600 px-4 py-1.5 text-xs text-white">
    <div class="flex-1 overflow-hidden">
      <p class="animate-pulse truncate">
        {{ messages[activeIndex] }}
      </p>
    </div>
    <div class="hidden shrink-0 gap-4 sm:flex">
      <a v-for="phone in phones" :key="phone" :href="`tel:${phone}`" class="hover:underline">
        {{ phone }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
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
