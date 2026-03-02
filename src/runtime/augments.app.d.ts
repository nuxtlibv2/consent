declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    consent: {
      cookiePrefix?: string
      cookieSecure?: boolean
      cookieMaxAge?: number
    }
  }
}
export { }
