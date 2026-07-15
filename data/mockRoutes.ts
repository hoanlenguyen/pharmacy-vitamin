import {
  Award,
  Briefcase,
  CreditCard,
  Droplet,
  Gift,
  LifeBuoy,
  MapPin,
  Newspaper,
  Package,
  Pill,
  RotateCcw,
  Sparkle,
  Tag,
  Truck,
  User,
  Wand2,
  Zap
} from '@lucide/vue'
import type { Component } from 'vue'

export type MockRouteType = 'category' | 'content' | 'blog' | 'account'

export type MockRouteConfig = {
  type: MockRouteType
  icon: Component
  description: string
  highlights?: string[]
  contactEmail?: string
}

// TODO: replace with real category/CMS data once a backend exists.
// Keyed by the first URL segment — anything not listed falls back to a generic "content" mock.
export const mockRouteConfig: Record<string, MockRouteConfig> = {
  makeup: { type: 'category', icon: Sparkle, description: 'Trending lip, face, and eye makeup picks.' },
  'skin-care': { type: 'category', icon: Droplet, description: 'Cleansers, serums, and masks for every skin concern.' },
  'personal-care': { type: 'category', icon: Package, description: 'Everyday body, hair, and oral care essentials.' },
  supplements: { type: 'category', icon: Pill, description: 'Vitamins and wellness supplements.' },
  'beauty-tools': { type: 'category', icon: Wand2, description: 'Cleansing devices and applicators.' },
  'flash-deals': { type: 'category', icon: Zap, description: 'Limited-time discounts across the store.' },
  combos: { type: 'category', icon: Package, description: 'Bundle deals — save more when you buy together.' },
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
