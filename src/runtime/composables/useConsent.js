// ~/composables/useConsent.js

export function useConsent() {
  const { public: pub } = useRuntimeConfig()
  const prefix = (pub && (pub.consentPrefix || pub.consent_prefix)) || 'default_cookie_prefix'
  const isProd = import.meta.env.PROD

  // Decision flag: has the user chosen?
  const decided = useCookie(prefix + '_decided', {
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    default: function () { return false }
  })

  // Normalized consent categories
  const consent = useCookie(prefix + '_consent', {
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    default: function () {
      return {
        // essential is implied true (not user-toggleable)
        analytics:       'denied',
        ads:             'denied',
        personalization: 'denied',
        functional:      'denied',
        ts: Date.now(),
        version: 1
      }
    }
  })



  // Domain actions (no provider logic here)
  const ALLOWED_KEYS = ['analytics', 'ads', 'personalization', 'functional']


function normalizeValue(v) {
  if (v === true) return 'granted'
  if (v === false) return 'denied'
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    if (s === 'granted' || s === 'grant') return 'granted'
    if (s === 'denied'  || s === 'deny')   return 'denied'
  }
  return null // invalid
}

function sanitizePatch(patch) {
  const out = {}
  const invalid = { keys: [], values: [] }

  for (const key of Object.keys(patch || {})) {
    if (!ALLOWED_KEYS.includes(key)) {
      invalid.keys.push(key)
      continue
    }
    const normalized = normalizeValue(patch[key])
    if (!normalized) {
      invalid.values.push([key, patch[key]])
      continue
    }
    out[key] = normalized
  }

  if (!import.meta.env.PROD && (invalid.keys.length || invalid.values.length)) {
    // Dev-only diagnostics
    // eslint-disable-next-line no-console
    console.warn('[consent] ignored fields', invalid)
  }
  return out
}

function shallowEqual(a, b) {
  for (const k of ALLOWED_KEYS) {
    if ((a && a[k]) !== (b && b[k])) return false
  }
  return true
}

// Domain actions (no provider logic here)
function setConsent(patch) {
  const clean = sanitizePatch(patch)
  if (Object.keys(clean).length === 0) return // nothing valid to set

  const next = { ...consent.value, ...clean }
  if (shallowEqual(next, consent.value)) return // no-op; don't bump ts

  consent.value = { ...next, ts: Date.now() } // bump ts only on actual change
  decided.value = true; // mark as decided
}


  function setAll(state) {
    setConsent({
      analytics: state, ads: state, personalization: state, functional: state
    })
  }
  function acceptAll()  { setAll('granted'); decided.value = true }
  function declineAll() { setAll('denied');  decided.value = true }
  function decide()     { decided.value = true }
  function resetDecision() { decided.value = false }



  return {
    // state
    consent,
    decided,

    // actions
    setConsent,
    acceptAll,
    declineAll,
    decide,
    resetDecision
  }
}
