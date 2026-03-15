<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Consent Playground
          </p>
          <h1 class="text-2xl font-semibold">
            With Nuxt i18n
          </h1>
        </div>

        <span class="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          Port 3002
        </span>
      </div>
    </header>

    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <NuxtPage />
    </div>
  </div>
</template>
