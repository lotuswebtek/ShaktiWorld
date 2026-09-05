import { Link } from 'react-router-dom'
import { legalDocuments, legalNav } from '../data/legal.js'

function ReviewBlock({ review }) {
  if (!review) return null
  return (
    <aside className="legal-review" role="note">
      <p className="legal-review-marker">{review.marker}</p>
      <strong className="legal-review-title">{review.title}</strong>
      <ul>
        {review.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  )
}

export default function LegalPage({ slug }) {
  const doc = legalDocuments[slug]
  if (!doc) return null

  return (
    <section className="section">
      <div className="container legal-page">
        <p className="eyebrow">Legal · Draft</p>
        <h1 style={{ marginTop: '0.5rem' }}>{doc.title}</h1>
        <p className="lede" style={{ marginTop: '0.75rem' }}>{doc.summary}</p>
        <p className="legal-meta">
          Version {doc.version} · Last updated {doc.updated}
        </p>

        <div className="legal-draft-banner">
          This page is a structured draft for product and counsel review. It is not legal advice
          and is not an operative contract until a lawyer has signed off and the draft banner is removed.
        </div>

        <nav className="legal-doc-nav" aria-label="Legal documents">
          {legalNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={item.slug === slug ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {doc.sections.map((section) => (
          <article key={section.heading} className="legal-section">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((p, i) => (
              <p key={`${section.heading}-${i}`}>{p}</p>
            ))}
            <ReviewBlock review={section.review} />
          </article>
        ))}
      </div>
    </section>
  )
}
