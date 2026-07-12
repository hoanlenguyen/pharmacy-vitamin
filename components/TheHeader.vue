<!--
  Maps to: main header on mint07.com
  3-zone layout: logo (left) — search + category-scope dropdown (center) — account/cart (right).
-->
<template>
  <header class="border-b border-gray-200 bg-white">
    <div class="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
      <!-- Logo -->
      <NuxtLink to="/" class="shrink-0">
        <div class="flex h-10 w-32 items-center justify-center rounded bg-mint-100 text-sm font-semibold text-mint-700">
          LOGO
        </div>
      </NuxtLink>

      <!-- Search + category scope -->
      <div class="hidden flex-1 items-center md:flex">
        <select
          v-model="selectedCategory"
          class="rounded-l border border-r-0 border-gray-300 bg-gray-50 py-2 pl-3 pr-8 text-sm text-gray-600 focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <input
          type="text"
          placeholder="Search for products..."
          class="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none"
        />
        <button class="rounded-r bg-mint-600 px-4 py-2 text-sm font-medium text-white hover:bg-mint-700">
          Search
        </button>
      </div>

      <!-- Account + cart -->
      <div class="ml-auto flex shrink-0 items-center gap-5 text-sm">
        <NuxtLink to="/account" class="flex items-center gap-1 text-gray-700 hover:text-mint-700">
          <span>My Account</span>
        </NuxtLink>
        <NuxtLink to="/cart" class="flex items-center gap-1 text-gray-700 hover:text-mint-700">
          <span>Cart</span>
          <span class="rounded-full bg-mint-600 px-2 py-0.5 text-xs text-white">0</span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Placeholder category list — replace with real taxonomy data.
const categories = ['Makeup', 'Skin Care', 'Personal Care', 'Supplements', 'Beauty Tools']
const selectedCategory = ref('all')
</script>
