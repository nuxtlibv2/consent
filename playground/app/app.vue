<template>
  <nav class="bg-gray-800 text-white p-4 flex gap-4">
    <NuxtLink
      to="/"
      class="hover:underline"
    >Home</NuxtLink>
    <NuxtLink
      to="/test"
      class="hover:underline"
    >Test Page</NuxtLink>
    <NuxtLink
      to="/contact"
      class="hover:underline"
    >Contact Page</NuxtLink>
  </nav>
  <NuxtPage />
</template>
