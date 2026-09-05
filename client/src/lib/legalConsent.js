import { CURRENT_LEGAL } from '../data/legal.js'

export const LEGAL_CONSENT_STORAGE_KEY = 'sw_legal_consent'

/**
 * @typedef {{
 *   termsVersion: string,
 *   privacyVersion: string,
 *   guidelinesVersion: string,
 *   acceptedAt: string,
 * }} LegalConsentRecord
 */

/**
 * @returns {LegalConsentRecord | null}
 */
export function readStoredLegalConsent() {
  try {
    const raw = sessionStorage.getItem(LEGAL_CONSENT_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data?.termsVersion !== CURRENT_LEGAL.terms) return null
    if (typeof data.acceptedAt !== 'string') return null
    return data
  } catch {
    return null
  }
}

/**
 * @returns {LegalConsentRecord}
 */
export function storeLegalConsent() {
  const record = {
    termsVersion: CURRENT_LEGAL.terms,
    privacyVersion: CURRENT_LEGAL.privacy,
    guidelinesVersion: CURRENT_LEGAL.guidelines,
    acceptedAt: new Date().toISOString(),
  }
  sessionStorage.setItem(LEGAL_CONSENT_STORAGE_KEY, JSON.stringify(record))
  return record
}

export function clearStoredLegalConsent() {
  sessionStorage.removeItem(LEGAL_CONSENT_STORAGE_KEY)
}

export function clerkUnsafeMetadataFromConsent(record) {
  if (!record) return {}
  return {
    termsVersion: record.termsVersion,
    privacyVersion: record.privacyVersion,
    guidelinesVersion: record.guidelinesVersion,
    termsAcceptedAt: record.acceptedAt,
  }
}
