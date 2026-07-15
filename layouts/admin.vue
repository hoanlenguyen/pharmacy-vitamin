<!--
  Minimal chrome for internal admin tooling — no announcement bar, mega-menu,
  or footer from the storefront layout. Sidebar only shows once signed in
  (hidden on /admin/login).
-->
<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <header class="border-b border-gray-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
        <NuxtLink to="/admin" class="flex items-center gap-1.5 font-display text-lg font-bold text-gray-900">
          <Flower2 class="h-5 w-5 text-rose-500" aria-hidden="true" />
          Pharmacy<span class="text-rose-500">Vitamin</span>
          <span class="ml-1 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Admin</span>
        </NuxtLink>

        <div class="ml-auto flex items-center gap-4 text-sm">
          <NuxtLink to="/" class="flex items-center gap-1.5 text-gray-500 transition-colors hover:text-rose-600">
            <Store class="h-4 w-4" aria-hidden="true" />
            View Store
          </NuxtLink>
          <button
            v-if="isAuthenticated"
            type="button"
            class="flex items-center gap-1.5 text-gray-500 transition-colors hover:text-rose-600"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" aria-hidden="true" />
            Log Out
          </button>
        </div>
      </div>
    </header>

    <div class="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-8">
      <aside v-if="isAuthenticated" class="w-48 shrink-0">
        <nav class="space-y-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="isActive(item) ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-100'"
          >
            <component :is="item.icon" class="h-4 w-4" aria-hidden="true" />
            {{ item.label }}
          </NuxtLink>
        </nav>
      </aside>

      <div class="min-w-0 flex-1">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Award, Flower2, Gift, Layers, LogOut, Package, Receipt, Store, Users, Zap } from '@lucide/vue'

const { isAuthenticated, logout } = useAdminAuth()
const route = useRoute()

const navItems = [
  { label: 'Products', to: '/admin', icon: Package, prefix: '/admin/products' },
  { label: 'Brands', to: '/admin/brands', icon: Award, prefix: '/admin/brands' },
  { label: 'Categories', to: '/admin/categories', icon: Layers, prefix: '/admin/categories' },
  { label: 'Flash Deals', to: '/admin/flash-deals', icon: Zap, prefix: '/admin/flash-deals' },
  { label: 'Combos', to: '/admin/combos', icon: Gift, prefix: '/admin/combos' },
  { label: 'Orders', to: '/admin/orders', icon: Receipt, prefix: '/admin/orders' },
  { label: 'Users', to: '/admin/users', icon: Users, prefix: '/admin/users' }
]

function isActive(item: (typeof navItems)[number]) {
  return route.path === item.to || route.path.startsWith(item.prefix)
}

async function handleLogout() {
  logout()
  await navigateTo('/admin/login')
}
</script>
