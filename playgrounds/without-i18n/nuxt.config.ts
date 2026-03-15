import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@nuxtlib/consent'],
  // modules: ['@nuxtlib/consent', '@nuxt/scripts'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  compatibilityDate: 'latest',
  vite: {
    // Tailwind's Vite plugin types do not align with Nuxt's in this workspace.
    plugins: tailwindcss() as never,
  },
  nuxtlibConsent: {
    cookiePrefix: 'myapp_consent',
    cookieSecure: false,
    cookieMaxAge: 60 * 60 * 24 * 365, // 1 year
    locale: 'pl',
    // integrations: {
    //   googleAnalytics: true,
    // },
  },
  // scripts: {
  //   registry: {
  //     googleAnalytics: {
  //       id: 'G-XXXXXXXXXX',
  //     },
  //   },
  // },
})
