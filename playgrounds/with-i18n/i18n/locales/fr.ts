export default {
  demo: {
    title: 'Démo i18n du consentement',
    description: 'Cette page utilise Nuxt i18n. Changez la langue puis rouvrez l\'interface de consentement pour vérifier la source du texte.',
    openModal: 'Ouvrir la fenêtre de consentement',
    activeLocale: 'Langue active',
    notesTitle: 'Ce qu’il faut vérifier',
    noteOne: 'L’anglais, le polonais et l’allemand doivent venir des traductions fournies par le module. Deux valeurs en polonais doivent être remplacées par l’application playground.',
    noteTwo: 'Le français est fourni par l’application playground et doit remplacer le module.',
    noteThree: 'Les clés françaises manquantes du consentement doivent retomber sur l’anglais via i18n.',
  },
  nuxtlibConsent: {
    title: 'Nous utilisons des cookies',
    buttons: {
      acceptAll: 'Tout accepter',
    },
  },
}
