import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { defineNuxtModule, addPlugin, createResolver, addImports, addComponent } from '@nuxt/kit'
import type { Nuxt, PublicRuntimeConfig } from 'nuxt/schema'
import { consentIntegrationRegistry, resolveConsentIntegrations, type ConsentIntegrationsOptions } from './integrations'

// WHAT: The file extension the bundled lang files actually have, in priority order.
// WHY: In a real published package `dist/runtime/lang` only contains compiled `.js`, but in local/stub dev builds
//      (`nuxt-module-build build --stub`) the original `.ts` sources are what's on disk instead. Hardcoding either
//      one breaks the other mode with an `ENOENT` as soon as `@nuxtjs/i18n` tries to load the registered file.
// HOW: `resolveLangFile` below tries each extension in this order and returns the first one found on disk.
const LANG_FILE_EXTENSIONS = ['ts', 'js', 'mjs'] as const

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

// WHAT: Finds the real on-disk filename for a bundled lang file (e.g. `en`), instead of assuming its extension.
// WHY: Whichever extension this module actually ships with for a given build can change (stub dev build vs. a
//      real `nuxt-module-build build`), and Nuxt i18n needs the exact existing filename to resolve it without crashing.
// HOW: It checks `langDir` for `<code>.ts`, then `.js`, then `.mjs` and returns the first match; if somehow none
//      exist it falls back to `.js`, the extension a real published build produces, so behavior stays predictable.
function resolveLangFile(langDir: string, code: string): string {
  for (const ext of LANG_FILE_EXTENSIONS) {
    const file = `${code}.${ext}`
    if (existsSync(join(langDir, file))) {
      return file
    }
  }
  return `${code}.js`
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
    // HOW: It hooks into `i18n:registerModule` and tells Nuxt i18n where this module keeps its bundled translation
    //      files, resolving each file's real extension on disk (see `resolveLangFile`) rather than assuming one.
    nuxt.hook('i18n:registerModule', (register) => {
      const langDir = resolver.resolve('./runtime/lang')
      register({
        langDir,
        locales: [
          {
            code: 'en',
            file: resolveLangFile(langDir, 'en'),
          },
          {
            code: 'de',
            file: resolveLangFile(langDir, 'de'),
          },
          {
            code: 'pl',
            file: resolveLangFile(langDir, 'pl'),
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
      mode: 'client',
    })
  },
})
