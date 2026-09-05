import { useParams, Navigate } from 'react-router-dom'
import RequireAuth from '../components/RequireAuth.jsx'
import Disclaimer from '../components/safety/Disclaimer.jsx'
import CrisisBanner from '../components/safety/CrisisBanner.jsx'
import SupportRequestForm from '../components/SupportRequestForm.jsx'
import { serviceCategories, categoryFromSlug } from '../data/services.js'
import KolamDivider from '../components/design/KolamDivider.jsx'

/**
 * Generic services category landing page.
 * Renders one of: Health, Mental Wellbeing, Domestic Violence, Dowry
 * based on the :slug param.
 *
 * Each page contains:
 * 1. Plain-language explanation
 * 2. Curated resource links
 * 3. Relevant <Disclaimer> variant(s)
 * 4. "Request support" form
 */
export default function ServiceCategory() {
  const { slug } = useParams()
  const categoryKey = categoryFromSlug(slug)
  const data = categoryKey ? serviceCategories[categoryKey] : null

  if (!data) return <Navigate to="/services" replace />

  return (
    <RequireAuth>
      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          {/* Heading */}
          <p className="eyebrow">Services · {data.title}</p>
          <h1 style={{ marginTop: '0.5rem' }}>{data.heading}</h1>
          <p className="lede" style={{ marginTop: '0.75rem' }}>
            {data.description}
          </p>

          {/* Disclaimers */}
          <Disclaimer variant={data.disclaimer} />
          {data.additionalDisclaimer && (
            <Disclaimer variant={data.additionalDisclaimer} />
          )}

          {/* Divider */}
          <div style={{ margin: '2.5rem 0' }}>
            <KolamDivider />
          </div>

          {/* Curated resources */}
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

          {/* Divider */}
          <div style={{ margin: '2.5rem 0' }}>
            <KolamDivider />
          </div>

          {/* Support request form */}
          <SupportRequestForm
            category={categoryKey}
            defaultVisibility={data.defaultVisibility}
          />
        </div>
      </section>
    </RequireAuth>
  )
}
