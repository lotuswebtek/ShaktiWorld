import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import useOnboarding from '../hooks/useOnboarding.js'
import { consumeReturnTo } from '../lib/returnTo.js'
import { canAccessMembers, memberHomePath } from '../lib/accountStatus.js'

function isAuthPath(pathname) {
  return pathname.startsWith('/log-in') || pathname.startsWith('/register')
}

export default function PostAuthRedirect() {
  const { isLoaded, isSignedIn } = useAuth()
  const { status, loading } = useOnboarding()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoaded || !isSignedIn || loading) return
    if (!isAuthPath(location.pathname)) return
    const dest = canAccessMembers(status)
      ? consumeReturnTo(memberHomePath(status))
      : '/onboarding'
    if (location.pathname !== dest) navigate(dest, { replace: true })
  }, [isLoaded, isSignedIn, loading, status, location.pathname, navigate])

  return null
}
