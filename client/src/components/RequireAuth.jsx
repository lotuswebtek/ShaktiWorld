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
 * Wraps member-only pages.
 * Signed-in members see the page immediately. We only send them to onboarding
 * after a successful status response says they still need to finish setup.
 */
export default function RequireAuth({ children, waitForStatus = false }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { status, loading } = useOnboarding()
  const location = useLocation()
  const clerkTimedOut = useLoadTimeout(isLoaded)

  useEffect(() => {
    if (canAccessMembers(status) && peekReturnTo() === location.pathname) {
      consumeReturnTo(location.pathname)
    }
  }, [status, location.pathname])

  if (!isLoaded) {
    if (clerkTimedOut) {
      return (
        <AccountGateMessage
          error={CLERK_TIMEOUT_MESSAGE}
          onRetry={() => window.location.reload()}
          continueTo="/services"
          continueLabel="Continue to Services"
        />
      )
    }
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

  if (waitForStatus && loading) {
    return (
      <AccountGateMessage
        loading
        title="Opening your member space"
        message="Loading your account…"
      />
    )
  }

  if (status && !canAccessMembers(status)) {
    rememberReturnTo(location.pathname)
    return <Navigate to="/onboarding" replace />
  }

  return children
}
