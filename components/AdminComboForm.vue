<!--
  Shared create/edit form for admin combos — used by pages/admin/combos/new.vue and
  pages/admin/combos/[slug]/edit.vue. A combo bundles N existing products at its own price;
  the product picker below just adds/removes/re-quantities lines from that bundle.
-->
<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <label class="block">
        <span class="text-xs font-medium text-gray-600">Slug{{ mode === 'create' ? ' *' : '' }}</span>
        <input
          v-model="form.slug"
          type="text"
          :disabled="mode === 'edit'"
          required
          placeholder="e.g. glow-starter-set"
          class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:bg-gray-100 disabled:text-gray-400"
        />
      </label>

      <label class="block">
        <span class="text-xs font-medium text-gray-600">Name *</span>
        <input
          v-model="form.name"
          type="text"
          required
          class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </label>

      <label class="block">
        <span class="text-xs font-medium text-gray-600">Bundle Price *</span>
        <input
          v-model.number="form.price"
          type="number"
          min="0"
          required
          class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </label>

      <label class="block">
        <span class="text-xs font-medium text-gray-600">Compare-at Price</span>
        <input
          v-model.number="form.compareAtPrice"
          type="number"
          min="0"
          placeholder="Sum of individual prices, e.g."
          class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </label>

      <label class="block">
        <span class="text-xs font-medium text-gray-600">Status</span>
        <select
          v-model="form.status"
          class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <label class="block">
        <span class="text-xs font-medium text-gray-600">Sort Order</span>
        <input
          v-model.number="form.sortOrder"
          type="number"
          class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </label>
    </div>

    <label class="block">
      <span class="text-xs font-medium text-gray-600">Description</span>
      <textarea
        v-model="form.description"
        rows="3"
        class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
      />
    </label>

    <div class="block">
      <span class="text-xs font-medium text-gray-600">Combo Image</span>
      <div class="mt-1 flex items-center gap-4">
        <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-rose-soft-gradient">
          <img
            v-if="imagePreview && !previewFailed"
            :src="imagePreview"
            alt=""
            class="h-full w-full object-cover"
            @error="previewFailed = true"
          />
          <ImageIcon v-else class="h-6 w-6 text-rose-300" aria-hidden="true" />
        </div>
        <div>
          <label
            class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-rose-300 hover:text-rose-600"
          >
            <Upload class="h-4 w-4" aria-hidden="true" />
            {{ uploadingImage ? 'Uploading…' : 'Choose Image' }}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" :disabled="uploadingImage" @change="handleFileChange" />
          </label>
          <p v-if="uploadError" class="mt-1 text-xs text-red-600">{{ uploadError }}</p>
          <p v-else class="mt-1 text-xs text-gray-400">Optional. Falls back to the first product's image if left empty.</p>
        </div>
      </div>
    </div>

    <div>
      <span class="text-xs font-medium text-gray-600">Products in this bundle *</span>

      <div class="mt-2 flex gap-2">
        <select
          v-model="selectedToAdd"
          class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          <option value="">— Select a product to add —</option>
          <option v-for="product in selectableProducts" :key="product.slug" :value="product.slug">{{ product.name }}</option>
        </select>
        <button
          type="button"
          :disabled="!selectedToAdd"
          class="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
          @click="addItem"
        >
          Add
        </button>
      </div>

      <p v-if="items.length === 0" class="mt-3 text-xs text-gray-400">No products added yet.</p>
      <ul v-else class="mt-3 space-y-2">
        <li
          v-for="item in items"
          :key="item.productSlug"
          class="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2 text-sm"
        >
          <span class="flex-1 text-gray-700">{{ item.productName }}</span>
          <input
            v-model.number="item.quantity"
            type="number"
            min="1"
            aria-label="Quantity"
            class="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          <button
            type="button"
            aria-label="Remove product"
            class="text-gray-400 hover:text-red-600"
            @click="removeItem(item.productSlug)"
          >
            <X class="h-4 w-4" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </div>

    <div class="flex items-center gap-3 border-t border-gray-100 pt-5">
      <button
        type="submit"
        :disabled="submitting"
        class="flex items-center gap-2 rounded-full bg-rose-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" aria-hidden="true" />
        {{ mode === 'create' ? 'Create Combo' : 'Save Changes' }}
      </button>
      <NuxtLink to="/admin/combos" class="text-sm font-medium text-gray-500 hover:text-rose-600">Cancel</NuxtLink>
      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { Image as ImageIcon, Loader2, Upload, X } from '@lucide/vue'

type ComboItemInput = { productSlug: string; productName: string; quantity: number }

export type ComboFormPayload = {
  slug?: string
  name: string
  description?: string
  price: number
  compareAtPrice?: number
  status: 'active' | 'draft' | 'archived'
  sortOrder?: number
  imageUrl?: string | null
  items: { productSlug: string; quantity: number }[]
}

const props = defineProps<{
  mode: 'create' | 'edit'
  initial?: Partial<ComboFormPayload> & { items?: ComboItemInput[] }
  submitting?: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{ submit: [payload: ComboFormPayload] }>()

const form = reactive({
  slug: props.initial?.slug ?? '',
  name: props.initial?.name ?? '',
  description: props.initial?.description ?? '',
  price: props.initial?.price ?? 0,
  compareAtPrice: props.initial?.compareAtPrice,
  status: props.initial?.status ?? 'active',
  sortOrder: props.initial?.sortOrder ?? 0,
  imageUrl: props.initial?.imageUrl ?? undefined
})

const imagePreview = ref(props.initial?.imageUrl ?? undefined)
const previewFailed = ref(false)
const uploadingImage = ref(false)
const uploadError = ref('')

async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  imagePreview.value = URL.createObjectURL(file)
  previewFailed.value = false
  uploadingImage.value = true
  uploadError.value = ''

  try {
    const result = await $fetch<{ url: string }>('/api/admin/images', {
      method: 'POST',
      query: { filename: file.name },
      headers: { ...authHeaders(), 'Content-Type': file.type },
      body: file
    })
    form.imageUrl = result.url
  } catch {
    uploadError.value = 'Upload failed. Please try again.'
  } finally {
    uploadingImage.value = false
  }
}

const items = ref<ComboItemInput[]>(props.initial?.items ? [...props.initial.items] : [])
const selectedToAdd = ref('')

// Fetched after mount (not a top-level await useFetch) — the admin token only hydrates
// from sessionStorage in useAdminAuth's own onMounted, so it isn't ready during setup.
const { isAuthenticated, authHeaders } = useAdminAuth()
const allProducts = ref<{ slug: string; name: string }[]>([])
async function loadProducts() {
  const data = await $fetch<{ items: { slug: string; name: string }[] }>('/api/admin/products', { headers: authHeaders() })
  allProducts.value = data.items
}
watch(isAuthenticated, value => { if (value) loadProducts() }, { immediate: true })

const selectableProducts = computed(() => allProducts.value.filter(p => !items.value.some(i => i.productSlug === p.slug)))

function addItem() {
  const product = allProducts.value.find(p => p.slug === selectedToAdd.value)
  if (!product) return
  items.value.push({ productSlug: product.slug, productName: product.name, quantity: 1 })
  selectedToAdd.value = ''
}

function removeItem(slug: string) {
  items.value = items.value.filter(item => item.productSlug !== slug)
}

function handleSubmit() {
  emit('submit', {
    ...form,
    compareAtPrice: form.compareAtPrice || undefined,
    imageUrl: form.imageUrl || null,
    items: items.value.map(item => ({ productSlug: item.productSlug, quantity: Math.max(1, item.quantity) }))
  })
}
</script>
