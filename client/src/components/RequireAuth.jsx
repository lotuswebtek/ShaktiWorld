import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import useOnboarding from '../hooks/useOnboarding.js'
import { memberRegisterPath } from './NavItem.jsx'

/**
 * Wraps member-only pages. Checks:
 * 1. User is signed in (redirects to register if not).
 * 2. User has completed onboarding and is verified (redirects to /onboarding if not).
 */
export default function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { status, loading } = useOnboarding()
  const location = useLocation()

  if (!isLoaded || loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="lede">Opening your member space…</p>
        </div>
      </section>
    )
  }

  if (!isSignedIn) {
    sessionStorage.setItem('sw_next', location.pathname)
    return <Navigate to={memberRegisterPath(location.pathname)} replace />
  }

  // Staff may use moderation tools before identity verification is complete.
  const isStaff = status?.role === 'admin' || status?.role === 'moderator'
  const isVerifiedMember =
    status?.step === 'complete' && status?.accountStatus === 'verified'

  if (!status || (!isStaff && !isVerifiedMember)) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
