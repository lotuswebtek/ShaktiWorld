import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import useOnboarding from '../hooks/useOnboarding.js'
import { CLERK_TIMEOUT_MESSAGE, useLoadTimeout } from '../hooks/useLoadTimeout.js'
import { memberRegisterPath } from './NavItem.jsx'
import { AccountGateMessage } from './AccountGateMessage.jsx'
import { consumeReturnTo, peekReturnTo, rememberReturnTo } from '../lib/returnTo.js'
import { canAccessMembers } from '../lib/accountStatus.js'

/**
 * Wraps member-only pages. Checks:
 * 1. User is signed in (redirects to register if not).
 * 2. User has completed onboarding and is verified (redirects to /onboarding if not).
 */
export default function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { status, loading, error, refresh } = useOnboarding()
  const location = useLocation()
  const clerkTimedOut = useLoadTimeout(isLoaded)

  useEffect(() => {
    if (canAccessMembers(status) && peekReturnTo() === location.pathname) {
      consumeReturnTo(location.pathname)
    }
  }, [status, location.pathname])

  if (!isLoaded && clerkTimedOut) {
    return (
      <AccountGateMessage
        error={error || CLERK_TIMEOUT_MESSAGE}
        onRetry={() => window.location.reload()}
      />
    )
  }

  if (!isLoaded || loading) {
    return (
      <AccountGateMessage
        loading
        title="Opening your member space"
        message="Loading your account…"
      />
    )
  }

  if (!isSignedIn) {
    rememberReturnTo(location.pathname)
    return <Navigate to={memberRegisterPath(location.pathname)} replace />
  }

  if (error && !status) {
    return <AccountGateMessage error={error} onRetry={() => refresh()} />
  }

  if (!canAccessMembers(status)) {
    rememberReturnTo(location.pathname)
    return <Navigate to="/onboarding" replace />
  }

  return children
}
