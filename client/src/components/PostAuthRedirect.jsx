import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'

export default function PostAuthRedirect() {
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    const next = sessionStorage.getItem('sw_next')
    if (!next || !next.startsWith('/') || next.startsWith('//')) return
    sessionStorage.removeItem('sw_next')
    if (location.pathname !== next) navigate(next, { replace: true })
  }, [isLoaded, isSignedIn, location.pathname, navigate])

  return null
}
