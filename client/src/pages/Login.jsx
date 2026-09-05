import { SignIn } from '@clerk/react'
import { site } from '../data/site.js'
import { CLERK_PUBLISHABLE_KEY } from '../config/env.js'

export default function Login() {
  return (
    <section className="section">
      <div className="container form-shell">
        <div className="form-visual">
          <img src="/images/login.jpeg" alt="Shaktiworld artwork" />
        </div>
        <div>
          <p className="kicker">Log in</p>
          <h2>Welcome back</h2>
          <p className="lede">Sign in to continue creating, connecting, and empowering.</p>
          {CLERK_PUBLISHABLE_KEY ? (
            <div className="clerk-wrap">
              <SignIn path="/log-in" signUpUrl="/register" />
            </div>
          ) : (
            <p className="legal-consent-hint">
              Sign in is not available on this site yet. Email{' '}
              <a href={`mailto:${site.email}`}>{site.email}</a> if you need help accessing your
              account.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
