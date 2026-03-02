<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useConsent } from "../composables/useConsent";
import { useIsRealUser } from "../composables/useIsRealUser";
const consentModalRef = ref<{ syncFromCookies: () => void } | null>(null);
const { isRealUser } = useIsRealUser();
const { decided } = useConsent();
const show = ref(false);

const toggleConsentVisibility = () => {
  show.value = !show.value;
};

const showBanner = computed<boolean>(
  () => isRealUser.value && (!decided.value || show.value)
);

watch(showBanner, (val) => {
  if (val == true) {
    // sync cookies
    consentModalRef.value?.syncFromCookies();
  }
});

defineExpose({
  toggleConsentVisibility,
});
</script>

<template>
  <LazyConsentModal ref="consentModalRef" v-if="showBanner" />
</template>
