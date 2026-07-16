<!--
  Type-to-filter select — used for Province/Ward on the checkout page instead of a plain
  <select>, since the ward list can run to 30+ entries per province. Diacritic-insensitive
  (typing "ha noi" matches "Hà Nội") so it's usable without a Vietnamese keyboard. A
  selection only "commits" when an option is clicked/Enter-ed; typing without picking one
  reverts to the last real selection on blur, so modelValue always names a real option.
-->
<template>
  <div class="relative">
    <input
      v-model="query"
      type="text"
      autocomplete="off"
      :placeholder="disabled ? (disabledPlaceholder ?? placeholder) : placeholder"
      :disabled="disabled"
      class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:bg-gray-100 disabled:text-gray-400"
      @focus="handleFocus"
      @input="handleInput"
      @keydown.down.prevent="moveHighlight(1)"
      @keydown.up.prevent="moveHighlight(-1)"
      @keydown.enter.prevent="selectHighlighted"
      @keydown.escape="isOpen = false"
      @blur="handleBlur"
    />
    <button
      v-if="modelValue && !disabled"
      type="button"
      aria-label="Clear selection"
      class="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 hover:text-rose-600"
      @mousedown.prevent="clearSelection"
    >
      <X class="h-4 w-4" aria-hidden="true" />
    </button>

    <ul
      v-if="isOpen && filteredOptions.length"
      class="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-pop"
    >
      <li
        v-for="(option, index) in filteredOptions"
        :key="option.value"
        class="cursor-pointer px-3 py-1.5"
        :class="index === highlightedIndex ? 'bg-rose-50 text-rose-700' : 'text-gray-700 hover:bg-gray-50'"
        @mousedown.prevent="selectOption(option)"
        @mouseenter="highlightedIndex = index"
      >
        {{ option.label }}
      </li>
    </ul>
    <p
      v-else-if="isOpen && query && !disabled"
      class="absolute z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-400 shadow-pop"
    >
      No matches
    </p>
  </div>
</template>

<script setup lang="ts">
import { X } from '@lucide/vue'

type Option = { value: string; label: string }

const props = defineProps<{
  modelValue: string
  options: Option[]
  placeholder?: string
  disabledPlaceholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const query = ref('')
const isOpen = ref(false)
const highlightedIndex = ref(0)

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
}

const selectedOption = computed(() => props.options.find(o => o.value === props.modelValue))

// Keep the visible text in sync when the selection changes from outside (e.g. resetting
// the ward when the province changes) or when the option list itself loads.
watch(
  () => [props.modelValue, props.options] as const,
  () => {
    query.value = selectedOption.value?.label ?? ''
  },
  { immediate: true }
)

const filteredOptions = computed(() => {
  const q = normalize(query.value.trim())
  const matches = q ? props.options.filter(o => normalize(o.label).includes(q)) : props.options
  return matches.slice(0, 50)
})

function handleFocus() {
  if (props.disabled) return
  isOpen.value = true
  highlightedIndex.value = 0
}

function handleInput() {
  if (props.disabled) return
  isOpen.value = true
  highlightedIndex.value = 0
  // Note: modelValue is deliberately left untouched here — clearing it would retrigger the
  // modelValue/options watcher above and stomp the text the user is mid-typing. The stale
  // selection is harmless until either a new option is picked (selectOption) or the field is
  // left without a match (handleBlur reverts the text to match the real selection again).
}

function moveHighlight(delta: number) {
  if (!isOpen.value || !filteredOptions.value.length) return
  const max = filteredOptions.value.length - 1
  highlightedIndex.value = Math.min(max, Math.max(0, highlightedIndex.value + delta))
}

function selectHighlighted() {
  const option = filteredOptions.value[highlightedIndex.value]
  if (option) selectOption(option)
}

function selectOption(option: Option) {
  emit('update:modelValue', option.value)
  query.value = option.label
  isOpen.value = false
}

function clearSelection() {
  emit('update:modelValue', '')
  query.value = ''
}

function handleBlur() {
  // Give a mousedown-selected option's @mousedown.prevent time to fire first.
  setTimeout(() => {
    isOpen.value = false
    query.value = selectedOption.value?.label ?? ''
  }, 100)
}
</script>
