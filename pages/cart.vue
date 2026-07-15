<!--
  Maps to: mint07.com/cart/ — line items table + coupon field + cart totals sidebar,
  with an empty-cart state when there are no items.
-->
<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <nav class="mb-6 flex items-center gap-1 text-xs text-gray-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="transition-colors hover:text-rose-600">Home</NuxtLink>
      <ChevronRight class="h-3 w-3 text-gray-300" aria-hidden="true" />
      <span class="text-gray-700">Cart</span>
    </nav>

    <h1 class="mb-6 font-display text-2xl font-bold text-gray-900">Your Cart</h1>

    <div v-if="items.length" class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div class="rounded-xl border border-gray-100 p-4 shadow-card lg:col-span-2">
        <CartLineItem
          v-for="line in items"
          :key="line.id"
          :line="line"
          @remove="removeItem"
          @update-quantity="updateQuantity"
        />
      </div>

      <div class="lg:col-span-1">
        <div class="rounded-xl border border-gray-100 p-5 shadow-card">
          <h2 class="font-display text-sm font-bold uppercase tracking-wide text-gray-900">Cart Totals</h2>

          <div class="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span class="font-medium text-gray-800">{{ formatCurrency(subtotal) }}</span>
          </div>
          <div class="mt-2 flex items-center justify-between text-sm text-gray-600">
            <span>Shipping</span>
            <span class="text-gray-400">Calculated at checkout</span>
          </div>

          <div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <span class="font-display text-sm font-bold text-gray-900">Total</span>
            <span class="font-display text-xl font-bold text-rose-600">{{ formatCurrency(subtotal) }}</span>
          </div>

          <NuxtLink
            to="/checkout"
            class="mt-5 flex items-center justify-center gap-2 rounded-full bg-rose-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90"
          >
            <Lock class="h-4 w-4" aria-hidden="true" />
            Proceed to Checkout
          </NuxtLink>

          <NuxtLink to="/" class="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-rose-600 hover:underline">
            <ArrowLeft class="h-3.5 w-3.5" aria-hidden="true" />
            Continue Shopping
          </NuxtLink>
        </div>

        <form class="mt-4 flex overflow-hidden rounded-full border border-gray-300" @submit.prevent>
          <input
            type="text"
            placeholder="Coupon code"
            class="flex-1 px-4 py-2 text-sm focus:outline-none"
          />
          <button
            type="submit"
            class="shrink-0 bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-600"
          >
            Apply
          </button>
        </form>
      </div>
    </div>

    <div v-else class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-rose-200 bg-rose-50/40 py-20 text-center">
      <ShoppingBag class="h-10 w-10 text-rose-300" aria-hidden="true" />
      <p class="font-display text-lg font-bold text-gray-900">Your cart is empty</p>
      <p class="text-sm text-gray-500">Looks like you haven't added anything yet.</p>
      <NuxtLink
        to="/"
        class="mt-2 rounded-full bg-rose-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90"
      >
        Continue Shopping
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ChevronRight, Lock, ShoppingBag } from '@lucide/vue'

useHead({ title: 'Your Cart — Pharmacy Vitamin' })

const { items, removeItem, updateQuantity, subtotal } = useCart()

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}
</script>
