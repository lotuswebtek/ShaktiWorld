import { useAuth } from '@clerk/react'
import { Navigate } from 'react-router-dom'
import useOnboarding from '../hooks/useOnboarding.js'
import ProfileForm from '../components/onboarding/ProfileForm.jsx'
import IdUpload from '../components/onboarding/IdUpload.jsx'
import VerificationStatus from '../components/onboarding/VerificationStatus.jsx'

export default function Onboarding() {
  const { isLoaded, isSignedIn } = useAuth()
  const { status, loading, submitProfile, uploadId, refresh } = useOnboarding()

  if (!isLoaded || loading) {
    return (
      <section className="section">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p className="lede">Loading your account…</p>
        </div>
      </section>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/register" replace />
  }

  if (!status) {
    return (
      <section className="section">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p className="lede">Setting up your account…</p>
        </div>
      </section>
    )
  }

  // Already verified, or staff — leave the holding flow
  if (status.accountStatus === 'verified' || status.role === 'admin' || status.role === 'moderator') {
    if (status.step !== 'profile') {
      return <Navigate to={status.role === 'admin' || status.role === 'moderator' ? '/moderation/verifications' : '/career'} replace />
    }
  }

  if (status.step === 'profile') {
    return <ProfileForm onSubmit={submitProfile} />
  }

  if (status.step === 'id-upload') {
    return (
      <IdUpload
        onUpload={uploadId}
        rejectionReason={status.rejectionReason}
      />
    )
  }

  // waiting / submitted / under_review / approved-but-not-yet-verified
  return <VerificationStatus status={status} onRefresh={refresh} />
}
