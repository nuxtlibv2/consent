import { computed, useNuxtApp, useRuntimeConfig } from '#imports'
import de from '../lang/de'
import en from '../lang/en'
import pl from '../lang/pl'

const moduleLocaleMessages = { en, de, pl } as const
type ModuleLocale = keyof typeof moduleLocaleMessages

type NuxtAppWithOptionalI18n = ReturnType<typeof useNuxtApp> & {
  $i18n?: {
    t?: (key: string) => string
  }
}

function localTranslate(key: string, locale: string): string {
  const normalizedLocale: ModuleLocale = Object.prototype.hasOwnProperty.call(moduleLocaleMessages, locale)
    ? locale as ModuleLocale
    : 'en'
  const dict = moduleLocaleMessages[normalizedLocale] as Record<string, unknown>

  let value: unknown = dict

  for (const part of key.split('.')) {
    if (!value || typeof value !== 'object') {
      value = undefined
      break
    }

    value = (value as Record<string, unknown>)[part]
  }

  return typeof value === 'string' ? value : key
}

// WHAT: Gives the consent components one simple source of translated text.
// WHY: The module needs to work in two cases only: apps with Nuxt i18n and apps without it.
// HOW: If `$i18n` exists we use Nuxt i18n only; if it does not exist we return the bundled module messages directly.
export function useConsentI18n() {
  const config = useRuntimeConfig()
  const nuxtApp = useNuxtApp() as NuxtAppWithOptionalI18n
  const consentConfig = config.public.nuxtlibConsent ?? {}

  const t = (key: string): string => {
    if (nuxtApp.$i18n?.t) {
      console.log('Using Nuxt i18n for consent translations')
      return nuxtApp.$i18n.t(key)
    }
    else {
      // Fallback to bundled messages if i18n is not available
      return localTranslate(key, consentConfig.locale || 'en')
    }
  }

  const messages = computed(() => {
    return {
      title: t('nuxtlibConsent.title'),
      description: t('nuxtlibConsent.description'),
      categories: {
        analytics: {
          label: t('nuxtlibConsent.categories.analytics.label'),
          description: t('nuxtlibConsent.categories.analytics.description'),
        },
        ads: {
          label: t('nuxtlibConsent.categories.ads.label'),
          description: t('nuxtlibConsent.categories.ads.description'),
        },
        personalization: {
          label: t('nuxtlibConsent.categories.personalization.label'),
          description: t('nuxtlibConsent.categories.personalization.description'),
        },
        functional: {
          label: t('nuxtlibConsent.categories.functional.label'),
          description: t('nuxtlibConsent.categories.functional.description'),
        },
      },
      buttons: {
        acceptAll: t('nuxtlibConsent.buttons.acceptAll'),
        customize: t('nuxtlibConsent.buttons.customize'),
        hideSettings: t('nuxtlibConsent.buttons.hideSettings'),
        save: t('nuxtlibConsent.buttons.save'),
      },
      essentialNotice: t('nuxtlibConsent.essentialNotice'),
    }
  })

  return {
    t,
    messages,
  }
}
