import { useAuth } from '@clerk/react'
import { Navigate } from 'react-router-dom'
import useOnboarding from '../hooks/useOnboarding.js'
import { CLERK_TIMEOUT_MESSAGE, useLoadTimeout } from '../hooks/useLoadTimeout.js'
import ProfileForm from '../components/onboarding/ProfileForm.jsx'
import IdUpload from '../components/onboarding/IdUpload.jsx'
import VerificationStatus from '../components/onboarding/VerificationStatus.jsx'
import { AccountGateMessage } from '../components/AccountGateMessage.jsx'
import { peekReturnTo } from '../lib/returnTo.js'
import { isStaff, memberHomePath } from '../lib/accountStatus.js'

function VerifiedExit({ status }) {
  return <Navigate to={peekReturnTo() || memberHomePath(status)} replace />
}

export default function Onboarding() {
  const { isLoaded, isSignedIn } = useAuth()
  const { status, loading, error, submitProfile, uploadId, refresh } = useOnboarding()
  const clerkTimedOut = useLoadTimeout(isLoaded)

  if (!isLoaded && clerkTimedOut) {
    return (
      <AccountGateMessage
        error={error || CLERK_TIMEOUT_MESSAGE}
        onRetry={() => window.location.reload()}
        continueTo="/services"
        continueLabel="Continue to Services"
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
    return <Navigate to="/register" replace />
  }

  if (!status) {
    if (!error) {
      return (
        <AccountGateMessage
          loading
          title="Opening your member space"
          message="Setting up your account…"
        />
      )
    }
    return (
      <AccountGateMessage
        error={
          error === 'Not authenticated.'
            ? 'Your session could not be verified. Try again, or sign in again.'
            : error
        }
        onRetry={() => refresh()}
        continueTo={peekReturnTo() || '/services'}
        continueLabel="Continue to the site"
      />
    )
  }

  if (
    (status.accountStatus === 'verified' || isStaff(status)) &&
    status.step !== 'profile'
  ) {
    return <VerifiedExit status={status} />
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

  return <VerificationStatus status={status} onRefresh={refresh} />
}
