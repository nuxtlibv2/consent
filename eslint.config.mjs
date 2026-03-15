// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
  dirs: {
    src: ['./playgrounds'],
  },
}).append(
  {
    ignores: [
    ],
  },

  // Nuxt page files such as `index.vue` are intentionally single-word.
  {
    files: ['playgrounds/**/app/pages/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
)
