import { Link } from 'react-router-dom'
import RequireAuth from '../components/RequireAuth.jsx'
import { serviceCategories } from '../data/services.js'
import KolamDivider from '../components/design/KolamDivider.jsx'

const categories = Object.values(serviceCategories)

const ICONS = {
  health: '🏥',
  mental_wellbeing: '🧠',
  domestic_violence: '🛡️',
  dowry: '⚖️',
}

export default function Services() {
  return (
    <RequireAuth>
      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <p className="eyebrow">Community</p>
          <h1 style={{ marginTop: '0.5rem' }}>Services</h1>
          <p className="lede" style={{ marginTop: '0.75rem' }}>
            Access curated resources and connect with support across health,
            mental wellbeing, domestic violence, and dowry-related concerns.
            Shaktiworld connects and informs — explore the category that fits your needs.
          </p>

          <div style={{ margin: '2rem 0' }}>
            <KolamDivider />
          </div>

          <div className="service-category-grid">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/services/${cat.slug}`}
                className="service-category-card"
              >
                <span className="service-category-icon" aria-hidden="true">
                  {ICONS[Object.keys(serviceCategories).find((k) => serviceCategories[k] === cat)] || '📋'}
                </span>
                <h3>{cat.title}</h3>
                <p>{cat.description.slice(0, 120)}…</p>
                <span className="link-more">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </RequireAuth>
  )
}
