import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import RequireAuth from '../components/RequireAuth.jsx'
import KolamDivider from '../components/design/KolamDivider.jsx'
import { CATEGORY_OPTIONS, categoryLabel } from './CommunityBusinesses.jsx'

import { API } from '../config/env.js'

export default function CommunityBusinessesCity() {
  const { city } = useParams()
  const decodedCity = decodeURIComponent(city || '')
  const { getToken } = useAuth()
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const qs = useMemo(() => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (query.trim()) params.set('q', query.trim())
    return params.toString()
  }, [category, query])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = await getToken()
        const res = await fetch(`${API}/api/community/businesses/city/${encodeURIComponent(decodedCity)}?${qs}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load businesses.')
        const data = await res.json()
        setItems(data.businesses || [])
      } catch (err) {
        setError(err.message)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [decodedCity, getToken, qs])

  return (
    <RequireAuth>
      <section className="section">
        <div className="container" style={{ maxWidth: 1120 }}>
          <Link to="/community/businesses" className="mod-back-link">← Back to city index</Link>
          <p className="eyebrow">Businesses · {decodedCity}</p>
          <h1 style={{ marginTop: '0.5rem' }}>{decodedCity}</h1>
          <p className="lede" style={{ marginTop: '0.75rem' }}>
            Browse this city’s member directory, then narrow by category or search by name and description.
          </p>

          <div style={{ margin: '1.75rem 0' }}>
            <KolamDivider />
          </div>

          <div className="businesses-filters">
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All categories</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label>
              Search in this city
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or description"
                autoComplete="off"
              />
            </label>
          </div>

          {loading && <p className="lede">Loading businesses…</p>}
          {error && <p className="form-error">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="lede">No businesses match this filter yet.</p>
          )}

          <div className="businesses-cards">
            {items.map((item) => (
              <article key={item.id} className="business-card">
                <div className="business-card-gallery">
                  {Array.isArray(item.photo_urls) && item.photo_urls.length > 0 ? (
                    item.photo_urls.slice(0, 5).map((src, index) => (
                      <img key={`${item.id}-${index}`} src={src} alt={`${item.name} photo ${index + 1}`} />
                    ))
                  ) : (
                    <div className="business-card-empty-photo">No photos yet</div>
                  )}
                </div>

                <div className="business-card-body">
                  <div className="jobs-card-header">
                    <strong>{item.name}</strong>
                    <span className="jobs-card-meta">{categoryLabel(item.category)}</span>
                  </div>

                  {item.description && (
                    <p className="jobs-card-text">{item.description}</p>
                  )}

                  <div className="jobs-card-tags">
                    <span className="jobs-tag">{item.city}</span>
                    {item.service_area && <span className="jobs-tag">{item.service_area}</span>}
                    {item.operating_hours && <span className="jobs-tag">{item.operating_hours}</span>}
                  </div>

                  <p className="business-contact-line"><strong>Contact:</strong> {item.contact}</p>

                  <p className="business-owner-line">
                    Owner:{' '}
                    <Link to={`/community/members/${item.owner_id}`} className="business-owner-link">
                      {item.owner_name || 'Member profile'}
                    </Link>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </RequireAuth>
  )
}

