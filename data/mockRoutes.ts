import { Award, Briefcase, CreditCard, Gift, LifeBuoy, MapPin, Newspaper, Package, RotateCcw, Tag, Truck, User } from '@lucide/vue'
import type { Component } from 'vue'

export type MockRouteType = 'category' | 'content' | 'blog' | 'account'

export type MockRouteConfig = {
  type: MockRouteType
  icon: Component
  description: string
  highlights?: string[]
  contactEmail?: string
}

// Real product categories (makeup, skin-care, etc.) are no longer listed here — they're
// detected dynamically in pages/[...slug].vue against the live /api/categories tree, which
// also supplies their real name/description. Flash Deals and Combos have their own dedicated
// pages (pages/flash-deals.vue, pages/combos/) and never reach this catch-all at all.
// Keyed by the first URL segment — anything not listed falls back to a generic "content" mock.
export const mockRouteConfig: Record<string, MockRouteConfig> = {
  clearance: { type: 'category', icon: Tag, description: 'Final markdowns while supplies last.' },

  blog: { type: 'blog', icon: Newspaper, description: 'Skincare tips, brand spotlights, and store news.' },
  account: { type: 'account', icon: User, description: 'Sign in to track orders and save favorites.' },

  about: {
    type: 'content',
    icon: Award,
    description: 'Our story, mission, and commitment to authentic products.',
    highlights: [
      'Founded to make authentic beauty and wellness accessible',
      'Every product is 100% genuine, sourced directly from brands',
      'Serving customers online and in-store across the country'
    ]
  },
  support: {
    type: 'content',
    icon: LifeBuoy,
    description: "We're here to help with orders, returns, and product questions.",
    highlights: ['Order and shipping questions', 'Product recommendations from our team', 'Returns and exchanges'],
    contactEmail: 'support@pharmacy-vitamin.example'
  },
  careers: {
    type: 'content',
    icon: Briefcase,
    description: 'Join the Pharmacy Vitamin team.',
    highlights: ['Open roles across retail, logistics, and marketing', "We're building a beauty-first culture", 'Send your resume to our team'],
    contactEmail: 'careers@pharmacy-vitamin.example'
  },
  shipping: {
    type: 'content',
    icon: Truck,
    description: 'Delivery times, fees, and free-shipping thresholds.',
    highlights: ['Free shipping over a set order value', 'Cash on delivery available', 'Most orders ship within 1–2 business days']
  },
  returns: {
    type: 'content',
    icon: RotateCcw,
    description: 'Flexible 14-day returns on eligible products.',
    highlights: ['14-day return window on eligible items', 'Items must be unused and in original packaging', 'Refunds processed within 5–7 business days']
  },
  payment: {
    type: 'content',
    icon: CreditCard,
    description: 'Accepted payment methods, including cash on delivery.',
    highlights: ['Cash on delivery', 'Credit & debit cards', 'Bank transfer']
  },
  membership: {
    type: 'content',
    icon: Gift,
    description: 'Earn points and unlock member-only perks.',
    highlights: ['Earn points on every order', 'Member-only sales and early access', 'Free birthday gift']
  },
  stores: {
    type: 'content',
    icon: MapPin,
    description: 'Find a Pharmacy Vitamin store near you.',
    highlights: ['Store locations coming soon', 'Call ahead to check product availability', 'In-store pickup available at select locations']
  }
}

const fallbackConfig: MockRouteConfig = {
  type: 'content',
  icon: Package,
  description: 'This page is coming soon.',
  highlights: ["We're still building this section — check back soon."]
}

export function getMockRouteConfig(firstSegment: string) {
  return mockRouteConfig[firstSegment] ?? fallbackConfig
}

export function humanize(segment: string) {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
