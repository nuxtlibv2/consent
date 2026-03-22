import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  routeRules: {
    '/': { swr: 60 },
  },
})
