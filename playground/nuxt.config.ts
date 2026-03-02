import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  modules: ['@nuxtlib/consent', '@nuxt/scripts'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  nuxtlibConsent: {
    cookiePrefix: 'myapp_consent',
    cookieSecure: false,
    cookieMaxAge: 60 * 60 * 24 * 365, // 1 year
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  scripts: {
    registry: {
      googleAnalytics: {
        id: 'G-XXXXXXXXXX',
      }
    }
  }
})