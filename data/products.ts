export type ProductDetail = {
  slug: string
  id: string
  name: string
  brand: string
  sku: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  soldCount: number
  categories: string[]
  breadcrumb: { label: string; to: string }[]
  imageCount: number
  summary: string
  skinConcerns: string[]
  ingredients: { name: string; benefit: string }[]
  howToUse: string[]
}

// TODO: replace with real catalog data once a backend/CMS is wired up.
export const products: ProductDetail[] = [
  {
    slug: 'caryophy-skin-repair-mask-sheet-25g',
    id: 'skin-repair-sheet-mask-25g',
    name: 'Skin Repair Sheet Mask 25g',
    brand: 'Caryophy',
    sku: '8809501251087-1',
    price: 22000,
    originalPrice: 50000,
    rating: 4.9,
    reviewCount: 86,
    soldCount: 1205,
    categories: ['Skin Care', 'Moisturizing', 'Masks'],
    breadcrumb: [
      { label: 'Home', to: '/' },
      { label: 'Skin Care', to: '/skin-care' },
      { label: 'Masks', to: '/skin-care/mask' }
    ],
    imageCount: 3,
    summary:
      'A soothing sheet mask built for stressed, post-treatment skin. A lightweight essence delivers an instant moisture boost while calming redness and irritation, leaving skin softer and visibly calmer after a single use.',
    skinConcerns: [
      'Sensitive or easily irritated skin',
      'Dehydrated skin lacking moisture',
      'Redness and a weakened skin barrier'
    ],
    ingredients: [
      { name: 'Panthenol (Vitamin B5)', benefit: 'Calms irritation and locks in moisture' },
      { name: 'Beta-Glucan', benefit: 'Strengthens the skin barrier and aids recovery' },
      { name: 'Centella Asiatica Extract', benefit: 'Soothes redness and supports skin repair' },
      { name: 'Grape Extract', benefit: 'Antioxidant support against environmental stress' },
      { name: 'Chamomile Extract (Guaiazulene)', benefit: 'Gentle, cooling relief for reactive skin' }
    ],
    howToUse: [
      'Cleanse with a gentle cleanser and toner.',
      'Unfold the sheet mask and smooth it onto clean, dry skin.',
      'Leave on for 15–20 minutes.',
      'Remove the sheet and pat the remaining essence into skin.'
    ]
  }
]

export function getProductBySlug(slug: string) {
  return products.find(product => product.slug === slug)
}
