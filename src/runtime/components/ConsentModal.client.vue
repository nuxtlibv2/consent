<script setup lang="ts">
import { useConsent, type ConsentOptions } from '../composables/useConsent'
import { useConsentI18n } from '../composables/useConsentI18n'
import BaseSwitch from './BaseSwitch.vue'
import { ref, reactive } from 'vue'

// store
const { consent, acceptAll, setConsent } = useConsent()

const advanced = ref(false)

// WHAT: Refreshes the editable consent state from the persisted cookie-backed consent store.
// WHY: The modal can reopen after consent changes elsewhere, so stale local toggle values would be incorrect.
// HOW: It copies each stored consent category into the component's local reactive form state before editing.
// Just to make sure the local copy is in sync with cookies when the modal is opened, in case they were changed outside of this component (e.g. another tab)
function syncFromCookies() {
  local.analytics = consent.value.analytics
  local.ads = consent.value.ads
  local.personalization = consent.value.personalization
  local.functional = consent.value.functional
}

// local editable copy for the <details> panel
const local = reactive<ConsentOptions>({
  analytics: consent.value.analytics,
  ads: consent.value.ads,
  personalization: consent.value.personalization,
  functional: consent.value.functional,
})

defineExpose({
  syncFromCookies,
})

const emit = defineEmits(['decisionHasBeenMade'])

const { messages } = useConsentI18n()
</script>

<template>
  <!-- Positioned on the center -->
  <div
    class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 w-[calc(100vw-2rem)] sm:w-auto sm:max-w-3xl max-h-[calc(100vh-2rem)] overflow-auto font-sans leading-6 tracking-normal text-gray-900 bg-white border border-gray-200 rounded-lg shadow-xl"
    style="z-index: 100"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cookie-dialog-title"
    aria-describedby="cookie-dialog-desc"
    tabindex="-1"
  >
    <div class="flex gap-2 items-center">
      <p
        id="cookie-dialog-title"
        class="font-semibold text-2xl"
      >
        {{ messages.title }}
      </p>
    </div>

    <p
      id="cookie-dialog-desc"
      class="mt-2"
    >
      {{ messages.description }}
    </p>

    <Transition
      enter-active-class="transition-all duration-[540ms] ease-in-out"
      leave-active-class="transition-all duration-[540ms] ease-in-out"
      enter-from-class="opacity-0 max-h-0"
      leave-to-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[1000px]"
      leave-from-class="opacity-100 max-h-[1000px]"
    >
      <!-- sliding panel -->
      <div
        v-show="advanced"
        class="mt-4 border-t pt-4"
      >
        <!-- Analytics -->
        <div class="mt-4">
          <div class="flex items-center justify-between gap-4">
            <label
              id="analytics-label"
              class="md:text-xl"
              for="analytics"
            >{{ messages.categories.analytics.label }}</label>
            <BaseSwitch
              v-model="local.analytics"
              aria-labelledby="analytics-label"
            />
          </div>
          <p class="text-sm md:text-base mt-2">
            {{ messages.categories.analytics.description }}
          </p>
        </div>

        <!-- Ads / Marketing -->
        <div class="mt-4">
          <div class="flex items-center justify-between gap-4">
            <label
              id="ads-label"
              class="md:text-xl"
              for="ads"
            >{{ messages.categories.ads.label }}</label>
            <BaseSwitch
              v-model="local.ads"
              aria-labelledby="ads-label"
            />
          </div>
          <p class="text-sm md:text-base mt-2">
            {{ messages.categories.ads.description }}
          </p>
        </div>

        <!-- Personalization -->
        <div class="mt-4">
          <div class="flex items-center justify-between gap-4">
            <label
              id="personalization-label"
              class="md:text-xl"
              for="personalization"
            >{{ messages.categories.personalization.label }}</label>
            <BaseSwitch
              v-model="local.personalization"
              aria-labelledby="personalization-label"
            />
          </div>
          <p class="text-sm md:text-base mt-2">
            {{ messages.categories.personalization.description }}
          </p>
        </div>

        <!-- Functional -->
        <div class="mt-4">
          <div class="flex items-center justify-between gap-4">
            <label
              id="functional-label"
              class="md:text-xl"
              for="functional"
            >{{ messages.categories.functional.label }}</label>
            <BaseSwitch
              v-model="local.functional"
              aria-labelledby="functional-label"
            />
          </div>
          <p class="text-sm md:text-base mt-2">
            {{ messages.categories.functional.description }}
          </p>
        </div>

        <!-- Save -->
        <div class="flex justify-end gap-4 mt-6">
          <button
            class="cursor-pointer text-sm border border-gray-300 px-4 py-2 rounded-md hover:scale-110 transition"
            @click="
              setConsent(local);
              emit('decisionHasBeenMade');
            "
          >
            {{ messages.buttons.save }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Controll buttons -->
    <div class="flex flex-wrap gap-2 items-center mt-6">
      <button
        class="cursor-pointer text-sm px-4 py-2 hover:scale-110 transition bg-blue-600 border border-blue-600 rounded-md text-white"
        @click="
          acceptAll();
          emit('decisionHasBeenMade');
        "
      >
        {{ messages.buttons.acceptAll }}
      </button>
      <!-- <button
        class="cursor-pointer text-sm border border-gray-300 px-4 py-2 rounded-md hover:scale-110 transition"
        @click="
          declineAll(); emit('decisionHasBeenMade');
        "
      >
        Reject
      </button> -->

      <button
        class="text-sm cursor-pointer select-none px-4 py-2 border border-gray-300 inline-flex items-center gap-2 rounded-md hover:scale-110 transition"
        @click="advanced = !advanced"
      >
        <span>{{ advanced ? messages.buttons.hideSettings : messages.buttons.customize }}</span>
      </button>
    </div>
  </div>
</template>
