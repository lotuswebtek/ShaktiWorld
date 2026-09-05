import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/react'

const API = import.meta.env.VITE_API_URL || ''

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
      const token = await getToken()
      const res = await fetch(`${API}/api/onboarding/status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch status')
      const data = await res.json()
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
    const token = await getToken()
    const res = await fetch(`${API}/api/onboarding/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Profile submission failed')
    await fetchStatus()
    return data
  }

  const uploadId = async (documentType, file) => {
    const token = await getToken()
    const form = new FormData()
    form.append('documentType', documentType)
    form.append('document', file)

    const res = await fetch(`${API}/api/onboarding/upload-id`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Upload failed')
    await fetchStatus()
    return data
  }

  return { status, loading, error, submitProfile, uploadId, refresh: fetchStatus }
}
