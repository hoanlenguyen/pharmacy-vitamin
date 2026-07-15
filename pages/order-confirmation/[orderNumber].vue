<!--
  Post-checkout "thank you" page — /order-confirmation/:orderNumber. Reads the just-placed
  order back from /api/orders/:orderNumber (public lookup, no auth) so it can be reloaded
  or shared without needing the cart to still be in localStorage.
-->
<template>
  <div class="mx-auto max-w-5xl px-4 py-8">
    <nav class="mb-6 flex items-center gap-1 text-xs text-gray-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="transition-colors hover:text-rose-600">Home</NuxtLink>
      <ChevronRight class="h-3 w-3 text-gray-300" aria-hidden="true" />
      <span class="text-gray-700">Order Confirmation</span>
    </nav>

    <p v-if="pending" class="text-sm text-gray-400">Loading…</p>

    <div v-else-if="!order" class="flex flex-col items-center gap-3 py-24 text-center">
      <PackageSearch class="h-10 w-10 text-rose-300" aria-hidden="true" />
      <p class="font-display text-lg font-bold text-gray-900">Order not found</p>
      <NuxtLink to="/" class="text-sm font-medium text-rose-600 hover:underline">Back to shop</NuxtLink>
    </div>

    <template v-else>
      <div class="flex flex-col items-center gap-2 py-4 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 class="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 class="font-display text-2xl font-bold text-gray-900">Thank you — your order is in!</h1>
        <p class="text-sm text-gray-500">We've recorded order <span class="font-semibold text-gray-700">{{ order.orderNumber }}</span> and will be in touch soon.</p>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-gray-100 p-5 shadow-card sm:grid-cols-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-400">Order Number</p>
          <p class="mt-1 text-sm font-semibold text-gray-800">{{ order.orderNumber }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-400">Date</p>
          <p class="mt-1 text-sm font-semibold text-gray-800">{{ formattedDate }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-400">Status</p>
          <StatusBadge :status="order.status" class="mt-1" />
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-400">Payment Method</p>
          <p class="mt-1 text-sm font-semibold text-gray-800">{{ paymentMethodLabel }}</p>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <h2 class="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gray-900">Order Details</h2>
          <div class="rounded-xl border border-gray-100 p-4 shadow-card">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2 text-sm font-semibold text-gray-900">
              <span>Product</span>
              <span>Total</span>
            </div>
            <div v-for="item in order.items" :key="item.id" class="flex items-start justify-between gap-3 border-b border-gray-100 py-3 text-sm text-gray-600 last:border-b-0">
              <component
                :is="item.productSlug ? NuxtLink : 'span'"
                :to="item.productSlug ? `/products/${item.productSlug}` : undefined"
                class="transition-colors"
                :class="item.productSlug ? 'hover:text-rose-600' : ''"
              >
                {{ item.productName }} <span class="text-gray-400">× {{ item.quantity }}</span>
              </component>
              <span class="shrink-0 font-medium text-gray-800">{{ formatCurrency(item.lineTotal) }}</span>
            </div>

            <div class="mt-2 flex items-center justify-between pt-2 text-sm text-gray-600">
              <span>Subtotal</span>
              <span class="font-medium text-gray-800">{{ formatCurrency(order.subtotal) }}</span>
            </div>
            <div class="mt-2 flex items-center justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span class="font-medium text-gray-800">{{ order.shippingFee === 0 ? 'Free' : formatCurrency(order.shippingFee) }}</span>
            </div>
            <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <span class="font-display text-sm font-bold text-gray-900">Total</span>
              <span class="font-display text-xl font-bold text-rose-600">{{ formatCurrency(order.total) }}</span>
            </div>
          </div>

          <p v-if="order.paymentMethod === 'bank_transfer'" class="mt-4 rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
            Please transfer the total above to our bank account, using <span class="font-semibold text-gray-700">{{ order.orderNumber }}</span> as the payment reference. Your order will ship once the funds have cleared.
          </p>
          <p v-else class="mt-4 rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
            Please have the total above ready in cash when your order arrives.
          </p>
        </div>

        <div class="lg:col-span-1">
          <h2 class="mb-3 font-display text-sm font-bold uppercase tracking-wide text-gray-900">Shipping To</h2>
          <div class="rounded-xl border border-gray-100 p-4 shadow-card text-sm text-gray-600">
            <p class="font-semibold text-gray-800">{{ order.shippingName }}</p>
            <p class="mt-1">{{ order.shippingLine1 }}</p>
            <p v-if="order.shippingLine2">{{ order.shippingLine2 }}</p>
            <p>{{ [order.shippingCity, order.shippingRegion].filter(Boolean).join(', ') }}</p>
            <p v-if="order.shippingPostalCode">{{ order.shippingPostalCode }}</p>
            <p>{{ order.shippingCountry }}</p>
            <p class="mt-2 text-gray-500">{{ order.shippingPhone }}</p>
          </div>

          <p v-if="order.notes" class="mt-4 text-xs text-gray-500">
            <span class="font-semibold text-gray-700">Order notes:</span> {{ order.notes }}
          </p>
        </div>
      </div>

      <div class="mt-8 flex justify-center">
        <NuxtLink to="/" class="rounded-full bg-rose-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90">
          Continue Shopping
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, ChevronRight, PackageSearch } from '@lucide/vue'
import { resolveComponent } from 'vue'

type OrderDetail = {
  orderNumber: string
  status: string
  subtotal: number
  shippingFee: number
  total: number
  paymentMethod: 'bank_transfer' | 'cod'
  placedAt: string
  shippingName: string
  shippingPhone: string
  shippingLine1: string
  shippingLine2: string | null
  shippingCity: string
  shippingRegion: string | null
  shippingPostalCode: string | null
  shippingCountry: string
  notes: string | null
  items: { id: string; productName: string; unitPrice: number; quantity: number; lineTotal: number; productSlug: string | null }[]
}

const NuxtLink = resolveComponent('NuxtLink')
const route = useRoute()

const { data: order, pending } = await useFetch<OrderDetail>(() => `/api/orders/${route.params.orderNumber}`)

useHead({ title: computed(() => (order.value ? `Order ${order.value.orderNumber} — Pharmacy Vitamin` : 'Order not found')) })

const paymentMethodLabel = computed(() => (order.value?.paymentMethod === 'bank_transfer' ? 'Direct Bank Transfer' : 'Cash on Delivery'))

const formattedDate = computed(() => {
  if (!order.value) return ''
  return new Date(order.value.placedAt.replace(' ', 'T')).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('en-US').format(value)}đ`
}
</script>
