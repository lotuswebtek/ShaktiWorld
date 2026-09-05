export default function VerificationStatus({ status, onRefresh }) {
  const isPending = status.verificationStatus === 'submitted' || status.verificationStatus === 'under_review'

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 620, textAlign: 'center', padding: '4rem 0' }}>
        <p className="eyebrow">Step 3 of 3</p>

        {isPending && (
          <>
            <h1 style={{ marginTop: '0.5rem' }}>Your account is under review</h1>
            <div className="verification-icon" aria-hidden="true">⏳</div>
            <p className="lede" style={{ marginTop: '1rem' }}>
              A moderator is reviewing your identity document. This usually takes 1–2 business days.
            </p>
            <p style={{ marginTop: '0.75rem', color: 'var(--muted)' }}>
              You'll have full access to all community sections once your account is approved.
              There's nothing else you need to do right now.
            </p>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: '1.5rem' }}
              onClick={onRefresh}
            >
              Check status
            </button>
          </>
        )}

        {status.accountStatus === 'suspended' && (
          <>
            <h1 style={{ marginTop: '0.5rem' }}>Account suspended</h1>
            <div className="verification-icon" aria-hidden="true">🚫</div>
            <p className="lede" style={{ marginTop: '1rem' }}>
              Your account has been suspended. If you believe this is an error, please
              contact us at <a href="mailto:houston@shaktiworld.org">houston@shaktiworld.org</a>.
            </p>
          </>
        )}

        {status.step === 'complete' && status.accountStatus !== 'verified' && (
          <>
            <h1 style={{ marginTop: '0.5rem' }}>Verification approved</h1>
            <div className="verification-icon" aria-hidden="true">✅</div>
            <p className="lede" style={{ marginTop: '1rem' }}>
              Your identity has been verified. Your full access is being activated.
            </p>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: '1.5rem' }}
              onClick={onRefresh}
            >
              Refresh
            </button>
          </>
        )}
      </div>
    </section>
  )
}
