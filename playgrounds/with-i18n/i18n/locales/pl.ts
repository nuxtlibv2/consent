export default {
  demo: {
    title: 'Demo i18n zgody',
    description: 'Ta strona używa Nuxt i18n. Zmień język i ponownie otwórz okno zgody, aby sprawdzić źródło tekstu.',
    openModal: 'Otwórz okno zgody',
    activeLocale: 'Aktywny język',
    notesTitle: 'Co sprawdzić',
    noteOne: 'Angielski, polski i niemiecki powinny pochodzić z tłumaczeń dostarczonych przez moduł. Dwie wartości w języku polskim powinny być nadpisane przez aplikację playground.',
    noteTwo: 'Francuski jest dostarczony przez aplikację playground i powinien nadpisać moduł.',
    noteThree: 'Brakujące francuskie klucze zgody powinny spaść przez i18n aplikacji do angielskiego.',
  },
  nuxtlibConsent: {
    title: 'OVERRIDE TITLE',
    buttons: {
      acceptAll: 'OVERRIDE BUTTON',
    },
  },
}
