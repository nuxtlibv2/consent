import { defineNuxtModule, addPlugin, createResolver, addImports, addComponent } from '@nuxt/kit'
import type { Nuxt, PublicRuntimeConfig } from 'nuxt/schema'
import { consentIntegrationRegistry, resolveConsentIntegrations, type ConsentIntegrationsOptions } from './integrations'

// Module options TypeScript interface definition
export interface ModuleOptions {
  cookiePrefix?: string
  cookieSecure?: boolean
  cookieMaxAge?: number
  locale?: 'en' | 'pl' | 'de'
  integrations?: ConsentIntegrationsOptions
}

type RegisterI18nModule = (options: {
  langDir: string
  locales: Array<{
    code: string
    file: string
  }>
}) => void

type NuxtWithOptionalI18nHook = Nuxt & {
  hook: (name: 'i18n:registerModule', callback: (register: RegisterI18nModule) => void) => void
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtlib/consent',
    configKey: 'nuxtlibConsent',
  },

  moduleDependencies: {
    '@nuxt/scripts': {
      optional: true,
      version: '>=0.12.0',
    },
    '@nuxtjs/i18n': {
      optional: true,
      version: '>=10.0.0',
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
    const nuxt = _nuxt as NuxtWithOptionalI18nHook
    const enabledIntegrations = resolveConsentIntegrations(_options.integrations)

    // WHAT: Registers this module's bundled consent translation files with Nuxt i18n.
    // WHY: When an app already uses Nuxt i18n, the consent UI should plug into that system instead of inventing its own.
    // HOW: It hooks into `i18n:registerModule` and tells Nuxt i18n where this module keeps its bundled translation files.
    nuxt.hook('i18n:registerModule', (register) => {
      register({
        langDir: resolver.resolve('./runtime/lang'),
        locales: [
          {
            code: 'en',
            file: 'en.ts',
          },
          {
            code: 'de',
            file: 'de.ts',
          },
          {
            code: 'pl',
            file: 'pl.ts',
          },
        ],
      })
    })

    const publicConfig = _nuxt.options.runtimeConfig.public as PublicRuntimeConfig
    publicConfig.nuxtlibConsent = {
      cookiePrefix: _options.cookiePrefix ?? 'default_cookie_prefix',
      cookieSecure: _options.cookieSecure ?? true,
      cookieMaxAge: _options.cookieMaxAge ?? 60 * 60 * 24 * 365,
      locale: _options.locale,
    }

    for (const integrationName of enabledIntegrations) {
      const integration = consentIntegrationRegistry[integrationName]
      integration.validate(_nuxt)
      addPlugin(resolver.resolve(integration.plugin))
    }

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
      name: 'CookiesConsent',
      filePath: resolver.resolve('./runtime/components/CookiesConsent.vue'),
    })
  },
})
