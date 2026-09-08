import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/react'

import { fetchWithClerkToken } from '../lib/authFetch.js'

/**
 * Fetches the user's onboarding status from the server and
 * exposes helpers for profile submission + ID upload.
 */
export default function useOnboarding() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [status, setStatus] = useState(null) // { step, accountStatus, verificationStatus?, rejectionReason? }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStatus = useCallback(async () => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setStatus(null)
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
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isLoaded, isSignedIn, getToken])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const submitProfile = async (profileData) => {
    const res = await fetchWithClerkToken('/api/onboarding/profile', getToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Profile submission failed')
    await fetchStatus()
    return data
  }

  const uploadId = async (documentType, file) => {
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
  }

  return { status, loading, error, submitProfile, uploadId, refresh: fetchStatus }
}
