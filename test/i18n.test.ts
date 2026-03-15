import { beforeEach, describe, expect, it, vi } from 'vitest'
import de from '../src/runtime/lang/de'
import en from '../src/runtime/lang/en'
import pl from '../src/runtime/lang/pl'
import { useConsentI18n } from '../src/runtime/composables/useConsentI18n'

// These tests do not boot a full Nuxt app.
// They only provide the two tiny pieces that `useConsentI18n()` actually reads:
// 1. runtime config (`useRuntimeConfig`)
// 2. the optional app translator (`useNuxtApp().$i18n`)
//
// This keeps the tests fast, but still exercises the real decision-making code.
const { createComputed, createRef, runtimeConfig, nuxtApp } = vi.hoisted(() => ({
  createComputed<T>(getter: () => T) {
    return {
      get value() {
        return getter()
      },
    }
  },
  createRef<T>(value: T) {
    return { value }
  },
  runtimeConfig: {
    public: {
      nuxtlibConsent: {} as Record<string, unknown>,
    },
  },
  nuxtApp: {} as {
    $i18n?: {
      t?: (key: string) => string
    }
  },
}))

vi.mock('#imports', () => {
  return {
    computed: createComputed,
    useRuntimeConfig: () => runtimeConfig,
    useNuxtApp: () => nuxtApp,
  }
})

const DE_MESSAGES = de.nuxtlibConsent
const EN_MESSAGES = en.nuxtlibConsent
const PL_MESSAGES = pl.nuxtlibConsent

type ConsentMessages = typeof EN_MESSAGES

// The composable asks for flat translation keys such as
// `nuxtlibConsent.buttons.acceptAll`.
// This helper turns our nested message object into that flat format so the fake
// app translator behaves like a real i18n layer.
function toTranslationMap(messages: ConsentMessages): Record<string, string> {
  return {
    'nuxtlibConsent.title': messages.title,
    'nuxtlibConsent.description': messages.description,
    'nuxtlibConsent.categories.analytics.label': messages.categories.analytics.label,
    'nuxtlibConsent.categories.analytics.description': messages.categories.analytics.description,
    'nuxtlibConsent.categories.ads.label': messages.categories.ads.label,
    'nuxtlibConsent.categories.ads.description': messages.categories.ads.description,
    'nuxtlibConsent.categories.personalization.label': messages.categories.personalization.label,
    'nuxtlibConsent.categories.personalization.description': messages.categories.personalization.description,
    'nuxtlibConsent.categories.functional.label': messages.categories.functional.label,
    'nuxtlibConsent.categories.functional.description': messages.categories.functional.description,
    'nuxtlibConsent.buttons.acceptAll': messages.buttons.acceptAll,
    'nuxtlibConsent.buttons.customize': messages.buttons.customize,
    'nuxtlibConsent.buttons.hideSettings': messages.buttons.hideSettings,
    'nuxtlibConsent.buttons.save': messages.buttons.save,
    'nuxtlibConsent.essentialNotice': messages.essentialNotice,
  }
}

// A real i18n library usually returns a translated sentence when it knows a key,
// and often returns the key itself when it does not.
// We mirror that behavior here because the composable only cares about the final
// string returned by `t(key)`.
function createTranslator(translations: Record<string, string>) {
  return (key: string) => translations[key] ?? key
}

describe('useConsentI18n', () => {
  beforeEach(() => {
    runtimeConfig.public.nuxtlibConsent = {}
    delete nuxtApp.$i18n
  })

  it('uses the built-in English consent copy when the app does not provide i18n', () => {
    // WHAT: Simulate the simplest install: no Nuxt i18n and no manual locale override.
    // WHY: The module must still show complete text out of the box.
    // HOW: We leave the mocked app without `$i18n`, then read the generated messages.
    const { messages, t } = useConsentI18n()

    expect(messages.value).toEqual(EN_MESSAGES)
    expect(t('nuxtlibConsent.buttons.acceptAll')).toBe(EN_MESSAGES.buttons.acceptAll)
  })

  it('switches to the built-in Polish copy when the manual locale is "pl"', () => {
    // WHAT: Simulate a project that does not use app-level i18n, but asks the module for Polish.
    // WHY: Supported built-in locale codes should resolve to their bundled fallback copy.
    // HOW: We set the runtime locale to `pl` and confirm the returned copy matches the Polish bundle.
    runtimeConfig.public.nuxtlibConsent = {
      locale: 'pl',
    }

    const { messages } = useConsentI18n()

    expect(messages.value).toEqual(PL_MESSAGES)
  })

  it('switches to the built-in German copy when the manual locale is "de"', () => {
    runtimeConfig.public.nuxtlibConsent = {
      locale: 'de',
    }

    const { messages } = useConsentI18n()

    expect(messages.value).toEqual(DE_MESSAGES)
  })

  it('falls back to English for unsupported manual locales', () => {
    // WHAT: Simulate a manual locale value the module does not understand.
    // WHY: The module only bundles `en`, `de`, and `pl`; everything else falls back to English.
    // HOW: We pass `fr` and confirm the composable still returns the English bundle.
    runtimeConfig.public.nuxtlibConsent = {
      locale: 'fr',
    }

    const { messages } = useConsentI18n()

    expect(messages.value).toEqual(EN_MESSAGES)
  })

  it('delegates every lookup to app i18n when the app provides a translator', () => {
    // WHAT: Simulate an application that already owns translations.
    // WHY: In that mode, the module should stop using its own fallback copy and trust the app translator.
    // HOW: We provide a fake `t(key)` that returns a complete English translation map.
    runtimeConfig.public.nuxtlibConsent = {
      locale: 'pl',
    }
    nuxtApp.$i18n = {
      t: createTranslator(toTranslationMap(EN_MESSAGES)),
    }

    const { messages, t } = useConsentI18n()

    expect(messages.value).toEqual(EN_MESSAGES)
    expect(t('nuxtlibConsent.categories.analytics.label')).toBe(EN_MESSAGES.categories.analytics.label)
  })

  it('re-computes the consent text when the app translator starts returning another language', () => {
    // WHAT: Simulate an app where the active language changes while the page is open.
    // WHY: Users expect the consent UI to follow the app translator they are already using.
    // HOW: The fake translator reads a Vue ref, so changing that ref changes future translations.
    const activeLanguage = createRef<'en' | 'de' | 'pl'>('en')

    nuxtApp.$i18n = {
      t: (key: string) => {
        const translations = activeLanguage.value === 'de'
          ? toTranslationMap(DE_MESSAGES)
          : activeLanguage.value === 'pl'
            ? toTranslationMap(PL_MESSAGES)
            : toTranslationMap(EN_MESSAGES)

        return translations[key] ?? key
      },
    }

    const { messages } = useConsentI18n()

    expect(messages.value.title).toBe(EN_MESSAGES.title)

    activeLanguage.value = 'pl'

    expect(messages.value.title).toBe(PL_MESSAGES.title)

    activeLanguage.value = 'de'

    expect(messages.value.title).toBe(DE_MESSAGES.title)
  })

  it('does not inject its own fallback when app i18n returns raw keys for missing translations', () => {
    // WHAT: Simulate an app translator that knows only a few consent phrases.
    // WHY: The current composable fully delegates to the app translator once `$i18n.t` exists.
    // HOW: Missing keys return the key name itself, which lets us verify there is no hidden fallback layer.
    nuxtApp.$i18n = {
      t: createTranslator({
        'nuxtlibConsent.title': 'Nous utilisons des cookies',
        'nuxtlibConsent.buttons.acceptAll': 'Tout accepter',
      }),
    }

    const { messages } = useConsentI18n()

    expect(messages.value.title).toBe('Nous utilisons des cookies')
    expect(messages.value.buttons.acceptAll).toBe('Tout accepter')
    expect(messages.value.description).toBe('nuxtlibConsent.description')
    expect(messages.value.categories.analytics.label).toBe('nuxtlibConsent.categories.analytics.label')
  })
})
