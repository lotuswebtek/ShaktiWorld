import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/react'
import RequireAuth from '../../components/RequireAuth.jsx'

const API = import.meta.env.VITE_API_URL || ''

const DOC_LABELS = {
  aadhaar: 'Aadhaar card',
  passport: 'Passport',
  driving_licence: 'Driving licence',
  student_id: 'Student ID',
  other: 'Other government ID',
}

export default function VerificationInbox() {
  const { getToken } = useAuth()
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('submitted')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [preview, setPreview] = useState(null)
  const [previewError, setPreviewError] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionMsg, setActionMsg] = useState(null)

  const selected = items.find((item) => item.id === selectedId) || null

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const params = new URLSearchParams()
      if (filter) params.set('status', filter)
      const res = await fetch(`${API}/api/moderation/verifications?${params}`, {
        headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-store' },
      })
      if (res.status === 403) {
        setError('You do not have moderator access.')
        setItems([])
        return
      }
      if (!res.ok) throw new Error('Could not load verification queue.')
      const data = await res.json()
      setItems(data.verifications || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [getToken, filter])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    let objectUrl = null
    let cancelled = false

    async function loadFile() {
      setPreview(null)
      setPreviewError(null)
      setRejectReason('')
      setActionMsg(null)
      if (!selectedId) return

      try {
        const token = await getToken()
        const res = await fetch(`${API}/api/moderation/verifications/${selectedId}/file`, {
          headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-store' },
        })
        if (!res.ok) throw new Error('Document is not available on this server.')
        const blob = await res.blob()
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setPreview({ url: objectUrl, type: blob.type })
      } catch (err) {
        if (!cancelled) setPreviewError(err.message)
      }
    }

    loadFile()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [selectedId, getToken])

  const decide = async (action) => {
    if (!selectedId) return
    setBusy(true)
    setActionMsg(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/moderation/verifications/${selectedId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          rejectionReason: action === 'reject' ? rejectReason : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Could not update status.')
      setActionMsg(action === 'approve' ? 'Member verified.' : 'Submission rejected.')
      setSelectedId(null)
      await fetchList()
    } catch (err) {
      setActionMsg(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <RequireAuth>
      <section className="section">
        <div className="container">
          <p className="eyebrow">Moderation</p>
          <h1 style={{ marginTop: '0.5rem' }}>Identity verification</h1>
          <p className="lede" style={{ marginTop: '0.75rem' }}>
            Open a submission, review the document, then approve or reject the account.
            Documents are not publicly listed.
          </p>

          <div className="mod-filters">
            <label>
              Status
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="submitted">Waiting for review</option>
                <option value="under_review">Under review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="">All</option>
              </select>
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}
          {actionMsg && <p className="notice notice-info" style={{ marginTop: '1rem' }}>{actionMsg}</p>}

          {loading ? (
            <p className="lede" style={{ marginTop: '1.5rem' }}>Loading queue…</p>
          ) : (
            <div className="verify-layout">
              <div className="verify-list">
                {items.length === 0 ? (
                  <p className="lede">No submissions in this filter.</p>
                ) : (
                  items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`verify-row ${item.id === selectedId ? 'active' : ''}`}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <strong>{item.full_name || 'Member'}</strong>
                      <span>
                        {DOC_LABELS[item.document_type] || item.document_type}
                        {item.city ? ` · ${item.city}` : ''}
                      </span>
                      <span className={`mod-status mod-status-${item.status}`}>{item.status}</span>
                    </button>
                  ))
                )}
              </div>

              <div className="verify-pane">
                {!selected ? (
                  <p className="lede">Select a member to view their document.</p>
                ) : (
                  <>
                    <h2>{selected.full_name || 'Member'}</h2>
                    <p className="verify-meta">
                      {DOC_LABELS[selected.document_type] || selected.document_type}
                      {selected.city ? ` · ${selected.city}` : ''}
                      {selected.country ? `, ${selected.country}` : ''}
                    </p>

                    {previewError && <p className="form-error">{previewError}</p>}
                    {preview?.type === 'application/pdf' && (
                      <iframe className="verify-preview" title="Identity document" src={preview.url} />
                    )}
                    {preview && preview.type !== 'application/pdf' && (
                      <img className="verify-preview-img" src={preview.url} alt="" />
                    )}

                    {['submitted', 'under_review'].includes(selected.status) && (
                      <div className="mod-actions" style={{ marginTop: '1.25rem' }}>
                        <h3>Decision</h3>
                        <label>
                          Rejection reason (required to reject)
                          <textarea
                            rows={3}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Explain what to upload instead. Do not include ID numbers."
                          />
                        </label>
                        <div className="mod-action-buttons">
                          <button
                            type="button"
                            className="btn btn-solid"
                            disabled={busy}
                            onClick={() => decide('approve')}
                          >
                            Approve and verify
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            disabled={busy || !rejectReason.trim()}
                            onClick={() => decide('reject')}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </RequireAuth>
  )
}
