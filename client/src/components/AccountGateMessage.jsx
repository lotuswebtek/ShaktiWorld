import { Link } from 'react-router-dom'

const POPUP_HINT =
  'If your browser blocked a pop-up, allow pop-ups for this site, then try again.'

export function AccountGateMessage({
  loading = false,
  error = null,
  title = 'Opening your member space',
  message = 'Loading your account…',
  onRetry,
}) {
  return (
    <section className="section">
      <div className="container">
        <div className="account-gate">
          {loading && !error && <div className="account-gate-spinner" aria-hidden="true" />}
          <p className="eyebrow">{loading && !error ? 'Please wait' : 'Account'}</p>
          <h1>{error ? 'We could not open your account' : title}</h1>
          <p className="lede">{error || message}</p>
          {error && <p className="account-gate-hint">{POPUP_HINT}</p>}
          {(error || onRetry) && (
            <p className="account-gate-actions">
              {onRetry && (
                <button className="btn btn-solid" type="button" onClick={() => onRetry()}>
                  Try again
                </button>
              )}
              <Link className="btn" to="/log-in">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
