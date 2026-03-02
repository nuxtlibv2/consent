<script setup lang="ts">
const consentRef = ref<{ toggleConsentVisibility: () => void } | null>(null);
const { isRealUser } = useIsRealUser();
</script>

<template>
  <main class="bg-gray-100 flex justify-center p-10 flex-col gap-10">
    <h1 class="text-2xl font-bold mb-4">Welcome to the Consent Playground</h1>
    <h2>
      {{
        isRealUser
          ? "You are a real user"
          : "You are not a real user (probably a bot or crawler)"
      }}
    </h2>

    <button
      class="border border-red-500 p-4"
      @click="consentRef?.toggleConsentVisibility()"
    >
      Cookie settings
    </button>
    <Consent ref="consentRef" />
  </main>
</template>
