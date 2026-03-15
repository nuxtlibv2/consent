export default {
  nuxtlibConsent: {
    title: 'We use cookies',
    description: 'We use cookies and similar technologies to run the site, measure usage, and, with your permission, personalize content and advertising.',
    categories: {
      analytics: {
        label: 'Analytics',
        description: 'Measures page views, clicks and basic device info so we can debug, plan capacity and improve content. Reports are aggregated and not used to build advertising profiles.',
      },
      ads: {
        label: 'Ads / Marketing',
        description: 'Enables advertising and conversion measurement. Ad partners may store identifiers to show or measure ads across sites.',
      },
      personalization: {
        label: 'Personalization',
        description: 'Uses your interactions such as pages viewed and settings to adapt content, remember preferences beyond strict necessity and improve your experience. Turning this off means a more generic site.',
      },
      functional: {
        label: 'Functional (preferences)',
        description: 'Stores settings that make the site easier to use, such as remembering forms or accessibility options. Essential security and availability features remain on even if you disable this category.',
      },
    },
    buttons: {
      acceptAll: 'Accept all',
      customize: 'Customize',
      hideSettings: 'Hide settings',
      save: 'Save settings',
    },
    essentialNotice: 'Essential cookies remain enabled to keep the site secure and available.',
  },
}
