<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useConsent } from '../composables/useConsent'
import { useIsRealUser } from '../composables/useIsRealUser'

const props = withDefaults(defineProps<{
  showDeclineButton?: boolean
  enableBackground?: boolean
}>(), {
  showDeclineButton: false,
  enableBackground: false,
})

const { isRealUser } = useIsRealUser()
const { decided } = useConsent()

const consentModalRef = ref<{ syncFromCookies: () => void } | null>(null)

const show = ref(false)
const toggleConsentVisibility = () => {
  show.value = !show.value
}

const showBanner = computed<boolean>(
  () => isRealUser.value && (!decided.value || show.value),
)

watch(showBanner, (val) => {
  if (val == true) {
    // sync cookies
    consentModalRef.value?.syncFromCookies()
  }
})

defineExpose({
  toggleConsentVisibility,
})
</script>

<template>
  <LazyConsentModal
    v-if="showBanner"
    ref="consentModalRef"
    :show-decline-button="props.showDeclineButton"
    :enable-background="props.enableBackground"
    @decision-has-been-made="show = false"
  />
</template>
