import { SignIn } from '@clerk/react'

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
          <div className="clerk-wrap">
            <SignIn path="/log-in" signUpUrl="/register" />
          </div>
        </div>
      </div>
    </section>
  )
}
