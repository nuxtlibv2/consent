// ~/composables/useConsent.ts

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

export function useConsent() {
  const config = useRuntimeConfig()
  const prefix = config.public.consent.cookiePrefix
  const secure = config.public.consent.cookieSecure // Trusting defautls from module options, idk if I should
  const maxAge = config.public.consent.cookieMaxAge // Trusting defautls from module options, idk if I should

  const cookieOptions = {
    sameSite: 'lax' as const,
    secure,
    path: '/',
    maxAge,
  }

  // Decision flag: has the user chosen?
  const decided = useCookie<boolean>(prefix + '_decided', {
    ...cookieOptions,
    default: function (): boolean { return false },
  })

  // Normalized consent categories
  const consent = useCookie<ConsentOptions>(prefix + '_consent', {
    ...cookieOptions,
    default: function (): ConsentOptions {
      return {
        // essential is implied true (not user-toggleable)
        analytics: false,
        ads: false,
        personalization: false,
        functional: false,
      }
    },
  })

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

    // No update if nothing changed (prevents infinite loops with watchers)
    if (
      next.analytics === current.analytics
      && next.ads === current.ads
      && next.personalization === current.personalization
      && next.functional === current.functional
    ) return

    consent.value = next
    decided.value = true
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
