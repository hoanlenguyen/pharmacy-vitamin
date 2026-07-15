<!--
  Floating circular contact buttons (Messenger + Zalo), fixed to the bottom-right corner
  on every public page — a common pattern on Vietnamese e-commerce sites like mint07.com.
-->
<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
    <!-- TODO: replace with m.me/<page-username> once the Facebook Page handle is set up. -->
    <a
      href="#"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on Messenger"
      title="Chat on Messenger"
      class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#00B2FF] to-[#006AFF] text-white shadow-pop transition-transform hover:scale-105"
    >
      <MessageCircle class="h-6 w-6" aria-hidden="true" />
    </a>

    <a
      :href="zaloLink"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`Chat on Zalo: ${phone}`"
      :title="`Chat on Zalo: ${phone}`"
      class="flex h-14 w-14 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-pop transition-transform hover:scale-105"
    >
      <Phone class="h-6 w-6" aria-hidden="true" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { MessageCircle, Phone } from '@lucide/vue'

const phone = '0900 000 000'
const zaloLink = computed(() => `https://zalo.me/${phone.replace(/\s+/g, '')}`)
</script>
