<!--
  Homepage layout order mirrors mint07.com's structure (top to bottom):
  1. Announcement bar
  2. Header (logo / search / account / cart)
  3. Secondary top link row
  4. Mega-menu category nav
  5. Hero slider
  6. Quick-category pill row
  7. 3-column promo banner strip
  8. "Best Price Every Day" product section (with countdown)
  9. "Monthly Sale Program" product section (with tab filters)
  10. "Makeup" product section (with tab filters)
  11. Footer
-->
<template>
  <div>
    <AnnouncementBar />
    <TheHeader />
    <TopLinkRow />
    <MegaMenu />

    <main>
      <HeroSlider />
      <CategoryPillRow />
      <PromoBannerGrid />

      <ProductSection
        title="Best Price Every Day"
        :products="dailyDeals"
        :countdown-seconds="32400"
      />

      <ProductSection
        title="Monthly Sale Program"
        :products="monthlySale"
        :tabs="['Best Price', 'Brand Deals', 'Flash Deals']"
      />

      <ProductSection
        title="Makeup"
        :products="makeupPicks"
        :tabs="['All', 'Lips', 'Face', 'Eyes']"
      />
    </main>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/components/ProductCard.vue'

// Placeholder product data — replace with real catalog/API data.
const dailyDeals: Product[] = [
  { name: 'Brightening Sunscreen SPF50+ PA++++ 50ml', price: 139000, originalPrice: 350000 },
  { name: 'Hyaluronic Acid Cleansing Water 200ml', price: 99000, priceMax: 159000, hasVariants: true },
  { name: 'Vitamin C Brightening Serum 30ml', price: 259000, originalPrice: 420000 },
  { name: 'Calming Sheet Mask (Pack of 5)', price: 89000, originalPrice: 120000 },
  { name: 'Gentle Foaming Cleanser 150ml', price: 175000, originalPrice: 210000 }
]

const monthlySale: Product[] = [
  { name: 'Skin Repair Sheet Mask 25g', price: 22000, originalPrice: 50000, soldCount: 1205 },
  { name: 'Aqua Tone-Up Sunscreen SPF50+ PA++++', price: 345000, originalPrice: 560000, soldCount: 1196, hasVariants: true },
  { name: 'Pore-Clearing Gommage Peel 120g', price: 130000, originalPrice: 150000, soldCount: 1758 },
  { name: 'UV Protection Milk SPF50+ PA+++ 60ml', price: 508000, originalPrice: 558000, soldCount: 345 },
  { name: 'Tinted Sunscreen Fluid Cream 40ml', price: 869000, originalPrice: 1050000, soldCount: 2075 },
  { name: 'Glow Highlighter 5.9g', price: 149000, priceMax: 155000, soldCount: 1146, hasVariants: true },
  { name: 'Single Blusher 5g', price: 99000, originalPrice: 159000, soldCount: 545, hasVariants: true }
]

const makeupPicks: Product[] = [
  { name: 'Moisturizing Lip Balm Stick 4g', price: 149000, originalPrice: 155000, rating: 5, reviewCount: 44 },
  { name: 'Tip Concealer', price: 119000, originalPrice: 200000, rating: 5, reviewCount: 30, hasVariants: true },
  { name: 'Waterproof Brush Eyeliner', price: 95000, originalPrice: 150000, rating: 5, reviewCount: 42 },
  { name: 'Overnight Lip Sleeping Mask 20ml', price: 389000, originalPrice: 460000, rating: 5, reviewCount: 26, hasVariants: true },
  { name: 'Velvet Lip Tint', price: 310000, originalPrice: 359000, rating: 5, reviewCount: 11, hasVariants: true },
  { name: 'Lip Cream', price: 185000, originalPrice: 199000, rating: 5, reviewCount: 6 },
  { name: 'Volumizing Waterproof Mascara', price: 149000, originalPrice: 189000, soldCount: 1749 }
]
</script>
