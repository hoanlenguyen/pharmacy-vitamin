<!--
  Maps to: main header on mint07.com
  3-zone layout: logo (left) — search + category-scope dropdown (center) — account/cart (right).
-->
<template>
  <header class="border-b border-gray-200 bg-white">
    <div class="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
      <!-- Logo -->
      <NuxtLink to="/" class="shrink-0" aria-label="Pharmacy Vitamin home">
        <div class="flex h-10 items-center gap-1.5 px-1">
          <Flower2 class="h-6 w-6 text-rose-500" aria-hidden="true" />
          <span class="font-display text-lg font-bold tracking-tight text-gray-900">
            Pharmacy<span class="text-rose-500">Vitamin</span>
          </span>
        </div>
      </NuxtLink>

      <!-- Search + category scope -->
      <form class="hidden flex-1 items-center md:flex" @submit.prevent="handleSearch">
        <select
          v-model="selectedCategory"
          aria-label="Search category"
          class="rounded-l-full border border-r-0 border-gray-300 bg-gray-50 py-2.5 pl-4 pr-8 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-400"
          @change="handleCategoryChange"
        >
          <option value="all">All Categories</option>
          <option v-for="cat in categories" :key="cat.slug" :value="cat.slug">{{ cat.label }}</option>
        </select>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search for products..."
          class="flex-1 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <button
          type="submit"
          aria-label="Search"
          class="flex items-center gap-1.5 rounded-r-full bg-rose-gradient px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Search class="h-4 w-4" aria-hidden="true" />
          Search
        </button>
      </form>

      <!-- Account + cart -->
      <div class="ml-auto flex shrink-0 items-center gap-5 text-sm">
        <NuxtLink to="/account" class="flex items-center gap-1.5 text-gray-700 transition-colors hover:text-rose-600">
          <User class="h-5 w-5" aria-hidden="true" />
          <span class="hidden lg:inline">My Account</span>
        </NuxtLink>
        <NuxtLink to="/cart" class="flex items-center gap-1.5 text-gray-700 transition-colors hover:text-rose-600">
          <span class="relative">
            <ShoppingBag class="h-5 w-5" aria-hidden="true" />
            <!-- ClientOnly: the count comes from the localStorage-backed cart store, which is
                 empty during SSR — rendering it only on the client avoids a hydration mismatch. -->
            <ClientOnly>
              <span
                v-if="cartCount > 0"
                class="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white"
              >
                {{ cartCount }}
              </span>
            </ClientOnly>
          </span>
          <span class="hidden lg:inline">Cart</span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Flower2, Search, ShoppingBag, User } from '@lucide/vue'

// Placeholder category list — replace with real taxonomy data.
const categories = [
  { label: 'Makeup', slug: 'makeup' },
  { label: 'Skin Care', slug: 'skin-care' },
  { label: 'Personal Care', slug: 'personal-care' },
  { label: 'Supplements', slug: 'supplements' },
  { label: 'Beauty Tools', slug: 'beauty-tools' }
]
const selectedCategory = ref('all')
const searchQuery = ref('')

// Picking a category alone (no search text) browses straight to that category's listing.
function handleCategoryChange() {
  if (selectedCategory.value !== 'all') {
    navigateTo(`/${selectedCategory.value}`)
  }
}

// Enter or clicking Search always goes to the search results page; if a
// category scope is selected it's carried along as a filter.
function handleSearch() {
  const query = searchQuery.value.trim()
  if (!query) return
  navigateTo({
    path: '/search',
    query: {
      q: query,
      ...(selectedCategory.value !== 'all' ? { category: selectedCategory.value } : {})
    }
  })
}

const { count: cartCount } = storeToRefs(useCartStore())
</script>
