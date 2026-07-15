<!--
  Maps to: mint07.com/thanh-toan/ — billing/shipping form + order review + payment method,
  restyled to match the site. Places a real order (POST /api/orders -> the Worker -> D1),
  then clears the cart and redirects to /order-confirmation/:orderNumber. Shows the same
  empty-cart treatment as /cart when there's nothing to check out.
-->
<template>
  <div class="mx-auto max-w-7xl px-4 py-8">
    <nav class="mb-6 flex items-center gap-1 text-xs text-gray-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="transition-colors hover:text-rose-600">Home</NuxtLink>
      <ChevronRight class="h-3 w-3 text-gray-300" aria-hidden="true" />
      <span class="text-gray-700">Checkout</span>
    </nav>

    <h1 class="mb-6 font-display text-2xl font-bold text-gray-900">Checkout</h1>

    <div v-if="items.length === 0" class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-rose-200 bg-rose-50/40 py-20 text-center">
      <ShoppingBag class="h-10 w-10 text-rose-300" aria-hidden="true" />
      <p class="font-display text-lg font-bold text-gray-900">Your cart is empty</p>
      <p class="text-sm text-gray-500">Add something to your cart before checking out.</p>
      <NuxtLink to="/" class="mt-2 rounded-full bg-rose-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90">
        Continue Shopping
      </NuxtLink>
    </div>

    <form v-else class="grid grid-cols-1 gap-8 lg:grid-cols-3" @submit.prevent="handlePlaceOrder">
      <div class="space-y-4 lg:col-span-2">
        <button
          type="button"
          class="w-full rounded-lg bg-gray-100 px-4 py-3 text-left text-sm text-gray-600 transition-colors hover:bg-gray-200"
          @click="showLoginNote = !showLoginNote"
        >
          Already have an account? <span class="font-semibold text-rose-600">Click here to log in</span>
        </button>
        <p v-if="showLoginNote" class="-mt-2 text-xs text-gray-500">
          Customer accounts aren't available yet — continue as a guest below.
        </p>

        <button
          type="button"
          class="w-full rounded-lg bg-gray-100 px-4 py-3 text-left text-sm text-gray-600 transition-colors hover:bg-gray-200"
          @click="showCoupon = !showCoupon"
        >
          Have a coupon? <span class="font-semibold text-rose-600">Click here to enter your code</span>
        </button>
        <div v-if="showCoupon" class="-mt-2 flex overflow-hidden rounded-full border border-gray-300">
          <input v-model="couponCode" type="text" placeholder="Coupon code" class="flex-1 px-4 py-2 text-sm focus:outline-none" />
          <button
            type="button"
            class="shrink-0 bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-600"
            @click="applyCoupon"
          >
            Apply
          </button>
        </div>
        <p v-if="couponMessage" class="-mt-2 text-xs text-gray-500">{{ couponMessage }}</p>

        <section class="pt-4">
          <h2 class="mb-4 border-b border-gray-100 pb-2 font-display text-lg font-bold text-gray-900">Billing Details</h2>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label class="text-sm text-gray-600">
              First Name <span class="text-rose-500">*</span>
              <input v-model="billing.firstName" type="text" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </label>
            <label class="text-sm text-gray-600">
              Last Name <span class="text-rose-500">*</span>
              <input v-model="billing.lastName" type="text" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </label>
            <label class="text-sm text-gray-600 sm:col-span-2">
              Country / Region <span class="text-rose-500">*</span>
              <select v-model="billing.country" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
                <option v-for="c in countries" :key="c">{{ c }}</option>
              </select>
            </label>
            <label class="text-sm text-gray-600 sm:col-span-2">
              Street Address <span class="text-rose-500">*</span>
              <input v-model="billing.address" type="text" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </label>
            <label class="text-sm text-gray-600">
              Postal Code <span class="text-rose-500">*</span>
              <input v-model="billing.postalCode" type="text" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </label>
            <label class="text-sm text-gray-600">
              Town / City <span class="text-rose-500">*</span>
              <input v-model="billing.city" type="text" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </label>
            <label class="text-sm text-gray-600">
              Phone <span class="text-rose-500">*</span>
              <input v-model="billing.phone" type="tel" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </label>
            <label class="text-sm text-gray-600">
              Email Address <span class="text-rose-500">*</span>
              <input v-model="billing.email" type="email" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </label>
          </div>
        </section>

        <section class="pt-4">
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input v-model="shipToDifferent" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400" />
            Ship to a different address?
          </label>

          <div v-if="shipToDifferent" class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label class="text-sm text-gray-600">
              First Name <span class="text-rose-500">*</span>
              <input v-model="shipping.firstName" type="text" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </label>
            <label class="text-sm text-gray-600">
              Last Name <span class="text-rose-500">*</span>
              <input v-model="shipping.lastName" type="text" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </label>
            <label class="text-sm text-gray-600 sm:col-span-2">
              Country / Region <span class="text-rose-500">*</span>
              <select v-model="shipping.country" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
                <option v-for="c in countries" :key="c">{{ c }}</option>
              </select>
            </label>
            <label class="text-sm text-gray-600 sm:col-span-2">
              Street Address <span class="text-rose-500">*</span>
              <input v-model="shipping.address" type="text" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </label>
            <label class="text-sm text-gray-600">
              Postal Code <span class="text-gray-400">(optional)</span>
              <input v-model="shipping.postalCode" type="text" class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </label>
            <label class="text-sm text-gray-600">
              Town / City <span class="text-rose-500">*</span>
              <input v-model="shipping.city" type="text" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </label>
            <label class="text-sm text-gray-600">
              Phone <span class="text-rose-500">*</span>
              <input v-model="shipping.phone" type="tel" required class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
            </label>
          </div>
        </section>

        <section class="pt-4">
          <label class="text-sm text-gray-600">
            Order Notes <span class="text-gray-400">(optional)</span>
            <textarea
              v-model="notes"
              rows="3"
              placeholder="Notes about your order, e.g. special delivery instructions."
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </label>
        </section>
      </div>

      <div class="lg:col-span-1">
        <div class="rounded-xl border border-gray-100 p-5 shadow-card">
          <h2 class="font-display text-sm font-bold uppercase tracking-wide text-gray-900">Your Order</h2>

          <div class="mt-4 divide-y divide-gray-100 text-sm">
            <div class="flex items-center justify-between pb-2 font-semibold text-gray-900">
              <span>Product</span>
              <span>Subtotal</span>
            </div>
            <div v-for="line in items" :key="line.id" class="flex items-start justify-between gap-3 py-2 text-gray-600">
              <span>{{ line.name }} <span class="text-gray-400">× {{ line.quantity }}</span></span>
              <span class="shrink-0 font-medium text-gray-800">{{ formatCurrency(line.price * line.quantity) }}</span>
            </div>
          </div>

          <div class="mt-2 flex items-center justify-between border-t border-gray-100 pt-3 text-sm text-gray-600">
            <span>Subtotal</span>
            <span class="font-medium text-gray-800">{{ formatCurrency(subtotal) }}</span>
          </div>
          <div class="mt-2 flex items-center justify-between text-sm text-gray-600">
            <span>Shipping</span>
            <span class="font-medium text-gray-800">{{ shippingFee === 0 ? 'Free' : formatCurrency(shippingFee) }}</span>
          </div>

          <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-4">
            <span class="font-display text-sm font-bold text-gray-900">Total</span>
            <span class="font-display text-xl font-bold text-rose-600">{{ formatCurrency(total) }}</span>
          </div>

          <div class="mt-5 space-y-2">
            <label
              class="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-gray-700 transition-colors"
              :class="paymentMethod === 'bank_transfer' ? 'border-rose-400 bg-rose-50/60' : 'border-gray-200'"
            >
              <input v-model="paymentMethod" type="radio" value="bank_transfer" class="h-4 w-4 text-rose-500 focus:ring-rose-400" />
              Direct Bank Transfer
            </label>
            <p v-if="paymentMethod === 'bank_transfer'" class="rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
              Make your payment directly into our bank account. Please use your order number as the payment reference.
              Your order won't ship until the funds have cleared.
            </p>

            <label
              class="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-gray-700 transition-colors"
              :class="paymentMethod === 'cod' ? 'border-rose-400 bg-rose-50/60' : 'border-gray-200'"
            >
              <input v-model="paymentMethod" type="radio" value="cod" class="h-4 w-4 text-rose-500 focus:ring-rose-400" />
              Cash on Delivery (COD)
            </label>
          </div>

          <label class="mt-4 flex items-start gap-2 text-xs text-gray-500">
            <input v-model="acceptedTerms" type="checkbox" required class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-rose-500 focus:ring-rose-400" />
            <span>
              I have read and agree to the website's
              <NuxtLink to="/payment" class="text-rose-600 hover:underline">terms and conditions</NuxtLink>
              <span class="text-rose-500"> *</span>
            </span>
          </label>

          <p v-if="errorMessage" class="mt-3 text-xs text-red-600">{{ errorMessage }}</p>

          <button
            type="submit"
            :disabled="submitting"
            class="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-rose-gradient py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Lock class="h-4 w-4" aria-hidden="true" />
            {{ submitting ? 'Placing Order…' : 'Place Order' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Lock, ShoppingBag } from '@lucide/vue'

useHead({ title: 'Checkout — Pharmacy Vitamin' })

const { items, subtotal, clear } = useCart()

const showLoginNote = ref(false)
const showCoupon = ref(false)
const couponCode = ref('')
const couponMessage = ref('')

function applyCoupon() {
  couponMessage.value = couponCode.value.trim()
    ? "That code couldn't be applied — coupons aren't validated on this build yet."
    : ''
}

const countries = ['Vietnam', 'United States', 'Other']

const billing = reactive({
  firstName: '',
  lastName: '',
  country: 'Vietnam',
  address: '',
  postalCode: '',
  city: '',
  phone: '',
  email: ''
})

const shipToDifferent = ref(false)
const shipping = reactive({
  firstName: '',
  lastName: '',
  country: 'Vietnam',
  address: '',
  postalCode: '',
  city: '',
  phone: ''
})

const notes = ref('')
const paymentMethod = ref<'bank_transfer' | 'cod'>('bank_transfer')
const acceptedTerms = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

// Mirrors the Worker's own server-side calculation (worker/src/routes/orders.ts) — shown
// here for the order review; the Worker recomputes it independently rather than trusting it.
const FREE_SHIPPING_THRESHOLD = 500000
const FLAT_SHIPPING_FEE = 30000
const shippingFee = computed(() => (subtotal.value >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE))
const total = computed(() => subtotal.value + shippingFee.value)

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('en-US').format(value)}đ`
}

async function handlePlaceOrder() {
  errorMessage.value = ''

  if (!acceptedTerms.value) {
    errorMessage.value = 'Please accept the terms and conditions to continue.'
    return
  }

  submitting.value = true
  try {
    const shipTo = shipToDifferent.value ? shipping : billing

    const payload = {
      customer: {
        name: `${billing.firstName} ${billing.lastName}`.trim(),
        email: billing.email,
        phone: billing.phone
      },
      shipping: {
        name: `${shipTo.firstName} ${shipTo.lastName}`.trim(),
        phone: shipTo.phone,
        line1: shipTo.address,
        city: shipTo.city,
        postalCode: shipTo.postalCode || undefined,
        country: shipTo.country
      },
      items: items.value.map(line => ({
        slug: line.slug ?? line.id,
        variantId: line.id.includes(':') ? line.id.split(':').slice(1).join(':') : undefined,
        quantity: line.quantity
      })),
      paymentMethod: paymentMethod.value,
      notes: notes.value || undefined
    }

    const result = await $fetch<{ orderNumber: string }>('/api/orders', { method: 'POST', body: payload })
    clear()
    await navigateTo(`/order-confirmation/${result.orderNumber}`)
  } catch (error: any) {
    errorMessage.value = error?.data?.error ?? 'Something went wrong placing your order. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
