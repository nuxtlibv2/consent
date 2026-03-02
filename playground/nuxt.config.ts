import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@nuxtlib/consent', '@nuxt/scripts'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  compatibilityDate: 'latest',
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  nuxtlibConsent: {
    cookiePrefix: 'myapp_consent',
    cookieSecure: false,
    cookieMaxAge: 60 * 60 * 24 * 365, // 1 year
  },
  scripts: {
    registry: {
      googleAnalytics: {
        id: 'G-XXXXXXXXXX',
      },
    },
  },
})
