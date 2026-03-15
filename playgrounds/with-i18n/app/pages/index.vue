<script setup lang="ts">
const consentRef = ref<{ toggleConsentVisibility: () => void } | null>(null)

const { isRealUser } = useIsRealUser()
const { consent, decided, setConsent, declineAll } = useConsent()
const { locale, setLocale, t } = useI18n()
const config = useRuntimeConfig()

useHead(() => ({
  title: `${t('demo.title')} | With i18n`,
}))

const cookiePrefix = computed(() => config.public.nuxtlibConsent.cookiePrefix as string)

const summaryRows = computed(() => [
  {
    label: t('demo.activeLocale'),
    value: locale.value.toUpperCase(),
  },
  {
    label: 'Visitor detector',
    value: isRealUser.value ? 'Real user confirmed' : 'Waiting for interaction',
  },
  {
    label: 'Decision state',
    value: decided.value ? 'Saved in cookies' : 'No decision yet',
  },
])

const previewRows = computed(() => [
  {
    label: 'Modal title',
    value: t('nuxtlibConsent.title'),
  },
  {
    label: 'Accept all button',
    value: t('nuxtlibConsent.buttons.acceptAll'),
  },
  {
    label: 'Customize button',
    value: t('nuxtlibConsent.buttons.customize'),
  },
  {
    label: 'Analytics label',
    value: t('nuxtlibConsent.categories.analytics.label'),
  },
])

const notes = computed(() => [
  t('demo.noteOne'),
  t('demo.noteTwo'),
  t('demo.noteThree'),
])

const consentRows = computed(() => [
  {
    key: 'analytics',
    label: t('nuxtlibConsent.categories.analytics.label'),
    enabled: consent.value.analytics,
  },
  {
    key: 'ads',
    label: t('nuxtlibConsent.categories.ads.label'),
    enabled: consent.value.ads,
  },
  {
    key: 'personalization',
    label: t('nuxtlibConsent.categories.personalization.label'),
    enabled: consent.value.personalization,
  },
  {
    key: 'functional',
    label: t('nuxtlibConsent.categories.functional.label'),
    enabled: consent.value.functional,
  },
])

const cookieRows = computed(() => [
  {
    label: `${cookiePrefix.value}_decided`,
    value: String(decided.value),
  },
  {
    label: `${cookiePrefix.value}_consent`,
    value: JSON.stringify(consent.value, null, 2),
  },
])

async function switchLocale(code: 'en' | 'de' | 'pl' | 'fr') {
  if (locale.value === code) {
    return
  }

  await setLocale(code)
}

function resetConsent() {
  consent.value = {
    analytics: false,
    ads: false,
    personalization: false,
    functional: false,
  }
  decided.value = false
}

function applyAnalyticsPreset() {
  setConsent({
    analytics: true,
    ads: false,
    personalization: false,
    functional: true,
  })
}
</script>

<template>
  <main class="space-y-6">
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="space-y-4">
        <div>
          <p class="text-sm font-medium text-slate-500">
            Nuxt i18n mode
          </p>
          <h2 class="mt-1 text-3xl font-semibold text-slate-900">
            {{ t('demo.title') }}
          </h2>
          <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {{ t('demo.description') }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            @click="consentRef?.toggleConsentVisibility()"
          >
            {{ t('demo.openModal') }}
          </button>
          <button
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="applyAnalyticsPreset()"
          >
            Analytics preset
          </button>
          <button
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="declineAll()"
          >
            Reject all
          </button>
          <button
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="resetConsent()"
          >
            Reset
          </button>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium"
            :class="locale === 'en' ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'"
            @click="switchLocale('en')"
          >
            English
          </button>
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium"
            :class="locale === 'de' ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'"
            @click="switchLocale('de')"
          >
            Deutsch
          </button>
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium"
            :class="locale === 'pl' ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'"
            @click="switchLocale('pl')"
          >
            Polski
          </button>
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium"
            :class="locale === 'fr' ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'"
            @click="switchLocale('fr')"
          >
            Francais
          </button>
        </div>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="space-y-6">
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-slate-900">
            Current state
          </h3>

          <div class="mt-4 space-y-3">
            <div
              v-for="row in summaryRows"
              :key="row.label"
              class="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3"
            >
              <span class="text-sm font-medium text-slate-600">{{ row.label }}</span>
              <span class="text-sm font-semibold text-slate-900">{{ row.value }}</span>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-slate-900">
            Consent copy preview
          </h3>

          <div class="mt-4 space-y-3">
            <div
              v-for="row in previewRows"
              :key="row.label"
              class="rounded-xl border border-slate-200 px-4 py-3"
            >
              <p class="text-sm font-medium text-slate-500">
                {{ row.label }}
              </p>
              <p class="mt-1 text-sm font-semibold text-slate-900">
                {{ row.value }}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section class="space-y-6">
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <h3 class="text-lg font-semibold text-slate-900">
              Consent categories
            </h3>

            <button
              class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              @click="consentRef?.toggleConsentVisibility()"
            >
              Reopen modal
            </button>
          </div>

          <div class="mt-4 space-y-3">
            <div
              v-for="row in consentRows"
              :key="row.key"
              class="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3"
            >
              <span class="text-sm font-medium text-slate-700">{{ row.label }}</span>
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="row.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
              >
                {{ row.enabled ? 'Enabled' : 'Off' }}
              </span>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-slate-900">
            What to verify
          </h3>

          <ul class="mt-4 space-y-3">
            <li
              v-for="note in notes"
              :key="note"
              class="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
            >
              {{ note }}
            </li>
          </ul>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-slate-900">
            Cookie snapshot
          </h3>

          <div class="mt-4 space-y-4">
            <div
              v-for="row in cookieRows"
              :key="row.label"
              class="rounded-xl bg-slate-900 p-4 text-white"
            >
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                {{ row.label }}
              </p>
              <pre class="mt-2 whitespace-pre-wrap text-sm leading-6">{{ row.value }}</pre>
            </div>
          </div>
        </article>
      </section>
    </div>

    <CookiesConsent ref="consentRef" />
  </main>
</template>
