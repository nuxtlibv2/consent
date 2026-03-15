export default {
  demo: {
    title: 'Consent i18n demo',
    description: 'This page uses Nuxt i18n. Switch the language and reopen the consent UI to verify the text source.',
    openModal: 'Open consent modal',
    activeLocale: 'Active locale',
    notesTitle: 'What to check',
    noteOne: 'English, Polish, and German should come from the module bundled translations. Two Polish values should be overridden by the playground app.',
    noteTwo: 'French is provided by the playground app and should override the module.',
    noteThree: 'Missing French consent keys should fall back through app i18n to English.',
  },
}
