<!--
  Reusable +/- quantity stepper used on the product detail page and cart line items.
-->
<template>
  <div class="inline-flex items-center rounded-full border border-gray-300">
    <button
      type="button"
      aria-label="Decrease quantity"
      class="flex h-9 w-9 items-center justify-center rounded-l-full text-gray-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="modelValue <= min"
      @click="update(modelValue - 1)"
    >
      <Minus class="h-3.5 w-3.5" aria-hidden="true" />
    </button>
    <input
      type="number"
      :value="modelValue"
      :min="min"
      :aria-label="ariaLabel ?? 'Quantity'"
      class="h-9 w-12 border-x border-gray-300 text-center text-sm tabular-nums focus:outline-none"
      @change="onInput"
    />
    <button
      type="button"
      aria-label="Increase quantity"
      class="flex h-9 w-9 items-center justify-center rounded-r-full text-gray-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
      @click="update(modelValue + 1)"
    >
      <Plus class="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Minus, Plus } from '@lucide/vue'

const props = withDefaults(
  defineProps<{ modelValue: number; min?: number; ariaLabel?: string }>(),
  { min: 1 }
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

function update(value: number) {
  emit('update:modelValue', Math.max(props.min, value))
}

function onInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  update(Number.isFinite(value) ? value : props.min)
}
</script>
