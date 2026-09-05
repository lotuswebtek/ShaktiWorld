import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import RequireAuth from '../../components/RequireAuth.jsx'

import { API } from '../../config/env.js'

const CATEGORY_LABELS = {
  health: 'Health',
  mental_wellbeing: 'Mental Wellbeing',
  domestic_violence: 'Domestic Violence',
  dowry: 'Dowry',
}

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

/**
 * Moderator inbox for support requests.
 * Sorted by category with filtering controls.
 */
export default function SupportInbox() {
  const { getToken } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const params = new URLSearchParams()
      if (filterCategory) params.set('category', filterCategory)
      if (filterStatus) params.set('status', filterStatus)

      const res = await fetch(`${API}/api/moderation/support?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-store',
        },
      })
      if (res.status === 403) {
        setError('You do not have moderator access.')
        setRequests([])
        return
      }
      if (!res.ok) throw new Error('Failed to load inbox.')
      const data = await res.json()
      setRequests(data.requests || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [getToken, filterCategory, filterStatus])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  // Group by category for sorted display
  const grouped = {}
  for (const r of requests) {
    if (!grouped[r.category]) grouped[r.category] = []
    grouped[r.category].push(r)
  }

  return (
    <RequireAuth>
      <section className="section">
        <div className="container">
          <p className="eyebrow">Moderation</p>
          <h1 style={{ marginTop: '0.5rem' }}>Support Inbox</h1>

          {/* Filters */}
          <div className="mod-filters">
            <label>
              Category
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">All categories</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All statuses</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
            <button type="button" className="btn btn-ghost" onClick={fetchRequests}>
              Refresh
            </button>
          </div>

          {error && <p className="form-error" style={{ marginTop: '1rem' }}>{error}</p>}

          {loading ? (
            <p className="lede" style={{ marginTop: '2rem' }}>Loading requests…</p>
          ) : requests.length === 0 ? (
            <p className="lede" style={{ marginTop: '2rem' }}>No support requests in your queue.</p>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mod-category-group">
                <h3 className="mod-category-heading">
                  {CATEGORY_LABELS[cat] || cat}
                  <span className="mod-category-count">{items.length}</span>
                </h3>
                <div className="mod-request-list">
                  {items.map((r) => (
                    <Link
                      key={r.id}
                      to={`/moderation/support/${r.id}`}
                      className="mod-request-row"
                    >
                      <div className="mod-request-meta">
                        <span className={`mod-status mod-status-${r.status}`}>
                          {STATUS_LABELS[r.status]}
                        </span>
                        <span className="mod-visibility">{r.visibility.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="mod-request-subject">{r.subject}</div>
                      <div className="mod-request-info">
                        <span>{r.requester_name || 'Unknown member'}</span>
                        <span>{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </RequireAuth>
  )
}
