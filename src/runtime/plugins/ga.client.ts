// plugins/ga.client.js

import { defineNuxtPlugin, useScriptGoogleAnalytics, watch } from '#imports'
import { useConsent, type ConsentOptions } from '../composables/useConsent'

export default defineNuxtPlugin(() => {
  type ConsentGoogleAnalytics = {
    analytics_storage: 'granted' | 'denied'
    ad_storage: 'granted' | 'denied'
    ad_personalization: 'granted' | 'denied'
    ad_user_data: 'granted' | 'denied'
  }

  const { consent } = useConsent()

  // 1) setup proxy
  const { proxy, onLoaded } = useScriptGoogleAnalytics()

  // 3) map consent -> GA fields
  function toGA(c: ConsentOptions): ConsentGoogleAnalytics {
    return {
      analytics_storage: (c.analytics === true) ? 'granted' : 'denied', // 'granted' | 'denied'
      ad_storage: (c.ads === true) ? 'granted' : 'denied',
      ad_personalization: (c.personalization === true) ? 'granted' : 'denied',
      ad_user_data: (c.ads === true) ? 'granted' : 'denied', // simple policy: follow "ads"
    }
  }

  // 2/4) when GA ready: send default, then watch (immediate sends current once)
  onLoaded(() => {
    proxy.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_personalization: 'denied',
      ad_user_data: 'denied',
    })

    watch(() => ({ ...consent.value } as ConsentOptions), (c: ConsentOptions) => {
      if (proxy?.gtag) {
        proxy.gtag('consent', 'update', toGA(c))
      }
    }, { deep: true, immediate: true })
  })
})
