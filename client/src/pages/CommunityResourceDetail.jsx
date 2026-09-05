import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Markdown } from '../components/Markdown.jsx'

import { API } from '../config/env.js'

const TYPE_LABELS = {
  article: 'Article',
  video: 'Video',
  guide: 'Guide',
  downloadable: 'Downloadable',
}

export default function CommunityResourceDetail() {
  const { id } = useParams()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API}/api/resources/${id}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || 'Resource not found.')
        setResource(data.resource)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <section className="section">
        <div className="container"><p className="lede">Loading resource…</p></div>
      </section>
    )
  }

  if (error || !resource) {
    return (
      <section className="section">
        <div className="container">
          <p className="form-error">{error || 'Resource not found.'}</p>
          <Link to="/community/resources" className="btn btn-ghost" style={{ marginTop: '1rem' }}>
            ← Library
          </Link>
        </div>
      </section>
    )
  }

  const inHouse = resource.source === 'in_house'

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <Link to="/community/resources" className="mod-back-link">← Library</Link>
        <div className="resource-card-badges">
          <span className="resource-type">{TYPE_LABELS[resource.resource_type] || resource.resource_type}</span>
          <span className={`resource-source resource-source-${resource.source}`}>
            {inHouse ? 'In-house' : 'Third-party'}
          </span>
        </div>
        <p className="eyebrow" style={{ marginTop: '0.85rem' }}>{resource.topic}</p>
        <h1 style={{ marginTop: '0.5rem' }}>{resource.title}</h1>
        <p className="meta" style={{ marginTop: '0.75rem' }}>
          {resource.reading_time_minutes ? `${resource.reading_time_minutes} min reading time` : 'Self-paced'}
        </p>

        {(resource.tags || []).length > 0 && (
          <div className="jobs-card-tags" style={{ marginTop: '0.85rem' }}>
            {resource.tags.map((tag) => (
              <span key={tag} className="jobs-tag">{tag}</span>
            ))}
          </div>
        )}

        {resource.description && (
          <p className="lede" style={{ marginTop: '1.25rem' }}>{resource.description}</p>
        )}

        {inHouse ? (
          <div className="resource-article">
            <Markdown source={resource.body_markdown} />
          </div>
        ) : (
          <aside className="resource-external" role="note">
            <strong>Third-party material</strong>
            <p>
              This item is hosted outside Shaktiworld. We share the link for context —
              review the source independently.
            </p>
            {resource.url && (
              <a className="btn btn-solid" href={resource.url} target="_blank" rel="noreferrer">
                Open external resource ↗
              </a>
            )}
          </aside>
        )}

        {inHouse && resource.url && (
          <p style={{ marginTop: '1.25rem' }}>
            Related link:{' '}
            <a href={resource.url} target="_blank" rel="noreferrer">{resource.url}</a>
          </p>
        )}
      </div>
    </section>
  )
}
