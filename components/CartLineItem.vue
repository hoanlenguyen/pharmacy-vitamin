<!--
  Maps to: a single row in the cart table on mint07.com/cart/
  (remove, thumbnail, name, unit price, quantity stepper, line subtotal).
-->
<template>
  <div class="flex flex-wrap items-center gap-4 border-b border-gray-100 py-4 last:border-b-0 sm:flex-nowrap">
    <button
      type="button"
      :aria-label="`Remove ${line.name} from cart`"
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
      @click="$emit('remove', line.id)"
    >
      <X class="h-4 w-4" aria-hidden="true" />
    </button>

    <component
      :is="line.slug ? NuxtLink : 'div'"
      :to="line.slug ? `/products/${line.slug}` : undefined"
      class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-rose-soft-gradient"
    >
      <ImageIcon class="h-6 w-6 text-rose-300" aria-hidden="true" />
    </component>

    <div class="min-w-[10rem] flex-1">
      <component
        :is="line.slug ? NuxtLink : 'p'"
        :to="line.slug ? `/products/${line.slug}` : undefined"
        class="text-sm font-medium text-gray-800 transition-colors hover:text-rose-600"
      >
        {{ line.name }}
      </component>
      <p class="mt-0.5 text-xs text-gray-400">{{ formatCurrency(line.price) }} each</p>
    </div>

    <QuantityStepper
      :model-value="line.quantity"
      :aria-label="`${line.name} quantity`"
      @update:model-value="value => $emit('update-quantity', line.id, value)"
    />

    <p class="w-24 shrink-0 text-right text-sm font-semibold text-rose-600">
      {{ formatCurrency(line.price * line.quantity) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { Image as ImageIcon, X } from '@lucide/vue'
import { resolveComponent } from 'vue'
import type { CartLine } from '~/stores/cart'

defineProps<{ line: CartLine }>()
defineEmits<{ remove: [id: string]; 'update-quantity': [id: string, quantity: number] }>()

const NuxtLink = resolveComponent('NuxtLink')

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}
</script>
