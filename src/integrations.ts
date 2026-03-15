import { hasNuxtModule } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'

export type ConsentIntegrationsOptions = {
  googleAnalytics?: boolean
}

export type ConsentIntegrationName = keyof ConsentIntegrationsOptions

type ConsentIntegrationDefinition = {
  plugin: string
  validate: (nuxt: Nuxt) => void
}

type NuxtWithOptionalScriptsConfig = Nuxt & {
  options: Nuxt['options'] & {
    scripts?: {
      registry?: {
        googleAnalytics?: {
          id?: string
        }
      }
    }
  }
}

// WHAT: Lists the integrations this module knows how to wire up.
// WHY: The module should stay provider-agnostic by default and only load integrations that are explicitly enabled.
// HOW: Each entry points to the runtime plugin and contains the validation needed before that plugin is added.
export const consentIntegrationRegistry: Record<ConsentIntegrationName, ConsentIntegrationDefinition> = {
  googleAnalytics: {
    plugin: './runtime/plugins/ga.client',
    validate(nuxt) {
      // WHAT: Makes sure GA support is actually available before we try to load the consent sync plugin.
      // WHY: If `@nuxt/scripts` or the GA id is missing, shipping a half-configured integration would be confusing.
      // HOW: Check that the Nuxt module is enabled first, then read the GA measurement id from `scripts.registry`.
      if (!hasNuxtModule('@nuxt/scripts', nuxt)) {
        throw new Error('[nuxtlib/consent] `nuxtlibConsent.integrations.googleAnalytics` requires `@nuxt/scripts` to be installed and enabled in `modules`.')
      }

      const measurementId = (nuxt as NuxtWithOptionalScriptsConfig).options.scripts?.registry?.googleAnalytics?.id
      if (typeof measurementId !== 'string' || measurementId.trim().length === 0) {
        throw new Error('[nuxtlib/consent] `nuxtlibConsent.integrations.googleAnalytics` requires `scripts.registry.googleAnalytics.id` to be configured.')
      }
    },
  },
}

// WHAT: Turns the user config into the final list of integrations to load.
// WHY: Module setup should only work with supported, correctly typed integration flags.
// HOW: Walk the `integrations` object, reject unknown keys or non-boolean values, and collect the enabled ones.
export function resolveConsentIntegrations(integrations: ConsentIntegrationsOptions | undefined): ConsentIntegrationName[] {
  const enabledIntegrations: ConsentIntegrationName[] = []
  const supportedIntegrations = new Set<ConsentIntegrationName>(Object.keys(consentIntegrationRegistry) as ConsentIntegrationName[])

  for (const [name, enabled] of Object.entries(integrations ?? {})) {
    if (!supportedIntegrations.has(name as ConsentIntegrationName)) {
      throw new Error(`[nuxtlib/consent] Unsupported integration \`${name}\`. Supported integrations: ${Array.from(supportedIntegrations).join(', ')}.`)
    }

    if (typeof enabled !== 'boolean') {
      throw new TypeError(`[nuxtlib/consent] \`nuxtlibConsent.integrations.${name}\` must be a boolean.`)
    }

    if (enabled) {
      enabledIntegrations.push(name as ConsentIntegrationName)
    }
  }

  return enabledIntegrations
}
