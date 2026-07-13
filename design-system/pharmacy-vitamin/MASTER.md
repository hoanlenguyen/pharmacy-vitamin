# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Pharmacy Vitamin
**Generated:** 2026-07-12 23:01:21
**Updated:** 2026-07-12 (chosen direction: Soft Beauty)
**Category:** Beauty / Cosmetics / Wellness E-commerce

---

## Global Rules

### Color Palette

| Role | Hex | Tailwind class | CSS Variable |
|------|-----|-----------------|--------------|
| Primary (rose-500) | `#EC4899` | `rose-500` | `--color-primary` |
| On Primary | `#FFFFFF` | `white` | `--color-on-primary` |
| Secondary (rose-400) | `#F472B6` | `rose-400` | `--color-secondary` |
| Accent/CTA (violet-500) | `#8B5CF6` | `accent-500` | `--color-accent` |
| Background (rose-50) | `#FDF2F8` | `rose-50` | `--color-background` |
| Foreground (rose-900) | `#831843` | `rose-900` | `--color-foreground` |
| Muted (gray-500) | `#64748B` | `gray-500` | `--color-muted` |
| Border (rose-200) | `#FBCFE8` | `rose-200` | `--color-border` |
| Destructive | `#DC2626` | `red-600` | `--color-destructive` |
| Ring (rose-500) | `#EC4899` | `rose-500` | `--color-ring` |

**Color Notes:** Soft pink + lavender luxury — matches the makeup/skincare/beauty product catalog. Full `rose` and `accent` scales (50–900) are defined in `tailwind.config.ts`. CTAs use the `bg-rose-gradient` (rose-500 → accent-500) utility, not flat fills.

### Typography

- **Heading Font:** Rubik (`font-display`)
- **Body Font:** Nunito Sans (`font-sans`, default body)
- **Mood:** ecommerce, clean, shopping, product, retail, conversion
- **Loaded via:** `nuxt.config.ts` `app.head.link` (preconnect + stylesheet), not `@import` in CSS

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths (`tailwind.config.ts` → `boxShadow`)

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-card` | soft rose-tinted, 2 layers | Default card resting state |
| `shadow-card-hover` | stronger rose-tinted lift | Card/interactive hover |
| `shadow-pop` | large rose-tinted | Dropdowns, mega-menu panels |

---

## Site Structure

- **Chrome lives in `layouts/default.vue`** (AnnouncementBar, TheHeader, TopLinkRow, MegaMenu, TheFooter), applied via `<NuxtLayout>` in `app.vue`. Every page under `pages/` gets it automatically — don't re-add chrome components inside individual pages.
- **Routes:** `/` (home), `/products/[slug]` (product detail, data from `data/products.ts`), `/cart` (cart page).
- **Cart state:** `composables/useCart.ts` is a module-scope singleton (`items`/`count`/`subtotal` + `addItem`/`removeItem`/`updateQuantity`), shared by the header badge, `ProductCard`, the product detail page, and the cart page. No Pinia/Vuex — plain `ref` composable is enough for this scale.

---

## Component Specs (as implemented)

### Buttons

- Primary CTA: `bg-rose-gradient` (rose-500 → accent-500 diagonal gradient), white text, `rounded-full`, `shadow-card` on hero CTAs, `hover:opacity-90`, 200ms transition.
- Secondary / outline: `border-rose-300 text-rose-700`, `hover:bg-rose-50`.

### Cards (`ProductCard.vue`)

- `rounded-xl`, `shadow-card` → `hover:shadow-card-hover`, `hover:-translate-y-0.5`, 200ms transition.
- Image placeholder uses `bg-rose-soft-gradient` (rose-50 → accent-50) with a centered Lucide `Image` icon — no gray boxes.

### Inputs (`TheHeader.vue` search)

- `rounded-full` (pill) search bar, `focus:ring-2 focus:ring-rose-400`.

### Dropdowns / Mega-menu (`MegaMenu.vue`)

- `rounded-b-xl`, `shadow-pop`, fade+translate `<Transition>` (150ms, respects `prefers-reduced-motion`).

---

## Style Guidelines

**Style:** Soft Beauty — flat/minimal base with a signature rose→lavender gradient reserved for CTAs, hero, and accents (not overused).

**Icons:** `@lucide/vue` exclusively (no emoji). Note: Lucide does **not** ship Facebook/Instagram/etc. brand marks (licensing) — the footer "Follow Us" row uses generic `MessageCircle` / `Camera` / `Music2` glyphs as placeholders. Swap for official brand SVGs before shipping real social links.

**Key Effects:** Gradient CTAs, soft rose-tinted shadows (not neutral gray), rounded-full pills/buttons, 150–300ms transitions, `prefers-reduced-motion` respected on all custom `<Transition>` components.

### Page Pattern

**Section Order (homepage):** Announcement bar → Header → Top link row → Mega-menu → Hero slider → Category pills → Promo banner grid → Product sections (×3) → Footer.

---

## Anti-Patterns (Do NOT Use)

- ❌ Emojis as icons — use `@lucide/vue`
- ❌ Flat neutral-gray shadows — use the rose-tinted `shadow-card` / `shadow-pop` tokens
- ❌ Guessed/recolored brand logos (Facebook, Instagram, etc.) — Lucide has no official brand marks; use real brand SVGs when wiring up real social links
- ❌ Missing `cursor-pointer` on clickable elements
- ❌ Instant state changes — always transition 150–300ms
- ❌ Invisible focus states

---

## Pre-Delivery Checklist

- [x] No emojis used as icons (Lucide SVGs throughout)
- [x] `cursor-pointer` implicit via `<button>`/`<a>`/`<NuxtLink>` semantics
- [x] Hover states with smooth transitions (150–300ms)
- [x] `prefers-reduced-motion` respected on custom transitions
- [x] Responsive verified at 375px (mobile) and desktop — no horizontal scroll
- [ ] Dark mode — not implemented (site is light-mode only; add if required)
- [ ] Real product photography — all image slots are icon placeholders
- [ ] Real social brand marks for footer icons
