<script setup lang="ts">
const consentRef = ref<{ toggleConsentVisibility: () => void } | null>(null)

const { isRealUser } = useIsRealUser()
const { consent, decided, acceptAll, declineAll, setConsent } = useConsent()
const config = useRuntimeConfig()

useHead({
  title: 'Consent Playground | Without i18n',
})

const cookiePrefix = computed(() => config.public.nuxtlibConsent.cookiePrefix as string)
const fallbackLocale = computed(() => (config.public.nuxtlibConsent.locale || 'en').toUpperCase())

const summaryRows = computed(() => [
  {
    label: 'Visitor detector',
    value: isRealUser.value ? 'Real user confirmed' : 'Waiting for interaction',
  },
  {
    label: 'Decision state',
    value: decided.value ? 'Saved in cookies' : 'No decision yet',
  },
  {
    label: 'Module locale',
    value: fallbackLocale.value,
  },
])

const consentRows = computed(() => [
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Usage measurement and GA storage.',
    enabled: consent.value.analytics,
  },
  {
    key: 'ads',
    label: 'Ads',
    description: 'Advertising and conversion-related storage.',
    enabled: consent.value.ads,
  },
  {
    key: 'personalization',
    label: 'Personalization',
    description: 'Personalized content and ad behavior.',
    enabled: consent.value.personalization,
  },
  {
    key: 'functional',
    label: 'Functional',
    description: 'Preferences that improve repeat visits.',
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

const testSteps = [
  'Wejdź na stronę, zrób jedną interakcję i sprawdź, czy prompt pojawia się dopiero po wykryciu real usera.',
  'Zapisz decyzję, odśwież stronę i potwierdź, że stan wraca z cookies.',
  'Kliknij reset i sprawdź ponownie flow pierwszej wizyty bez ręcznego czyszczenia storage.',
]

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
            Manual locale mode
          </p>
          <h2 class="mt-1 text-3xl font-semibold text-slate-900">
            Simple page to test first-visit consent flow
          </h2>
          <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            This playground does not use Nuxt i18n. It is meant to verify real-user gating,
            cookie persistence, and manual reopening of the consent modal with as little noise as possible.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            @click="consentRef?.toggleConsentVisibility()"
          >
            Open consent modal
          </button>
          <button
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            @click="acceptAll()"
          >
            Accept all
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
          <div class="flex items-center justify-between gap-4">
            <h3 class="text-lg font-semibold text-slate-900">
              Consent categories
            </h3>

            <button
              class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              @click="applyAnalyticsPreset()"
            >
              Analytics preset
            </button>
          </div>

          <div class="mt-4 space-y-3">
            <div
              v-for="row in consentRows"
              :key="row.key"
              class="rounded-xl border border-slate-200 px-4 py-3"
            >
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-semibold text-slate-900">
                    {{ row.label }}
                  </p>
                  <p class="mt-1 text-sm text-slate-600">
                    {{ row.description }}
                  </p>
                </div>

                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="row.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
                >
                  {{ row.enabled ? 'Enabled' : 'Off' }}
                </span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section class="space-y-6">
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

        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-slate-900">
            Quick test checklist
          </h3>

          <ol class="mt-4 space-y-3">
            <li
              v-for="(step, index) in testSteps"
              :key="step"
              class="flex gap-3 rounded-xl bg-slate-50 px-4 py-3"
            >
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {{ index + 1 }}
              </span>
              <span class="text-sm leading-6 text-slate-700">{{ step }}</span>
            </li>
          </ol>
        </article>
      </section>
    </div>

    <CookiesConsent ref="consentRef" />
  </main>
</template>
