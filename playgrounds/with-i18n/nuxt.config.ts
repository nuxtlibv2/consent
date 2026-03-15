import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/i18n',
    '@nuxtlib/consent', '@nuxt/scripts'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  // routeRules: {
  //   '/': { prerender: true },
  //   '/test': { swr: true },
  // },
  compatibilityDate: 'latest',
  vite: {
    // Tailwind's Vite plugin types do not align with Nuxt's in this workspace.
    plugins: tailwindcss() as never,
  },
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    detectBrowserLanguage: false,
    langDir: 'locales',
    locales: [
      { code: 'en', language: 'en-US', file: 'en.ts' },
      { code: 'de', language: 'de-DE', file: 'de.ts' },
      { code: 'pl', language: 'pl-PL', file: 'pl.ts' },
      { code: 'fr', language: 'fr-FR', file: 'fr.ts' },
    ],
  },
  nuxtlibConsent: {
    cookiePrefix: 'myapp_consent_with_i18n',
    cookieSecure: false,
    cookieMaxAge: 60 * 60 * 24 * 365, // 1 year
    locale: 'en',
    integrations: {
      googleAnalytics: true,
    },
  },
  scripts: {
    registry: {
      googleAnalytics: {
        id: 'G-XXXXXXXXXX',
      },
    },
  },
})
