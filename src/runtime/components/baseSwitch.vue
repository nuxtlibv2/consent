<!-- components/BaseSwitch.vue -->
<template>

  <button
    type="button"
    role="switch"
    :aria-checked="(model == 'granted')"
    class="relative inline-flex h-6 w-11 items-center rounded-full transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-iq-secondary"
    :class="[(model == 'granted') ? 'bg-iq-secondary' : 'bg-gray-300']"
    @click="toggleModel"
  >
    <span
      :class="[
        'inline-block h-5 w-5 transform rounded-full bg-white transition',
        model == 'granted' ? 'translate-x-5' : 'translate-x-1',
      ]"
    />
  </button>
</template>

<script setup>
function toggleModel() {
  model.value = (model.value === 'granted') ? 'denied' : 'granted';
}
const model = defineModel();
</script>
