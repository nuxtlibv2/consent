<!-- components/BaseSwitch.vue -->
<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model === true"
    class="relative inline-flex h-6 w-11 items-center rounded-full transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
    :class="[model === true ? 'bg-blue-600' : 'bg-gray-300']"
    @click="toggleModel"
  >
    <span
      :class="[
        'inline-block h-5 w-5 transform rounded-full bg-white transition',
        model === true ? 'translate-x-5' : 'translate-x-1',
      ]"
    />
  </button>
</template>

<script setup lang="ts">
function toggleModel() {
  model.value = model.value !== true
}

const model = defineModel<boolean>({ default: false })
</script>
