# Migration Guide and Change Log Since v1.0.1

This file documents the changes in the current repo state after the `v1.0.1` release.

Note:

- `package.json` is still on `1.0.1` at the moment.
- Treat this as migration guidance for the next release built on top of `v1.0.1`.

## Migration Guide

### 1. Google Analytics is now explicit opt-in

In `v1.0.1`, Google Analytics consent sync was effectively built in.
Now it is loaded only when you enable it explicitly.

Old setup:

```ts
export default defineNuxtConfig({
  modules: ['@nuxtlib/consent', '@nuxt/scripts'],
  scripts: {
    registry: {
      googleAnalytics: { id: 'G-XXXXXXXXXX' },
    },
  },
})
```

New setup:

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

If you do not want GA sync, remove `@nuxt/scripts` completely and do not enable the integration.

### 2. Runtime config uses `nuxtlibConsent`

If your app reads consent runtime config directly, use:

```ts
const config = useRuntimeConfig()
config.public.nuxtlibConsent
```

Do not read:

```ts
config.public.consent
```

### 3. Use `<CookiesConsent />` in app code

If you copied the old README example, update the component usage to:

```vue
<CookiesConsent ref="consentRef" />
```

and not:

```vue
<Consent ref="consentRef" />
```

### 4. Locale support is now built in

The module now supports built-in fallback locales:

- `en`
- `de`
- `pl`

If your app does not use `@nuxtjs/i18n`, you can set:

```ts
export default defineNuxtConfig({
  nuxtlibConsent: {
    locale: 'pl',
  },
})
```

If your app already uses Nuxt i18n, put your consent copy under the `nuxtlibConsent` namespace.

### 5. Local dev playgrounds changed

The old single `playground/` app was replaced by two demo apps:

- `playgrounds/without-i18n`
- `playgrounds/with-i18n`

Local commands also changed:

- old: `npm run dev`
- new: `npm run dev:no-i18n`
- new: `npm run dev:i18n`

## Change Log Since v1.0.1

### Added

- Optional Nuxt i18n support with built-in `en`, `de`, and `pl` consent messages.
- A dedicated `useConsentI18n()` composable for consent text resolution.
- A second playground app showing integration with `@nuxtjs/i18n`.
- Translation test coverage and integration validation test coverage.
- More complete README sections for public API, localization, usage cases, and provider setup.

### Changed

- Google Analytics consent sync is now optional instead of always on.
- Provider loading now goes through an explicit integration registry.
- `@nuxt/scripts` is now an optional peer dependency instead of a mandatory one for every install.
- Quickstart now documents base consent setup without assuming analytics.
- The module runtime config shape is aligned around `runtimeConfig.public.nuxtlibConsent`.
- The local playground structure moved from one app to two apps under `playgrounds/`.

### Breaking Changes

- Apps that relied on automatic GA sync must now enable `nuxtlibConsent.integrations.googleAnalytics`.
- Apps reading `runtimeConfig.public.consent` must switch to `runtimeConfig.public.nuxtlibConsent`.
- Apps following the old README example should use `<CookiesConsent />` instead of `<Consent />`.
- Local workflows using the old `playground/` path or `npm run dev` should switch to the new playground paths and commands.

