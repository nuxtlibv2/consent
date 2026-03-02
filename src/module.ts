import { defineNuxtModule, addPlugin, createResolver, addImports, addComponent } from '@nuxt/kit'
import type { PublicRuntimeConfig } from 'nuxt/schema'

// Module options TypeScript interface definition
export interface ModuleOptions {
  cookiePrefix?: string
  cookieSecure?: boolean
  cookieMaxAge?: number
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtlib/consent',
    configKey: 'nuxtlibConsent',
  },

  moduleDependencies: {
    '@nuxt/scripts': {
      version: '>=0.12.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    cookiePrefix: 'default_cookie_prefix',
    cookieSecure: true,
    cookieMaxAge: 60 * 60 * 24 * 365, // 1 year
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    const publicConfig = _nuxt.options.runtimeConfig.public as PublicRuntimeConfig
    publicConfig.consent = {
      cookiePrefix: _options.cookiePrefix,
      cookieSecure: _options.cookieSecure,
      cookieMaxAge: _options.cookieMaxAge,
    }

    // Google Analytics plugin (client-only)
    addPlugin(resolver.resolve('./runtime/plugins/ga.client'))

    // Consent composable 
    addImports({
      name: 'useConsent',
      from: resolver.resolve('./runtime/composables/useConsent'),
    })

    addImports({
      name: 'useIsRealUser',
      from: resolver.resolve('./runtime/composables/useIsRealUser'),
    })

    // Consent UI components
    addComponent({
      name: 'BaseSwitch',
      filePath: resolver.resolve('./runtime/components/BaseSwitch.vue'),
    })

    addComponent({
      name: 'ConsentModal',
      filePath: resolver.resolve('./runtime/components/ConsentModal.client.vue'),
    })

    addComponent({
      name: 'Consent',
      filePath: resolver.resolve('./runtime/components/Consent.vue'),
    })






  },
})
