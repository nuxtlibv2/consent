# @nuxtlib/consent

For Nuxt teams that want free consent banner:
- Optimized for performance
- That only shows for real users after interaction signals
- That persists consent cookies
- With optional Nuxt i18n integration
- With optional Google Analytics consent updates

This module is optimized to stay lightweight in real apps:

- Consent UI is shown only for real users after interaction signals (click, touch, key, scroll, pointer movement threshold).
- The dialog is lazy-rendered through `<CookiesConsent />`, and that public wrapper is registered client-only by the module.
- Interaction listeners are cleaned up after the user is confirmed as real, avoiding long-lived event overhead.

Search terms: `nuxt cookie consent`, `gdpr banner nuxt`, `google consent mode`, `nuxt scripts consent`, `tailwind v4 nuxt module`.

## Navigation

- [Quickstart](#quickstart)
- [Public API](#public-api)
- [Supported Integrations](#supported-integrations)
- [Localization](#localization)
- [How to Configure Google Analytics](#how-to-configure-google-analytics)
- [Testing](#testing)
- [Project Customization Map](#project-customization-map)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Usage Cases](#usage-cases)

## Quickstart

Copy/paste minimal setup:

This quick setup gives you the consent UI and cookie persistence only.
Provider integrations such as Google Analytics are optional and must be enabled separately.

Install dependencies:

```bash
npm install -D @nuxtlib/consent tailwindcss @tailwindcss/vite
```

`assets/css/main.css`:

```css
@import "tailwindcss";
@import "@nuxtlib/consent/tailwind";
```

`nuxt.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@nuxtlib/consent'],
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  nuxtlibConsent: {
    cookiePrefix: 'myapp_name', // cookie key namespace
    cookieSecure: true, // OPTIONAL, default true, set to false when you want to test on localhost
    cookieMaxAge: 60 * 60 * 24 * 365, // OPTIONAL - default 1 year, in seconds
    locale: 'pl', // used only when the app does not use Nuxt i18n - defaults to 'en'
  },
})
```

`app.vue`:

```vue
<script setup lang="ts">
const consentRef = ref<{ toggleConsentVisibility: () => void } | null>(null)
</script>

<template>
  <button @click="consentRef?.toggleConsentVisibility()">
    Cookie settings
  </button>

  <CookiesConsent ref="consentRef" />
</template>
```


What you should see:

- The modal appears only after a real-user interaction such as click, touch, key press, scroll, wheel, or meaningful pointer movement.
- Consent state is stored in `<prefix>_decided` and `<prefix>_consent`.
- No provider integrations run unless you enable them explicitly.

Notes:

- You do not need to wrap `<CookiesConsent />` in `<ClientOnly>`. The module already registers it as client-only.
- `useConsent()` is SSR-safe. When consent cookies are missing, server renders use fallback values without writing default consent cookies during SSR.

Use `cookieSecure: false` only for local HTTP testing. Keep `cookieSecure: true` in production HTTPS.
If you want provider sync, see [Supported Integrations](#supported-integrations) and [How to Configure Google Analytics](#how-to-configure-google-analytics).


## Public API

### `<CookiesConsent />`

Mount this once near the app root. The component exposes:

- `showDeclineButton`: shows a "decline all" action button when `true`
- `enableBackground`: adds a dark blurred backdrop behind the modal when `true`
- `toggleConsentVisibility()` to manually reopen or close the consent modal.

Implementation notes:

- The module registers `<CookiesConsent />` as client-only, so consumers do not need an extra `<ClientOnly>` wrapper.
- This keeps the consent UI out of SSR while preserving the same public component API.

Example:

```vue
<CookiesConsent
  :show-decline-button="true"
  :enable-background="true"
/>
```

### `useConsent()`

Auto-imported composable for consent state and actions:

- `consent`: consent category state backed by cookies when present
- `decided`: first-decision flag backed by cookies when present
- `setConsent(patch)`: partial update for one or more categories
- `acceptAll()`: enables all categories
- `declineAll()`: disables all categories

SSR behavior:

- When consent cookies are missing, `useConsent()` returns normalized fallback values during SSR.
- Those fallback values are not written back as `Set-Cookie` headers during server render finalization.

Current consent categories:

- `analytics`
- `ads`
- `personalization`
- `functional`

### `useIsRealUser(options?)`

Auto-imported composable that confirms real interaction before the consent UI is shown automatically.

Current option:

- `movementThresholdPx` with a default of `8`

## Supported Integrations

Current built-in integrations:

- `googleAnalytics`: Google Analytics consent mode sync through `@nuxt/scripts`

## Localization

Built-in locales:

- `en`
- `de`
- `pl`

Without `@nuxtjs/i18n`, the module uses `nuxtlibConsent.locale` and falls back to `en`.

```ts
export default defineNuxtConfig({
  nuxtlibConsent: {
    locale: 'pl',
  },
})
```

With `@nuxtjs/i18n`, the module registers its bundled `en`, `de`, and `pl` translations through the `i18n:registerModule` hook and resolves consent copy from the `nuxtlibConsent` namespace in your app i18n instance.

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n', '@nuxtlib/consent'],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'pl'],
  },
  nuxtlibConsent: {
    locale: 'en', // fallback only when the app does not use Nuxt i18n
  },
})
```

App i18n always wins over `nuxtlibConsent.locale`. If you add your own locale, provide consent strings under the `nuxtlibConsent` namespace.

You can also override the module's bundled locales from the consuming app. For example, if your app already has `i18n/locales/en.ts`, `i18n/locales/de.ts`, or `i18n/locales/pl.ts`, you can replace some keys or the entire `nuxtlibConsent` namespace there.

```ts
// i18n/locales/en.ts
export default {
  nuxtlibConsent: {
    title: 'Your custom title',
    buttons: {
      acceptAll: 'Your custom button label',
    },
  },
}
```

```ts
// i18n/locales/fr.ts
export default {
  nuxtlibConsent: {
    title: 'Nous utilisons des cookies',
    description: 'Nous utilisons des cookies et des technologies similaires pour faire fonctionner le site, mesurer son utilisation et, avec votre permission, personnaliser le contenu et la publicite.',
    categories: {
      analytics: {
        label: 'Analytiques',
        description: '...',
      },
      ads: {
        label: 'Publicite / marketing',
        description: '...',
      },
      personalization: {
        label: 'Personnalisation',
        description: '...',
      },
      functional: {
        label: 'Fonctionnels (preferences)',
        description: '...',
      },
    },
    buttons: {
      acceptAll: 'Tout accepter',
      customize: 'Personnaliser',
      hideSettings: 'Masquer les parametres',
      save: 'Enregistrer les parametres',
    },
  },
}
```

Notes:

- You only need to provide the `nuxtlibConsent` namespace in app locale files.
- The consuming app can override bundled `en`, `de`, and `pl` locales partially or completely by defining `nuxtlibConsent` in its own locale files.
- If you override the full namespace for a locale, provide every key your UI needs.
- If you override only part of the namespace, make sure your app i18n fallback config covers the remaining keys.
- Without Nuxt i18n, only the bundled `en`, `de`, and `pl` locales are available.


## How to Configure Google Analytics

GA sync is optional and is only loaded when you enable the integration explicitly.

```ts
export default defineNuxtConfig({
  modules: ['@nuxtlib/consent', '@nuxt/scripts'],
  scripts: {
    registry: {
      googleAnalytics: { id: 'G-XXXXXXXXXX' },
    },
  },
  nuxtlibConsent: {
    integrations: {
      googleAnalytics: true,
    },
  },
})
```

1. Install and enable `@nuxt/scripts`.
2. Add the GA measurement ID in `scripts.registry.googleAnalytics.id`.
3. Enable `nuxtlibConsent.integrations.googleAnalytics`.

Where to get the GA ID:

- Open Google Analytics (GA4) for your property.
- Go to `Admin` -> `Data Streams` -> open your Web stream.
- Copy the `Measurement ID` (format `G-XXXXXXXXXX`).

Behavior:

- On GA load, sends `gtag('consent', 'default', deniedState)`.
- Watches consent cookie state.
- Sends `gtag('consent', 'update', mappedState)` on changes.

If `nuxtlibConsent.integrations.googleAnalytics` is not enabled, this plugin is not added to the app at all.

For advanced script loading/configuration options, read the Nuxt Scripts docs: <https://scripts.nuxt.com/>.

## Testing

Recommended test path:

1. Open your app in a fresh session (incognito or cleared cookies).
2. Trigger real interaction (click/scroll) and confirm banner appears.
3. Choose consent options and verify cookies `<prefix>_decided` and `<prefix>_consent`.
4. Reopen settings through `toggleConsentVisibility()` and confirm the modal reflects the saved cookie state.
5. If `integrations.googleAnalytics` is enabled, verify analytics/debug behavior with one of these methods:

Method A: Google Tag Manager Preview / Tag Assistant (recommended when GTM is in your stack)

- Start GTM Preview for your site.
- Interact with the site and consent banner.
- Verify consent-related calls and page events in the preview timeline.

Method B: Chrome extension + GA DebugView

- Install and enable `Google Analytics Debugger` Chrome extension.
- Visit your app and trigger page/navigation events after consent.
- In GA4, open `DebugView` and confirm events appear from your debug session.

Tip:

- Test both first-load flow and "reopen settings" flow via `toggleConsentVisibility()`.

## Project Customization Map

- `src/module.ts`: module wiring (runtime config, auto-imports, component registration, and conditional plugin injection).
- `src/integrations.ts`: supported integration registry and validation rules.
- `src/runtime/composables/useConsent.ts`: consent categories + cookie persistence rules.
- `src/runtime/composables/useConsentI18n.ts`: consent text resolution with optional app i18n
- `src/runtime/lang/en.ts`: bundled English consent copy
- `src/runtime/lang/pl.ts`: bundled Polish consent copy
- `src/runtime/composables/useIsRealUser.ts`: real-user interaction detection strategy.
- `src/runtime/components/CookiesConsent.vue`: public wrapper component used in apps (`<CookiesConsent />`).
- `src/runtime/components/ConsentModal.client.vue`: modal UI copy, buttons, and category controls.
- `src/runtime/components/BaseSwitch.vue`: switch control used in modal category toggles.
- `src/runtime/plugins/ga.client.ts`: optional GA consent mapping and update calls.
- `src/runtime/tailwind.css`: Tailwind source export used via `@nuxtlib/consent/tailwind`.
- `src/runtime/augments.app.d.ts`: type augmentation for `runtimeConfig.public.nuxtlibConsent`.

## Troubleshooting

Consent banner never appears:

- Confirm you mounted `<CookiesConsent />`.
- Interact with the page first (click/scroll/key/touch); wrapper waits for a real-user signal.

Do I need `<ClientOnly>`?

- No. The module already registers `<CookiesConsent />` as client-only.
- You only need `ClientOnly` if you are wrapping your own custom consent UI outside the shipped component.

Seeing SSR / SWR header-write errors:

- Update to a version that includes the SSR-safe `useConsent()` change.
- The module now reads fallback consent state during SSR without emitting default `Set-Cookie` headers.

Cookies not persisting on localhost:

- Set `cookieSecure: false` while testing on `http://localhost`.
- Revert to `cookieSecure: true` for production HTTPS.

Consent UI is unstyled:

- Confirm Tailwind v4 is installed.
- Confirm Vite plugin `@tailwindcss/vite` is enabled.
- Confirm your CSS imports `@nuxtlib/consent/tailwind`.

Translations are not switching:

- Confirm `@nuxtjs/i18n` is installed and enabled.
- Put app overrides under the `nuxtlibConsent` namespace.
- If you provide partial overrides, confirm your app i18n fallback config is active.


GA consent updates missing:

- Confirm `nuxtlibConsent.integrations.googleAnalytics` is enabled.
- Confirm `@nuxt/scripts` is installed and enabled.
- Confirm `scripts.registry.googleAnalytics.id` is configured.

## Roadmap

### Opt out RealUsers only
Add a module option to disable real-user gating when teams need immediate banner rendering for all visitors (for strict legal/compliance flows), while keeping current behavior as default. Planned output: one explicit config flag and documented behavior matrix.

### More provider integrations
Extend the integration registry beyond Google Analytics so teams can opt into additional consent targets through the same explicit `nuxtlibConsent.integrations` interface. Planned output: more provider plugins, docs, and migration notes.

### Opt in show decline all button
Add a config flag to explicitly enable/disable a visible "Decline all" action in the modal so product/legal teams can align UI behavior with policy requirements. Planned output: UI config option plus accessibility and copy recommendations.

## Usage Cases

Use the saved consent state anywhere in your app through `useConsent()`.

Only enable a feature after the required consent was granted:

```vue
<script setup lang="ts">
const { consent } = useConsent()

const canRunAnalyticsFeature = computed(() => consent.value.analytics)
</script>

<template>
  <AnalyticsDashboard v-if="canRunAnalyticsFeature" />

  <p v-else>
    This feature is available only after analytics consent is accepted.
  </p>
</template>
```

Only initialize a third-party tool when consent changes to allowed:

```ts
const { consent } = useConsent()

watch(
  () => consent.value.functional,
  (allowed) => {
    if (!allowed || !import.meta.client) {
      return
    }

    startSupportChat()
  },
  { immediate: true },
)
```

Typical mappings in real apps:

- `analytics`: analytics SDKs, heatmaps, product metrics, A/B testing tools
- `ads`: ad pixels, retargeting scripts, conversion tracking
- `personalization`: recommendation engines, personalized content, ad personalization
- `functional`: support chat, saved UI preferences, embedded tools that are not strictly essential

This pattern works well when some parts of the app should stay hidden, disabled, or not initialized until the user has explicitly granted the matching consent category.

You can also use `<ConsentModal />` directly instead of `<CookiesConsent />` when you want full control over when the modal appears.

That is useful when:

- you do not want the built-in real-user gating from `<CookiesConsent />`
- you want to control the backdrop, placement, transitions, or surrounding layout yourself

Example:

```vue
<script setup lang="ts">
const consentModalRef = ref<{ syncFromCookies: () => void } | null>(null)
const showConsentModal = ref(false)

function openConsentModal() {
  consentModalRef.value?.syncFromCookies()
  showConsentModal.value = true
}
</script>

<template>
  <button @click="openConsentModal()">
    Privacy settings
  </button>

  <ConsentModal
    v-if="showConsentModal"
    ref="consentModalRef"
    @decision-has-been-made="showConsentModal = false"
  />
</template>
```

`<CookiesConsent />` is still the recommended default because it already handles the first-visit flow, real-user detection, lazy rendering, and reopen behavior. If you use `<ConsentModal />` directly, you are responsible for deciding when to show it and when to hide it.
