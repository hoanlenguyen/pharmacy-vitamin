import type { Product } from '~/components/ProductCard.vue'

// TODO: replace with a real catalog/API. Shared placeholder pool used by category mock pages —
// not filtered per-category since there's no backend to query against yet.
export const catalog: Product[] = [
  { name: 'Brightening Sunscreen SPF50+ PA++++ 50ml', price: 139000, originalPrice: 350000 },
  { name: 'Hyaluronic Acid Cleansing Water 200ml', price: 99000, priceMax: 159000, hasVariants: true },
  { name: 'Vitamin C Brightening Serum 30ml', price: 259000, originalPrice: 420000 },
  { name: 'Calming Sheet Mask (Pack of 5)', price: 89000, originalPrice: 120000 },
  { name: 'Gentle Foaming Cleanser 150ml', price: 175000, originalPrice: 210000 },
  {
    name: 'Skin Repair Sheet Mask 25g',
    price: 22000,
    originalPrice: 50000,
    soldCount: 1205,
    slug: 'caryophy-skin-repair-mask-sheet-25g'
  },
  { name: 'Aqua Tone-Up Sunscreen SPF50+ PA++++', price: 345000, originalPrice: 560000, soldCount: 1196, hasVariants: true },
  { name: 'Pore-Clearing Gommage Peel 120g', price: 130000, originalPrice: 150000, soldCount: 1758 },
  { name: 'Moisturizing Lip Balm Stick 4g', price: 149000, originalPrice: 155000, rating: 5, reviewCount: 44 },
  { name: 'Tip Concealer', price: 119000, originalPrice: 200000, rating: 5, reviewCount: 30, hasVariants: true },
  { name: 'Waterproof Brush Eyeliner', price: 95000, originalPrice: 150000, rating: 5, reviewCount: 42 },
  { name: 'Velvet Lip Tint', price: 310000, originalPrice: 359000, rating: 5, reviewCount: 11, hasVariants: true }
]
