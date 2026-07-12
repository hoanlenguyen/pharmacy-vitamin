<!--
  Maps to: main horizontal category nav on mint07.com
  Data-driven: each top-level item can be a plain link, a simple dropdown (flat list),
  or a full mega-menu (promo image + N columns of {groupTitle, links[]}).
-->
<template>
  <nav class="relative border-b border-gray-200 bg-white">
    <ul class="mx-auto flex max-w-7xl items-center gap-1 px-4 text-sm font-medium">
      <li
        v-for="item in items"
        :key="item.label"
        class="relative"
        @mouseenter="openItem = item.label"
        @mouseleave="openItem = null"
      >
        <NuxtLink
          :to="item.to"
          class="block px-3 py-3 text-gray-700 hover:bg-mint-50 hover:text-mint-700"
        >
          {{ item.label }}
        </NuxtLink>

        <!-- Simple dropdown -->
        <div
          v-if="item.type === 'simple' && openItem === item.label"
          class="absolute left-0 top-full z-20 min-w-[200px] rounded-b border border-gray-200 bg-white py-2 shadow-lg"
        >
          <NuxtLink
            v-for="link in item.links"
            :key="link.label"
            :to="link.to"
            class="block px-4 py-2 text-sm text-gray-600 hover:bg-mint-50 hover:text-mint-700"
          >
            {{ link.label }}
          </NuxtLink>
        </div>

        <!-- Full mega-menu -->
        <div
          v-else-if="item.type === 'mega' && openItem === item.label"
          class="absolute left-0 top-full z-20 flex w-[640px] gap-6 rounded-b border border-gray-200 bg-white p-6 shadow-lg"
        >
          <div class="hidden w-40 shrink-0 items-center justify-center rounded bg-mint-100 text-xs text-mint-700 lg:flex">
            Promo image
          </div>
          <div class="grid flex-1 grid-cols-2 gap-6">
            <div v-for="col in item.columns" :key="col.title">
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-mint-700">{{ col.title }}</p>
              <ul class="space-y-1.5">
                <li v-for="link in col.links" :key="link.label">
                  <NuxtLink :to="link.to" class="text-sm text-gray-600 hover:text-mint-700">
                    {{ link.label }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
type SimpleLink = { label: string; to: string }
type MegaColumn = { title: string; links: SimpleLink[] }
type NavItem = {
  label: string
  to: string
  type?: 'simple' | 'mega'
  links?: SimpleLink[]
  columns?: MegaColumn[]
}

// Structure mirrors mint07.com's top-level categories — swap labels/links for your own taxonomy.
const items: NavItem[] = [
  { label: 'Flash Deals', to: '/flash-deals' },
  { label: 'Combos', to: '/combos' },
  {
    label: 'Makeup',
    to: '/makeup',
    type: 'mega',
    columns: [
      { title: 'Lips & Face', links: [
        { label: 'Lipstick', to: '/makeup/lipstick' },
        { label: 'Lip Balm', to: '/makeup/lip-balm' },
        { label: 'Foundation', to: '/makeup/foundation' },
        { label: 'Concealer', to: '/makeup/concealer' }
      ] },
      { title: 'Eyes', links: [
        { label: 'Mascara', to: '/makeup/mascara' },
        { label: 'Eyeliner', to: '/makeup/eyeliner' },
        { label: 'Eyebrow', to: '/makeup/eyebrow' },
        { label: 'Eyeshadow', to: '/makeup/eyeshadow' }
      ] }
    ]
  },
  {
    label: 'Skin Care',
    to: '/skin-care',
    type: 'mega',
    columns: [
      { title: 'Cleansing', links: [
        { label: 'Makeup Remover', to: '/skin-care/remover' },
        { label: 'Face Wash', to: '/skin-care/face-wash' },
        { label: 'Toner', to: '/skin-care/toner' }
      ] },
      { title: 'Moisturizing', links: [
        { label: 'Moisturizer', to: '/skin-care/moisturizer' },
        { label: 'Serum', to: '/skin-care/serum' },
        { label: 'Sheet Mask', to: '/skin-care/mask' }
      ] }
    ]
  },
  {
    label: 'Personal Care',
    to: '/personal-care',
    type: 'simple',
    links: [
      { label: 'Body Wash', to: '/personal-care/body-wash' },
      { label: 'Hair Care', to: '/personal-care/hair-care' },
      { label: 'Oral Care', to: '/personal-care/oral-care' }
    ]
  },
  { label: 'Supplements', to: '/supplements' },
  {
    label: 'Beauty Tools',
    to: '/beauty-tools',
    type: 'simple',
    links: [
      { label: 'Cleansing Pads', to: '/beauty-tools/pads' },
      { label: 'Facial Cleansing Device', to: '/beauty-tools/device' }
    ]
  },
  { label: 'Brands', to: '/brands' },
  { label: 'Membership', to: '/membership' },
  {
    label: 'Blog',
    to: '/blog',
    type: 'simple',
    links: [
      { label: 'News', to: '/blog/news' },
      { label: 'Reviews', to: '/blog/reviews' },
      { label: 'Skincare Tips', to: '/blog/skincare-tips' }
    ]
  }
]

const openItem = ref<string | null>(null)
</script>
