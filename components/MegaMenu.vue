<!--
  Maps to: main horizontal category nav on mint07.com
  Flash Deals, Combos, Brands, Membership, and Blog are fixed nav items; everything between
  them is the real category tree from /api/categories, filtered to showInMenu (toggled from
  Admin > Categories). A category with visible children gets a flat dropdown of them
  (recursively flattened, indented by depth); one with none is a plain link.
-->
<template>
  <nav class="relative border-b border-gray-200 bg-white">
    <ul class="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 text-sm font-medium">
      <li
        v-for="item in items"
        :key="item.label"
        class="relative"
        @mouseenter="openItem = item.label"
        @mouseleave="openItem = null"
      >
        <NuxtLink
          :to="item.to"
          class="block px-3 py-3 text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          {{ item.label }}
        </NuxtLink>

        <Transition name="drop">
          <div
            v-if="item.links?.length && openItem === item.label"
            class="absolute left-0 top-full z-20 min-w-[200px] rounded-b-xl border border-gray-200 bg-white py-2 shadow-pop"
          >
            <NuxtLink
              v-for="link in item.links"
              :key="link.label"
              :to="link.to"
              :style="{ paddingLeft: `${16 + link.depth * 14}px` }"
              class="block py-2 pr-4 text-sm text-gray-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </Transition>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
type SimpleLink = { label: string; to: string; depth: number }
type NavItem = { label: string; to: string; links?: SimpleLink[] }

type CategoryNode = { slug: string; name: string; showInMenu: boolean; children: CategoryNode[] }

const { data } = await useFetch<{ categories: CategoryNode[] }>('/api/categories')

// Recursively flattens a category's visible descendants into an indented link list for its
// dropdown — skips a node (and everything under it) once showInMenu is off.
function flattenChildren(nodes: CategoryNode[], depth = 0): SimpleLink[] {
  return nodes
    .filter(node => node.showInMenu)
    .flatMap(node => [{ label: node.name, to: `/${node.slug}`, depth }, ...flattenChildren(node.children, depth + 1)])
}

const categoryItems = computed<NavItem[]>(() =>
  (data.value?.categories ?? [])
    .filter(cat => cat.showInMenu)
    .map(cat => ({ label: cat.name, to: `/${cat.slug}`, links: flattenChildren(cat.children) }))
)

// Fixed items, per product requirements — not database-driven.
const itemsBefore: NavItem[] = [
  { label: 'Flash Deals', to: '/flash-deals' },
  { label: 'Combos', to: '/combos' }
]
const itemsAfter: NavItem[] = [
  { label: 'Brands', to: '/brands' },
  { label: 'Membership', to: '/membership' },
  {
    label: 'Blog',
    to: '/blog',
    links: [
      { label: 'News', to: '/blog/news', depth: 0 },
      { label: 'Reviews', to: '/blog/reviews', depth: 0 },
      { label: 'Skincare Tips', to: '/blog/skincare-tips', depth: 0 }
    ]
  }
]

const items = computed<NavItem[]>(() => [...itemsBefore, ...categoryItems.value, ...itemsAfter])

const openItem = ref<string | null>(null)
</script>

<style scoped>
.drop-enter-active,
.drop-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .drop-enter-active,
  .drop-leave-active {
    transition: none;
  }
}
</style>
