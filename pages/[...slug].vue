<!--
  Catch-all mock page for every nav/footer link that doesn't have a real page yet
  (category listings, blog, account, and simple content/policy pages).
  Falls back to a generic "coming soon" mock for anything not in data/mockRoutes.ts.
-->
<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <nav class="mb-6 flex flex-wrap items-center gap-1 text-xs text-gray-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="transition-colors hover:text-rose-600">Home</NuxtLink>
      <template v-for="(crumb, i) in breadcrumbs" :key="crumb.path">
        <ChevronRight class="h-3 w-3 text-gray-300" aria-hidden="true" />
        <NuxtLink v-if="i < breadcrumbs.length - 1" :to="crumb.path" class="transition-colors hover:text-rose-600">
          {{ crumb.label }}
        </NuxtLink>
        <span v-else class="text-gray-700">{{ crumb.label }}</span>
      </template>
    </nav>

    <div class="mb-8 flex items-start gap-3">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <component :is="config.icon" class="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h1 class="font-display text-2xl font-bold text-gray-900">{{ pageTitle }}</h1>
        <p v-if="config.description" class="mt-1 text-sm text-gray-500">{{ config.description }}</p>
      </div>
    </div>

    <!-- Category: product grid -->
    <div v-if="config.type === 'category'" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <ProductCard v-for="product in categoryProducts" :key="product.slug ?? product.name" :product="product" />
    </div>

    <!-- Blog: article card grid -->
    <div v-else-if="config.type === 'blog'" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="post in blogPosts"
        :key="post.title"
        class="rounded-xl border border-gray-100 p-4 shadow-card transition-shadow hover:shadow-card-hover"
      >
        <div class="mb-3 flex h-32 items-center justify-center rounded-lg bg-rose-soft-gradient">
          <ImageIcon class="h-8 w-8 text-rose-300" aria-hidden="true" />
        </div>
        <p class="text-xs font-medium text-rose-600">{{ post.date }}</p>
        <h2 class="mt-1 text-sm font-semibold text-gray-800">{{ post.title }}</h2>
        <p class="mt-1 text-xs text-gray-500">{{ post.excerpt }}</p>
      </article>
    </div>

    <!-- Account: sign-in mock -->
    <div v-else-if="config.type === 'account'" class="mx-auto max-w-sm rounded-xl border border-gray-100 p-6 shadow-card">
      <p class="text-sm text-gray-600">Sign in to track orders, save favorites, and check out faster.</p>
      <form class="mt-4 space-y-3" @submit.prevent>
        <input
          type="email"
          placeholder="Email address"
          class="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <input
          type="password"
          placeholder="Password"
          class="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <button
          type="submit"
          class="w-full rounded-full bg-rose-gradient py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Sign In
        </button>
      </form>
      <p class="mt-4 text-center text-[11px] text-gray-400">Demo form — account features aren't wired up yet.</p>
    </div>

    <!-- Content: highlight list + optional contact CTA -->
    <div v-else class="max-w-2xl">
      <ul class="space-y-2">
        <li v-for="point in config.highlights" :key="point" class="flex items-start gap-2 text-sm text-gray-600">
          <Check class="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
          {{ point }}
        </li>
      </ul>

      <a
        v-if="config.contactEmail"
        :href="`mailto:${config.contactEmail}`"
        class="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90"
      >
        <Mail class="h-4 w-4" aria-hidden="true" />
        Contact Us
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, ChevronRight, Image as ImageIcon, Mail } from '@lucide/vue'
import { getMockRouteConfig, humanize } from '~/data/mockRoutes'
import type { Product } from '~/components/ProductCard.vue'

const route = useRoute()

const segments = computed(() => {
  const raw = route.params.slug
  const list = Array.isArray(raw) ? raw : [raw]
  return list.filter((segment): segment is string => Boolean(segment))
})

const breadcrumbs = computed(() => {
  let path = ''
  return segments.value.map(segment => {
    path += `/${segment}`
    return { label: humanize(segment), path }
  })
})

const config = computed(() => getMockRouteConfig(segments.value[0] ?? ''))
const pageTitle = computed(() => humanize(segments.value[segments.value.length - 1] ?? 'Page'))

useHead({ title: computed(() => `${pageTitle.value} — Pharmacy Vitamin`) })

// Try the deepest segment as a real category slug first (e.g. skin-care/moisturizing/masks -> "masks").
// Nav items like "Flash Deals"/"Combos"/"Clearance" aren't real categories, so when that filter
// comes back empty, fall back to the general pool sorted by biggest discount.
const { data: categoryProducts } = await useAsyncData<Product[]>(
  computed(() => `category-products-${segments.value.join('-') || 'none'}`),
  async () => {
    if (config.value.type !== 'category') return []
    const lastSegment = segments.value[segments.value.length - 1]
    const primary = await $fetch<{ items: Product[] }>('/api/products', { query: { category: lastSegment, limit: 15 } })
    if (primary.items.length > 0) return primary.items
    const fallback = await $fetch<{ items: Product[] }>('/api/products', { query: { sort: 'discount', limit: 15 } })
    return fallback.items
  },
  { watch: [segments] }
)

// TODO: replace with real posts once a blog/CMS exists.
const blogPosts = [
  {
    title: '5 Ingredients to Look for in a Repair-Focused Sheet Mask',
    date: 'Jan 2026',
    excerpt: 'A quick guide to the actives that actually help stressed, post-treatment skin recover faster.'
  },
  {
    title: 'How to Build a Simple 4-Step Skincare Routine',
    date: 'Jan 2026',
    excerpt: 'Cleanse, treat, moisturize, protect — the essentials, without the 10-step overwhelm.'
  },
  {
    title: 'Sunscreen Myths, Debunked',
    date: 'Dec 2025',
    excerpt: "SPF50 isn't just for summer. Here's what actually matters when picking a daily sunscreen."
  }
]
</script>
