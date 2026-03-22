// ~/composables/useConsent.ts

import type { CookieRef } from '#app'
import { useCookie, useRuntimeConfig } from '#imports'

export type ConsentOptions = {
  /** Site usage measurement (maps to GA `analytics_storage`). */
  analytics: boolean
  /** Advertising + conversion measurement (maps to GA `ad_storage` and `ad_user_data`). */
  ads: boolean
  /** Personalized ad/content behavior (maps to GA `ad_personalization`). */
  personalization: boolean
  /** Non-essential UX preferences (currently not mapped to GA). */
  functional: boolean
}

export interface UseConsentReturn {
  consent: CookieRef<ConsentOptions>
  decided: CookieRef<boolean>
  setConsent: (patch: Partial<ConsentOptions>) => void
  acceptAll: () => void
  declineAll: () => void
}

export function useConsent(): UseConsentReturn {
  const config = useRuntimeConfig()
  const prefix = config.public.nuxtlibConsent.cookiePrefix
  const secure = config.public.nuxtlibConsent.cookieSecure // Trusting defautls from module options, idk if I should
  const maxAge = config.public.nuxtlibConsent.cookieMaxAge // Trusting defautls from module options, idk if I should

  const cookieOptions = {
    sameSite: 'lax' as const,
    secure,
    path: '/',
    maxAge,
  }

  function defaultConsent(): ConsentOptions {
    return {
      // essential is implied true (not user-toggleable)
      analytics: false,
      ads: false,
      personalization: false,
      functional: false,
    }
  }

  // On the server we still want normalized default values for reads, but those
  // defaults must not be persisted during SSR finalization.
  function useConsentCookie<T>(name: string, defaultValue: () => T): CookieRef<T> {
    if (import.meta.server) {
      return useCookie<T>(name, {
        ...cookieOptions,
        default: defaultValue,
        readonly: true,
      }) as CookieRef<T>
    }

    return useCookie<T>(name, {
      ...cookieOptions,
      default: defaultValue,
    })
  }

  // Decision flag: has the user chosen?
  const decided = useConsentCookie<boolean>(prefix + '_decided', () => false)

  // Normalized consent categories
  const consent = useConsentCookie<ConsentOptions>(prefix + '_consent', defaultConsent)

  // Domain actions (no provider logic here)
  function setConsent(patch: Partial<ConsentOptions>) {
    const current = consent.value

    // Normalize and validate patch (ignore non-boolean)
    const next: ConsentOptions = {
      analytics: typeof patch.analytics === 'boolean' ? patch.analytics : current.analytics,
      ads: typeof patch.ads === 'boolean' ? patch.ads : current.ads,
      personalization: typeof patch.personalization === 'boolean' ? patch.personalization : current.personalization,
      functional: typeof patch.functional === 'boolean' ? patch.functional : current.functional,
    }

    decided.value = true

    // No update if nothing changed (prevents infinite loops with watchers)
    if (
      next.analytics === current.analytics
      && next.ads === current.ads
      && next.personalization === current.personalization
      && next.functional === current.functional
    ) return

    consent.value = next
  }

  function setAll(state: boolean) {
    setConsent({
      analytics: state, ads: state, personalization: state, functional: state,
    })
  }
  function acceptAll() {
    setAll(true)
    decided.value = true
  }
  function declineAll() {
    setAll(false)
    decided.value = true
  }

  return {
    // state
    consent,
    decided,

    // actions
    setConsent,
    acceptAll,
    declineAll,
  }
}
