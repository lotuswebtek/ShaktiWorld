import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/react'

import { fetchWithClerkToken } from '../lib/authFetch.js'

const OnboardingContext = createContext(null)

function useOnboardingState() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStatus = useCallback(async () => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setStatus(null)
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetchWithClerkToken('/api/onboarding/status', getToken)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? 'Session expired. Sign in again to continue.'
            : data.message || 'Failed to fetch status',
        )
      }
      setStatus(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status')
    } finally {
      setLoading(false)
    }
  }, [isLoaded, isSignedIn, getToken])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const submitProfile = useCallback(async (profileData) => {
    const res = await fetchWithClerkToken('/api/onboarding/profile', getToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Profile submission failed')
    await fetchStatus()
    return data
  }, [getToken, fetchStatus])

  const uploadId = useCallback(async (documentType, file) => {
    const form = new FormData()
    form.append('documentType', documentType)
    form.append('document', file)

    const res = await fetchWithClerkToken('/api/onboarding/upload-id', getToken, {
      method: 'POST',
      body: form,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Upload failed')
    await fetchStatus()
    return data
  }, [getToken, fetchStatus])

  return useMemo(
    () => ({ status, loading, error, submitProfile, uploadId, refresh: fetchStatus }),
    [status, loading, error, submitProfile, uploadId, fetchStatus],
  )
}

export function OnboardingProvider({ children }) {
  const value = useOnboardingState()
  return createElement(OnboardingContext.Provider, { value }, children)
}

export default function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return ctx
}
