<!--
  Search results — /search?q=<text>&category=<slug>&page=<n>&limit=&sort=&minPrice=&maxPrice=.
  Reached from TheHeader's search form (Enter or the Search button). Layout mirrors
  mint07.com/?s=...'s archive page: price filter + category sidebar, sort/show/view toolbar,
  and a Recently Viewed widget.
-->
<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <nav class="mb-6 flex items-center gap-1 text-xs text-gray-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="transition-colors hover:text-rose-600">Home</NuxtLink>
      <ChevronRight class="h-3 w-3 text-gray-300" aria-hidden="true" />
      <span class="text-gray-700">Search</span>
    </nav>

    <div class="mb-6 flex items-center gap-3">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <SearchIcon class="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h1 v-if="query" class="font-display text-2xl font-bold text-gray-900">Search results for "{{ query }}"</h1>
        <p class="mt-1 flex items-center gap-2 text-sm text-gray-500">
          <span>{{ pending ? 'Searching…' : `${total} result${total === 1 ? '' : 's'}` }}</span>
          <span
            v-if="categoryFilter"
            class="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-600"
          >
            in {{ humanize(categoryFilter) }}
            <button type="button" aria-label="Remove category filter" class="hover:text-rose-800" @click="setCategory(undefined)">
              <X class="h-3 w-3" aria-hidden="true" />
            </button>
          </span>
        </p>
      </div>
    </div>

    <form class="mb-6 flex max-w-xl" @submit.prevent="handleSearchSubmit">
      <input
        v-model="searchText"
        type="text"
        placeholder="Search for products..."
        aria-label="Search for products"
        class="flex-1 rounded-l-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
      />
      <button
        type="submit"
        aria-label="Search"
        class="flex items-center gap-1.5 rounded-r-full bg-rose-gradient px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <SearchIcon class="h-4 w-4" aria-hidden="true" />
        Search
      </button>
    </form>

    <div class="flex flex-col gap-6 lg:flex-row">
      <aside class="w-full shrink-0 space-y-6 lg:w-64">
        <button
          v-if="hasActiveFilters"
          type="button"
          class="flex items-center gap-1.5 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
          @click="resetFilters"
        >
          <RotateCcw class="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </button>

        <PriceRangeFilter
          v-if="priceBounds.max > priceBounds.min"
          :min="priceBounds.min"
          :max="priceBounds.max"
          :low="activeMinPrice"
          :high="activeMaxPrice"
          @apply="applyPriceFilter"
        />

        <div class="rounded-xl border border-gray-100 p-4 shadow-card">
          <h2 class="mb-3 font-display text-sm font-bold text-gray-900">Browse Categories</h2>
          <ul class="space-y-1">
            <li>
              <button
                type="button"
                class="w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors"
                :class="!categoryFilter ? 'bg-rose-50 font-medium text-rose-700' : 'text-gray-600 hover:bg-rose-50/60 hover:text-rose-600'"
                @click="setCategory(undefined)"
              >
                All Categories
              </button>
            </li>
            <li v-for="cat in flatCategories" :key="cat.slug">
              <button
                type="button"
                :style="{ paddingLeft: `${8 + cat.depth * 14}px` }"
                class="flex w-full items-center justify-between rounded-lg py-1.5 pr-2 text-left text-sm transition-colors"
                :class="categoryFilter === cat.slug ? 'bg-rose-50 font-medium text-rose-700' : 'text-gray-600 hover:bg-rose-50/60 hover:text-rose-600'"
                @click="setCategory(cat.slug)"
              >
                <span class="truncate">{{ cat.name }}</span>
                <span class="shrink-0 text-xs text-gray-400">({{ cat.productCount }})</span>
              </button>
            </li>
          </ul>
        </div>

        <RecentlyViewedWidget />
      </aside>

      <div class="min-w-0 flex-1">
        <ProductToolbar
          :sort="sort"
          :per-page="perPage"
          :view="view"
          :page="page"
          :total-pages="totalPages"
          @update:sort="setSort"
          @update:per-page="setPerPage"
          @update:view="view = $event"
          @update:page="goToPage"
        />

        <p v-if="!pending && products.length === 0" class="text-sm text-gray-400">
          No products match "{{ query }}". Try a different search term.
        </p>

        <div v-else :class="view === 'grid' ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4' : 'flex flex-col gap-3'">
          <ProductCard v-for="product in products" :key="product.slug ?? product.name" :product="product" :layout="view" />
        </div>

        <Pagination :page="page" :total-pages="totalPages" @update:page="goToPage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, RotateCcw, Search as SearchIcon, X } from '@lucide/vue'
import { humanize } from '~/data/mockRoutes'
import type { Product } from '~/components/ProductCard.vue'

type CategoryNode = { slug: string; name: string; productCount: number; children: CategoryNode[] }
type ProductsResponse = { items: Product[]; total: number; priceBounds: { min: number; max: number } }

const route = useRoute()

const query = computed(() => String(route.query.q ?? ''))
const categoryFilter = computed(() => (typeof route.query.category === 'string' ? route.query.category : undefined))
const page = computed(() => Math.max(1, Number(route.query.page ?? 1) || 1))
const perPage = computed(() => Number(route.query.limit ?? 16) || 16)
const sort = computed(() => (typeof route.query.sort === 'string' ? route.query.sort : ''))
const minPriceQuery = computed(() => (route.query.minPrice !== undefined ? Number(route.query.minPrice) : undefined))
const maxPriceQuery = computed(() => (route.query.maxPrice !== undefined ? Number(route.query.maxPrice) : undefined))
const view = ref<'grid' | 'list'>('grid')
const searchText = ref(query.value)

watch(query, value => {
  searchText.value = value
})

useHead({ title: computed(() => `Search: ${query.value} — Pharmacy Vitamin`) })

const { data, pending } = await useFetch<ProductsResponse>('/api/products', {
  query: computed(() => ({
    q: query.value,
    category: categoryFilter.value,
    limit: perPage.value,
    offset: (page.value - 1) * perPage.value,
    sort: sort.value || undefined,
    minPrice: minPriceQuery.value,
    maxPrice: maxPriceQuery.value
  }))
})

const products = computed(() => data.value?.items ?? [])
const total = computed(() => data.value?.total ?? 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))
const priceBounds = computed(() => data.value?.priceBounds ?? { min: 0, max: 0 })
const activeMinPrice = computed(() => minPriceQuery.value ?? priceBounds.value.min)
const activeMaxPrice = computed(() => maxPriceQuery.value ?? priceBounds.value.max)

const { data: categoriesData } = await useFetch<{ categories: CategoryNode[] }>('/api/categories')

const flatCategories = computed(() => {
  const out: { slug: string; name: string; productCount: number; depth: number }[] = []
  function walk(nodes: CategoryNode[], depth: number) {
    for (const node of nodes) {
      out.push({ slug: node.slug, name: node.name, productCount: node.productCount, depth })
      if (node.children.length) walk(node.children, depth + 1)
    }
  }
  walk(categoriesData.value?.categories ?? [], 0)
  return out
})

// Builds a clean query object (drops undefined/empty values rather than relying on the
// router to strip them) so removing a filter actually removes it from the URL.
function buildQuery(overrides: Record<string, string | number | undefined>) {
  const merged: Record<string, string> = {}
  for (const [key, value] of Object.entries({ ...route.query, ...overrides })) {
    const resolved = Array.isArray(value) ? value[0] : value
    if (resolved === undefined || resolved === null || resolved === '') continue
    merged[key] = String(resolved)
  }
  return merged
}

function setCategory(slug: string | undefined) {
  navigateTo({ path: '/search', query: buildQuery({ category: categoryFilter.value === slug ? undefined : slug, page: 1 }) })
}

function setSort(nextSort: string) {
  navigateTo({ path: '/search', query: buildQuery({ sort: nextSort || undefined, page: 1 }) })
}

function setPerPage(nextPerPage: number) {
  navigateTo({ path: '/search', query: buildQuery({ limit: nextPerPage, page: 1 }) })
}

function applyPriceFilter({ min, max }: { min: number; max: number }) {
  const isFullRange = min <= priceBounds.value.min && max >= priceBounds.value.max
  navigateTo({
    path: '/search',
    query: buildQuery({ minPrice: isFullRange ? undefined : min, maxPrice: isFullRange ? undefined : max, page: 1 })
  })
}

function goToPage(nextPage: number) {
  navigateTo({ path: '/search', query: buildQuery({ page: nextPage }) })
}

function handleSearchSubmit() {
  const trimmed = searchText.value.trim()
  if (!trimmed) return
  navigateTo({ path: '/search', query: buildQuery({ q: trimmed, page: 1 }) })
}

const hasActiveFilters = computed(
  () =>
    Boolean(
      query.value || categoryFilter.value || minPriceQuery.value !== undefined || maxPriceQuery.value !== undefined || sort.value
    ) || perPage.value !== 16
)

// Full "clear all" — drops the search text along with every filter/sort/paging override.
function resetFilters() {
  searchText.value = ''
  navigateTo({ path: '/search', query: {} })
  view.value = 'grid'
}
</script>
