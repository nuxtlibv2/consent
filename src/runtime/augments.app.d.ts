declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    nuxtlibConsent: {
      cookiePrefix?: string
      cookieSecure?: boolean
      cookieMaxAge?: number
      locale?: 'en' | 'pl' | 'de'
    }
  }
}
export { }
