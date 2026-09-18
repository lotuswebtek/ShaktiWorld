import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import Disclaimer from '../components/safety/Disclaimer.jsx'
import SupportRequestForm from '../components/SupportRequestForm.jsx'
import { serviceCategories, categoryFromSlug } from '../data/services.js'
import KolamDivider from '../components/design/KolamDivider.jsx'
import useOnboarding from '../hooks/useOnboarding.js'
import { memberRegisterPath } from '../components/NavItem.jsx'
import { canAccessMembers } from '../lib/accountStatus.js'

function SupportSection({ categoryKey, defaultVisibility }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { status, loading } = useOnboarding()
  const location = useLocation()

  if (!isLoaded || loading) {
    return <p className="lede">Loading the support form…</p>
  }

  if (!isSignedIn) {
    return (
      <p className="lede">
        Explore the resources above at any time.{' '}
        <Link to={memberRegisterPath(location.pathname)}>Sign in</Link>
        {' '}to send a private support request.
      </p>
    )
  }

  if (!canAccessMembers(status)) {
    return (
      <p className="lede">
        Explore the resources above at any time.{' '}
        <Link to="/onboarding">Finish setting up your account</Link>
        {' '}to send a private support request.
      </p>
    )
  }

  return (
    <SupportRequestForm
      category={categoryKey}
      defaultVisibility={defaultVisibility}
    />
  )
}

export default function ServiceCategory() {
  const { slug } = useParams()
  const categoryKey = categoryFromSlug(slug)
  const data = categoryKey ? serviceCategories[categoryKey] : null

  if (!data) return <Navigate to="/services" replace />

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 780 }}>
        <p className="eyebrow">Services · {data.title}</p>
        <h1 style={{ marginTop: '0.5rem' }}>{data.heading}</h1>
        <p className="lede" style={{ marginTop: '0.75rem' }}>
          {data.description}
        </p>

        <Disclaimer variant={data.disclaimer} />
        {data.additionalDisclaimer && (
          <Disclaimer variant={data.additionalDisclaimer} />
        )}

        <div style={{ margin: '2.5rem 0' }}>
          <KolamDivider />
        </div>

        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
          Curated resources
        </h2>
        <p className="lede" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Links to verified external organisations. Research each resource independently.
        </p>

        <div className="resource-grid">
          {data.resources.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="resource-card"
            >
              <h4>{r.title}</h4>
              <p>{r.description}</p>
              <span className="resource-link">Visit ↗</span>
            </a>
          ))}
        </div>

        <div style={{ margin: '2.5rem 0' }}>
          <KolamDivider />
        </div>

        <SupportSection
          categoryKey={categoryKey}
          defaultVisibility={data.defaultVisibility}
        />
      </div>
    </section>
  )
}
