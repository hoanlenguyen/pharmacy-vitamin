<!--
  Shared create/edit form for admin products — used by pages/admin/products/new.vue
  and pages/admin/products/[slug]/edit.vue. Fields match what the Worker's
  POST/PATCH /admin/products endpoints actually accept — no UI for
  images/variants/ingredients yet, since the backend doesn't support editing those.
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
          placeholder="e.g. gentle-foaming-cleanser-150ml"
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
        <span class="text-xs font-medium text-gray-600">Price (VND) *</span>
        <input
          v-model.number="form.price"
          type="number"
          min="0"
          required
          class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </label>

      <label class="block">
        <span class="text-xs font-medium text-gray-600">Compare-at price (VND)</span>
        <input
          v-model.number="form.compareAtPrice"
          type="number"
          min="0"
          class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </label>

      <label class="block">
        <span class="text-xs font-medium text-gray-600">SKU</span>
        <input
          v-model="form.sku"
          type="text"
          class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </label>

      <label v-if="mode === 'create'" class="block">
        <span class="text-xs font-medium text-gray-600">Brand</span>
        <select
          v-model="form.brandSlug"
          class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          <option value="">— None —</option>
          <option v-for="brand in brands" :key="brand.slug" :value="brand.slug">{{ brand.name }}</option>
        </select>
      </label>
    </div>

    <div class="block">
      <span class="text-xs font-medium text-gray-600">Product Image</span>
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
          <p v-else class="mt-1 text-xs text-gray-400">JPEG, PNG, WEBP, or GIF. Uploads to blob storage immediately.</p>
        </div>
      </div>
    </div>

    <label class="block">
      <span class="text-xs font-medium text-gray-600">Summary</span>
      <textarea
        v-model="form.summary"
        rows="3"
        class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
      />
    </label>

    <fieldset v-if="mode === 'create'">
      <legend class="text-xs font-medium text-gray-600">Categories</legend>
      <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <label v-for="cat in flatCategories" :key="cat.slug" class="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            :value="cat.slug"
            v-model="form.categorySlugs"
            class="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-400"
          />
          <span :style="{ paddingLeft: `${cat.depth * 12}px` }">{{ cat.name }}</span>
        </label>
      </div>

      <label v-if="form.categorySlugs.length" class="mt-3 block">
        <span class="text-xs font-medium text-gray-600">Primary category (used for breadcrumb)</span>
        <select
          v-model="form.primaryCategorySlug"
          class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 sm:w-64"
        >
          <option v-for="slug in form.categorySlugs" :key="slug" :value="slug">
            {{ flatCategories.find(c => c.slug === slug)?.name ?? slug }}
          </option>
        </select>
      </label>
    </fieldset>

    <label v-if="mode === 'edit'" class="block">
      <span class="text-xs font-medium text-gray-600">Status</span>
      <select
        v-model="form.status"
        class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 sm:w-48"
      >
        <option value="active">Active</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived</option>
      </select>
    </label>

    <div class="flex items-center gap-3 border-t border-gray-100 pt-5">
      <button
        type="submit"
        :disabled="submitting"
        class="flex items-center gap-2 rounded-full bg-rose-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" aria-hidden="true" />
        {{ mode === 'create' ? 'Create Product' : 'Save Changes' }}
      </button>
      <NuxtLink to="/admin" class="text-sm font-medium text-gray-500 hover:text-rose-600">Cancel</NuxtLink>
      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { Image as ImageIcon, Loader2, Upload } from '@lucide/vue'

type CategoryNode = { slug: string; name: string; children: CategoryNode[] }

export type ProductFormPayload = {
  slug?: string
  name: string
  price: number
  compareAtPrice?: number
  sku?: string
  summary?: string
  brandSlug?: string
  categorySlugs?: string[]
  primaryCategorySlug?: string
  status?: 'draft' | 'active' | 'archived'
  imageUrl?: string
}

const props = defineProps<{
  mode: 'create' | 'edit'
  initial?: Partial<ProductFormPayload>
  submitting?: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{ submit: [payload: ProductFormPayload] }>()

const form = reactive<ProductFormPayload & { categorySlugs: string[] }>({
  slug: props.initial?.slug ?? '',
  name: props.initial?.name ?? '',
  price: props.initial?.price ?? 0,
  compareAtPrice: props.initial?.compareAtPrice,
  sku: props.initial?.sku ?? '',
  summary: props.initial?.summary ?? '',
  brandSlug: props.initial?.brandSlug ?? '',
  categorySlugs: props.initial?.categorySlugs ?? [],
  primaryCategorySlug: props.initial?.primaryCategorySlug,
  status: props.initial?.status ?? 'active',
  imageUrl: props.initial?.imageUrl
})

const { authHeaders } = useAdminAuth()
const imagePreview = ref(props.initial?.imageUrl)
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

watch(
  () => form.categorySlugs.length,
  () => {
    if (!form.categorySlugs.includes(form.primaryCategorySlug ?? '')) {
      form.primaryCategorySlug = form.categorySlugs[0]
    }
  }
)

const { data: brandsData } = await useFetch<{ brands: { slug: string; name: string }[] }>('/api/brands')
const brands = computed(() => brandsData.value?.brands ?? [])

const { data: categoriesData } = await useFetch<{ categories: CategoryNode[] }>('/api/categories')

function flatten(nodes: CategoryNode[], depth = 0): { slug: string; name: string; depth: number }[] {
  return nodes.flatMap(node => [{ slug: node.slug, name: node.name, depth }, ...flatten(node.children, depth + 1)])
}

const flatCategories = computed(() => flatten(categoriesData.value?.categories ?? []))

function handleSubmit() {
  emit('submit', { ...form })
}
</script>
