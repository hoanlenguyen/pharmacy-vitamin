// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  // Deploy target: Vercel serverless. Nitro auto-detects Vercel during its build, but pinning
  // the preset keeps local `nuxt build` output consistent with what Vercel produces. The
  // Cloudflare Worker (D1 + R2) is deployed separately via wrangler — see DEPLOY.md.
  nitro: { preset: 'vercel' },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Server-only — never exposed to the client (no `public` prefix).
    workerApiUrl: process.env.WORKER_API_URL || 'http://127.0.0.1:8787',
    workerApiToken: process.env.WORKER_API_TOKEN || '',
    adminUiToken: process.env.ADMIN_UI_TOKEN || process.env.WORKER_API_TOKEN || ''
  },
  app: {
    head: {
      title: 'Pharmacy Vitamin — Beauty & Wellness',
      meta: [
        { name: 'description', content: 'Cosmetics, skincare and wellness essentials — Pharmacy Vitamin online store.' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&family=Rubik:wght@500;600;700;800&display=swap'
        }
      ]
    }
  }
})
