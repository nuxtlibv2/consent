# @nuxtlib/consent

For Nuxt teams that want consent UX without hurting performance, this how-to gets you to a real-user-gated banner, persisted consent cookies, and Google Analytics consent updates.

This module is optimized to stay lightweight in real apps:

- Consent UI is shown only for real users after interaction signals (click, touch, key, scroll, pointer movement threshold).
- The dialog is lazy-rendered through `<CookieConsent />`, so modal UI is not eagerly mounted for bots/crawlers or non-interactive traffic.
- Interaction listeners are cleaned up after the user is confirmed as real, avoiding long-lived event overhead.

Search terms: `nuxt cookie consent`, `gdpr banner nuxt`, `google consent mode`, `nuxt scripts consent`, `tailwind v4 nuxt module`.

## Navigation

- [Quickstart](#quickstart)
- [How to Configure Google Analytics](#how-to-configure-google-analytics)
- [Testing](#testing)
- [Project Customization Map](#project-customization-map)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

## Quickstart

Copy/paste minimal setup:

Install dependencies:

```bash
npm install -D @nuxtlib/consent @nuxt/scripts tailwindcss @tailwindcss/vite
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
  modules: ['@nuxtlib/consent', '@nuxt/scripts'],
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  scripts: {
    registry: {
      googleAnalytics: { id: 'G-XXXXXXXXXX' },
    },
  },
  nuxtlibConsent: {
    cookiePrefix: 'myapp_name', // cookie key namespace
    cookieSecure: true, // OPTIONAL, default true, set to false when you want to test on localhost
    cookieMaxAge: 60 * 60 * 24 * 365, // OPTIONAL - default 1 year, in seconds
  },
})
```

`app.vue`:

```vue
<script setup lang="ts">
const consentRef = ref<{ toggleConsentVisibility: () => void } | null>(null)
</script>

<template>
  <button @click="consentRef?.toggleConsentVisibility()">Cookie settings</button>
  <CookieConsent ref="consentRef" />
</template>
```

Run:

```bash
npm run dev
```

Expected result:

- Consent state is stored in `<prefix>_decided` and `<prefix>_consent` cookies.
- Banner appears only after real-user interaction.
- GA consent is sent as `default: denied`, then updated from consent state.

Use `cookieSecure: false` only for local HTTP testing. Set `cookieSecure: true` in production HTTPS.

## How to Configure Google Analytics

GA sync is built into the module through `src/runtime/plugins/ga.client.ts`.

1. Add GA measurement ID in `scripts.registry.googleAnalytics.id`.
2. Keep `@nuxt/scripts` and `@nuxtlib/consent` enabled in `modules`.

Where to get the GA ID:

- Open Google Analytics (GA4) for your property.
- Go to `Admin` -> `Data Streams` -> open your Web stream.
- Copy the `Measurement ID` (format `G-XXXXXXXXXX`).

Behavior:

- On GA load, sends `gtag('consent', 'default', deniedState)`.
- Watches consent cookie state.
- Sends `gtag('consent', 'update', mappedState)` on changes.

For advanced script loading/configuration options, read the Nuxt Scripts docs: <https://scripts.nuxt.com/>.

## Testing

Recommended test path for consent + GA behavior:

1. Open your app in a fresh session (incognito or cleared cookies).
2. Trigger real interaction (click/scroll) and confirm banner appears.
3. Choose consent options and verify cookies `<prefix>_decided` and `<prefix>_consent`.
4. Verify analytics/debug behavior with one of these methods:

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

- `src/module.ts`: module wiring (runtime config, auto-imports, component registration, plugin injection).
- `src/runtime/composables/useConsent.ts`: consent categories + cookie persistence rules.
- `src/runtime/composables/useIsRealUser.ts`: real-user interaction detection strategy.
- `src/runtime/components/Consent.vue`: public integration component used in apps (`<Consent />`).
- `src/runtime/components/ConsentModal.client.vue`: modal UI copy, buttons, and category controls.
- `src/runtime/components/BaseSwitch.vue`: switch control used in modal category toggles.
- `src/runtime/plugins/ga.client.ts`: GA consent mapping and update calls.
- `src/runtime/tailwind.css`: Tailwind source export used via `@nuxtlib/consent/tailwind`.
- `src/runtime/augments.app.d.ts`: type augmentation for `runtimeConfig.public.consent`.

## Troubleshooting

Consent banner never appears:

- Confirm you mounted `<Consent />`.
- Interact with the page first (click/scroll/key/touch); wrapper waits for a real-user signal.

Cookies not persisting on localhost:

- Set `cookieSecure: false` while testing on `http://localhost`.
- Revert to `cookieSecure: true` for production HTTPS.

Consent UI is unstyled:

- Confirm Tailwind v4 is installed.
- Confirm Vite plugin `@tailwindcss/vite` is enabled.
- Confirm your CSS imports `@nuxtlib/consent/tailwind`.

GA consent updates missing:

- Confirm `@nuxt/scripts` is installed and enabled.
- Confirm `scripts.registry.googleAnalytics.id` is configured.

## Roadmap

### Internalization
Opt-in i18n support, but keep English defaults for non-i18n users.

### Opt out RealUsers only
Add a module option to disable real-user gating when teams need immediate banner rendering for all visitors (for strict legal/compliance flows), while keeping current behavior as default. Planned output: one explicit config flag and documented behavior matrix.

### GA plugin opt-in + multi-provider support
Make GA sync disabled by default and introduce provider selection in module config so apps can choose GA, GTM-based flows, or other consent providers from a unified interface. Planned output: provider registry, per-provider docs, and migration notes.

### Opt in show decline all button
Add a config flag to explicitly enable/disable a visible "Decline all" action in the modal so product/legal teams can align UI behavior with policy requirements. Planned output: UI config option plus accessibility and copy recommendations.
