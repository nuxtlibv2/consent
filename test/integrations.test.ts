import { beforeEach, describe, expect, it, vi } from 'vitest'
import { consentIntegrationRegistry, resolveConsentIntegrations } from '../src/integrations'

const { hasNuxtModuleMock } = vi.hoisted(() => ({
  hasNuxtModuleMock: vi.fn(),
}))

vi.mock('@nuxt/kit', () => ({
  hasNuxtModule: hasNuxtModuleMock,
}))

describe('resolveConsentIntegrations', () => {
  it('returns an empty list when no integrations are enabled', () => {
    expect(resolveConsentIntegrations(undefined)).toEqual([])
    expect(resolveConsentIntegrations({ googleAnalytics: false })).toEqual([])
  })

  it('returns enabled supported integrations', () => {
    expect(resolveConsentIntegrations({ googleAnalytics: true })).toEqual(['googleAnalytics'])
  })

  it('throws for unsupported integrations', () => {
    expect(() => resolveConsentIntegrations({ unknownProvider: true } as never))
      .toThrow('Unsupported integration `unknownProvider`')
  })

  it('throws for non-boolean integration values', () => {
    expect(() => resolveConsentIntegrations({ googleAnalytics: 'yes' } as never))
      .toThrow('`nuxtlibConsent.integrations.googleAnalytics` must be a boolean')
  })
})

describe('googleAnalytics integration validation', () => {
  beforeEach(() => {
    hasNuxtModuleMock.mockReset()
  })

  it('throws when @nuxt/scripts is not enabled', () => {
    hasNuxtModuleMock.mockReturnValue(false)

    expect(() => consentIntegrationRegistry.googleAnalytics.validate({
      options: {},
    } as never)).toThrow('requires `@nuxt/scripts` to be installed and enabled in `modules`')
  })

  it('throws when the GA measurement id is missing', () => {
    hasNuxtModuleMock.mockReturnValue(true)

    expect(() => consentIntegrationRegistry.googleAnalytics.validate({
      options: {
        scripts: {
          registry: {
            googleAnalytics: {},
          },
        },
      },
    } as never)).toThrow('requires `scripts.registry.googleAnalytics.id` to be configured')
  })

  it('passes when @nuxt/scripts is enabled and the GA measurement id is configured', () => {
    hasNuxtModuleMock.mockReturnValue(true)

    expect(() => consentIntegrationRegistry.googleAnalytics.validate({
      options: {
        scripts: {
          registry: {
            googleAnalytics: {
              id: 'G-XXXXXXXXXX',
            },
          },
        },
      },
    } as never)).not.toThrow()
  })
})
