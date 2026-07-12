// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Mint Cosmetics — Nuxt Skeleton',
      meta: [
        { name: 'description', content: 'Structural Nuxt 3 rebuild of the mint07.com homepage layout (placeholder content).' }
      ]
    }
  }
})
