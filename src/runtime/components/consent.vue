<script setup>
// store
const { consent, decided, acceptAll, declineAll, setConsent } = useConsent();

const advanced = ref(false);

// local overlay toggle so users can reopen after deciding
const show = ref(false);
function toggleConsentManagement() {
  // sync latest values when opening from footer/link
  if (!show.value) {
    local.analytics = consent.value.analytics;
    local.ads = consent.value.ads;
    local.personalization = consent.value.personalization;
    local.functional = consent.value.functional;
  }

  show.value = !show.value;
}

// local editable copy for the <details> panel
const local = reactive({
  analytics: consent.value.analytics,
  ads: consent.value.ads,
  personalization: consent.value.personalization,
  functional: consent.value.functional,
});

function onSave() {
  setConsent({
    analytics: local.analytics,
    ads: local.ads,
    personalization: local.personalization,
    functional: local.functional,
  });
  show.value = false;
}

defineExpose({
  toggleConsentManagement,
});
</script>

<template>


  <!-- Positioned on the center -->
  <div
    class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
p-4 w-[calc(100vw-2rem)] sm:w-auto sm:max-w-3xl
max-h-[calc(100vh-2rem)] overflow-auto
font-iq-paragraph leading-iq-paragraph tracking-iq-paragraph text-iq-paragraph-color"
    style="z-index: 100"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cookie-dialog-title" 
    aria-describedby="cookie-dialog-desc"
    tabindex="-1"
    v-show="show || !decided"
  >
    <div class="flex gap-2 items-center">
      <p id="cookie-dialog-title" class="font-semibold text-2xl">We use cookies</p>
      <slot name="cookie-icon">
        <Icon name="material-symbols:cookie" class="text-xl" />
      </slot>
    </div>

    <p id="cookie-dialog-desc" class="mt-2">
      We use cookies and similar technologies to run the site, measure usage, and (with
      your permission) personalize content and advertising.
    </p>


    <Transition name="slide-fade">
      <!-- sliding panel -->
      <div v-show="advanced" class="mt-4 border-t pt-4 overflow-hidden">
      

        <!-- Analytics -->
        <div class="mt-4">
          <div class="flex items-center justify-between gap-4">
            <label id="analytics-label" class="md:text-xl" for="analytics">Analytics</label>
            <PublicMiscBaseSwitch
              v-model="local.analytics"
              aria-labelledby="analytics-label"
            />
          
          </div>
          <p class="text-sm md:text-base mt-2">
            Measures page views, clicks and basic device info so we can debug, plan capacity and improve content. Reports are aggregated and not used to build advertising profiles.
          </p>
        </div>

        <!-- Ads / Marketing -->
        <div class="mt-4">
          <div class="flex items-center justify-between gap-4">
            <label
            id="ads-label"
             class="md:text-xl" for="ads">Ads / Marketing</label>
            <PublicMiscBaseSwitch
              v-model="local.ads"
              aria-labelledby="ads-label"
            />
          </div>
          <p class="text-sm md:text-base mt-2">
            Enables advertising and conversion measurement. Ad partners may store identifiers to show or measure ads across sites.
          </p>
        </div>

        <!-- Personalization -->
        <div class="mt-4">
          <div class="flex items-center justify-between gap-4">
            <label
              id="personalization-label"
             class="md:text-xl" for="personalization">Personalization</label>
            <PublicMiscBaseSwitch
              v-model="local.personalization"
              aria-labelledby="personalization-label"
            />
          </div>
          <p class="text-sm md:text-base mt-2">
            Uses your interactions (e.g. pages viewed, settings) to adapt content, remember preferences beyond strict necessity and improve your experience. Turning this off means a more generic site.
          </p>
        </div>

        <!-- Functional -->
        <div class="mt-4">
          <div class="flex items-center justify-between gap-4">
            <label
              id="functional-label"
             class="md:text-xl" for="functional">Functional (preferences)</label>
            <PublicMiscBaseSwitch
              v-model="local.functional"
              aria-labelledby="functional-label"
            />
          </div>
          <p class="text-sm md:text-base mt-2">
            Stores settings that make the site easier to use, such as remembering forms or accessibility options. Essential security and availability features remain on even if you disable this category.
          </p>
        </div>

        <!-- Save -->
        <div class="flex justify-end gap-4 mt-6">
          <button class="cursor-pointer text-sm border px-4 py-2 rounded-iq-roundness hover:scale-110 transition" @click="onSave">Save</button>
        </div>
      </div>
    </Transition>

    <!-- Controll buttons -->
    <div class="flex flex-wrap gap-2 items-center mt-6">
      <button
        class="cursor-pointer text-sm px-4 py-2 hover:scale-110 transition bg-iq-primary border-iq-primary rounded-iq-roundness text-iq-paragraph-secondary-color"
        @click="
          acceptAll();
          show = false;
        "
      >
        Accept
      </button>
      <button
        class="cursor-pointer text-sm border px-4 py-2 rounded-iq-roundness hover:scale-110 transition"
        @click="
          declineAll();
          show = false;
        "
      >
        Reject
      </button>

      <button
        class="text-sm cursor-pointer select-none px-4 py-2 border inline-flex items-center gap-2 rounded-iq-roundness hover:scale-110 transition"
        @click="advanced = !advanced"
      >
        <span>Customize</span>
        <Icon name="material-symbols:settings" class="" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 540ms ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;

  max-height: 0; /* collapsed */
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  max-height: 1000px; /* big enough to fit content */
}
</style>
