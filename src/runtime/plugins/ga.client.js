// plugins/ga.client.js

import { useConsent } from "../composables/useConsent"


export default defineNuxtPlugin(() => {



    const { consent } = useConsent()

    // 1) setup proxy
    const { proxy, onLoaded } = useScriptGoogleAnalytics()

    // 3) map consent -> GA fields
    const toGA = (c) => ({
        analytics_storage: c.analytics,         // 'granted' | 'denied'
        ad_storage: c.ads,
        ad_personalization: c.personalization,
        ad_user_data: c.ads                // simple policy: follow "ads"
    })

    // 2/4) when GA ready: send default, then current; keep watching
    onLoaded(() => {



        proxy.gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_personalization: 'denied',
            ad_user_data: 'denied'
        })

        proxy.gtag('consent', 'update', toGA(consent.value))

    })

    watch(() => ({ ...consent.value }), (c) => {
        if (proxy?.gtag) {
            proxy.gtag('consent', 'update', toGA(c))
          
        }

    }, { deep: true })
})
