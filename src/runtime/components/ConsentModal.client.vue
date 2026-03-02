<script setup lang="ts">
import { useConsent, type ConsentOptions } from '../composables/useConsent';
import BaseSwitch from './BaseSwitch.vue';
import { ref, reactive } from 'vue'

// store
const { consent, acceptAll, declineAll, setConsent } = useConsent();

const advanced = ref(false);


// Just to make sure the local copy is in sync with cookies when the modal is opened, in case they were changed outside of this component (e.g. another tab)
function syncFromCookies() {
  local.analytics = consent.value.analytics;
  local.ads = consent.value.ads;
  local.personalization = consent.value.personalization;
  local.functional = consent.value.functional;
}

// local editable copy for the <details> panel
const local = reactive<ConsentOptions>({
  analytics: consent.value.analytics,
  ads: consent.value.ads,
  personalization: consent.value.personalization,
  functional: consent.value.functional,
});


defineExpose({
  syncFromCookies
});

const emit = defineEmits(['decisionHasBeenMade']);
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
      <p id="cookie-dialog-title" class="font-semibold text-2xl">We use cookies</p>

    </div>

    <p id="cookie-dialog-desc" class="mt-2">
      We use cookies and similar technologies to run the site, measure usage, and (with
      your permission) personalize content and advertising.
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
      <div v-show="advanced" class="mt-4 border-t pt-4 overflow-hidden">
        <!-- Analytics -->
        <div class="mt-4">
          <div class="flex items-center justify-between gap-4">
            <label id="analytics-label" class="md:text-xl" for="analytics"
              >Analytics</label
            >
            <BaseSwitch v-model="local.analytics" aria-labelledby="analytics-label" />
          </div>
          <p class="text-sm md:text-base mt-2">
            Measures page views, clicks and basic device info so we can debug, plan
            capacity and improve content. Reports are aggregated and not used to build
            advertising profiles.
          </p>
        </div>

        <!-- Ads / Marketing -->
        <div class="mt-4">
          <div class="flex items-center justify-between gap-4">
            <label id="ads-label" class="md:text-xl" for="ads">Ads / Marketing</label>
            <BaseSwitch v-model="local.ads" aria-labelledby="ads-label" />
          </div>
          <p class="text-sm md:text-base mt-2">
            Enables advertising and conversion measurement. Ad partners may store
            identifiers to show or measure ads across sites.
          </p>
        </div>

        <!-- Personalization -->
        <div class="mt-4">
          <div class="flex items-center justify-between gap-4">
            <label id="personalization-label" class="md:text-xl" for="personalization"
              >Personalization</label
            >
            <BaseSwitch
              v-model="local.personalization"
              aria-labelledby="personalization-label"
            />
          </div>
          <p class="text-sm md:text-base mt-2">
            Uses your interactions (e.g. pages viewed, settings) to adapt content,
            remember preferences beyond strict necessity and improve your experience.
            Turning this off means a more generic site.
          </p>
        </div>

        <!-- Functional -->
        <div class="mt-4">
          <div class="flex items-center justify-between gap-4">
            <label id="functional-label" class="md:text-xl" for="functional"
              >Functional (preferences)</label
            >
            <BaseSwitch v-model="local.functional" aria-labelledby="functional-label" />
          </div>
          <p class="text-sm md:text-base mt-2">
            Stores settings that make the site easier to use, such as remembering forms or
            accessibility options. Essential security and availability features remain on
            even if you disable this category.
          </p>
        </div>

        <!-- Save -->
        <div class="flex justify-end gap-4 mt-6">
          <button
            class="cursor-pointer text-sm border border-gray-300 px-4 py-2 rounded-md hover:scale-110 transition"
            @click="setConsent(local); emit('decisionHasBeenMade')"
          >
            Save
          </button>
        </div>
      </div>
    </Transition>

    <!-- Controll buttons -->
    <div class="flex flex-wrap gap-2 items-center mt-6">
      <button
        class="cursor-pointer text-sm px-4 py-2 hover:scale-110 transition bg-blue-600 border border-blue-600 rounded-md text-white"
        @click="
          acceptAll(); emit('decisionHasBeenMade');
        "
      >
        Accept
      </button>
      <button
        class="cursor-pointer text-sm border border-gray-300 px-4 py-2 rounded-md hover:scale-110 transition"
        @click="
          declineAll(); emit('decisionHasBeenMade');
        "
      >
        Reject
      </button>

      <button
        class="text-sm cursor-pointer select-none px-4 py-2 border border-gray-300 inline-flex items-center gap-2 rounded-md hover:scale-110 transition"
        @click="advanced = !advanced"
      >
        <span>Customize</span>
      </button>
    </div>
  </div>
</template>
