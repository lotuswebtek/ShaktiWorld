import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { SignUp } from '@clerk/react'
import { CURRENT_LEGAL } from '../data/legal.js'
import { TermsConsent } from '../components/legal/TermsConsent.jsx'
import {
  clerkUnsafeMetadataFromConsent,
  readStoredLegalConsent,
  storeLegalConsent,
  clearStoredLegalConsent,
} from '../lib/legalConsent.js'

export default function Register() {
  const [params] = useSearchParams()
  const location = useLocation()
  const clerkSubpath = location.pathname !== '/register'
  const [accepted, setAccepted] = useState(() => Boolean(readStoredLegalConsent()) || clerkSubpath)
  const [consentRecord, setConsentRecord] = useState(() => readStoredLegalConsent())

  useEffect(() => {
    const next = params.get('next')
    if (next?.startsWith('/') && !next.startsWith('//')) {
      sessionStorage.setItem('sw_next', next)
    }
  }, [params])

  const handleAccept = (checked) => {
    setAccepted(checked)
    if (checked) {
      setConsentRecord(storeLegalConsent())
    } else {
      clearStoredLegalConsent()
      setConsentRecord(null)
    }
  }

  const showSignUp = accepted || clerkSubpath

  return (
    <section className="section">
      <div className="container form-shell">
        <div className="form-visual">
          <img src="/images/register-goddess.jpg" alt="Divine feminine illustration" />
        </div>
        <div>
          <p className="kicker">Register</p>
          <h2>Become part of Shaktiworld</h2>
          <p className="lede">
            Create your account to explore community spaces, listings, and resources shared by members.
          </p>

          {!clerkSubpath && (
            <TermsConsent checked={accepted} onChange={handleAccept} />
          )}

          {showSignUp ? (
            <div className="clerk-wrap">
              <SignUp
                path="/register"
                signInUrl="/log-in"
                unsafeMetadata={clerkUnsafeMetadataFromConsent(consentRecord)}
              />
            </div>
          ) : (
            <p className="legal-consent-hint">
              Accept the current Terms (version {CURRENT_LEGAL.terms}) to continue creating an account.
              Read the drafts:{' '}
              <Link to="/terms">Terms</Link>, <Link to="/privacy">Privacy</Link>,{' '}
              <Link to="/community-guidelines">Guidelines</Link>.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
