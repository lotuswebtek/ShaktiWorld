import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section">
      <div className="container cta-panel" style={{ color: 'inherit' }}>
        <p className="kicker">404</p>
        <h2>This page has not been written yet</h2>
        <p className="lede" style={{ margin: '1rem auto 1.6rem' }}>
          The page you are looking for does not exist. Return home and continue the journey.
        </p>
        <Link className="btn btn-solid" to="/">
          Back to home
        </Link>
      </div>
    </section>
  )
}
