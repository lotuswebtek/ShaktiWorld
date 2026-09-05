import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import RequireAuth from '../../components/RequireAuth.jsx'

import { API } from '../../config/env.js'

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const CATEGORY_LABELS = {
  health: 'Health',
  mental_wellbeing: 'Mental Wellbeing',
  domestic_violence: 'Domestic Violence',
  dowry: 'Dowry',
}

/**
 * Single support request detail for moderators.
 * Shows full request, internal notes, and action controls.
 * All actions write to audit_log via the API.
 */
export default function SupportDetail() {
  const { id } = useParams()
  const { getToken } = useAuth()
  const [detail, setDetail] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [actionMsg, setActionMsg] = useState(null)

  const fetchDetail = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/moderation/support/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-store',
        },
      })
      if (!res.ok) throw new Error('Failed to load request.')
      const data = await res.json()
      setDetail(data.request)
      setNotes(data.notes || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [getToken, id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const performAction = async (body) => {
    setActionMsg(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/moderation/support/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Action failed.')
      setActionMsg({ ok: true, message: 'Updated.' })
      await fetchDetail()
    } catch (err) {
      setActionMsg({ ok: false, message: err.message })
    }
  }

  const addNote = async (e) => {
    e.preventDefault()
    if (!noteText.trim()) return
    setActionMsg(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/moderation/support/${id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: noteText }),
      })
      if (!res.ok) throw new Error('Failed to add note.')
      setNoteText('')
      await fetchDetail()
    } catch (err) {
      setActionMsg({ ok: false, message: err.message })
    }
  }

  if (loading) {
    return (
      <RequireAuth>
        <section className="section">
          <div className="container">
            <p className="lede">Loading request…</p>
          </div>
        </section>
      </RequireAuth>
    )
  }

  if (error || !detail) {
    return (
      <RequireAuth>
        <section className="section">
          <div className="container">
            <p className="form-error">{error || 'Request not found.'}</p>
            <Link to="/moderation/support" className="btn btn-ghost" style={{ marginTop: '1rem' }}>
              ← Back to inbox
            </Link>
          </div>
        </section>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <Link to="/moderation/support" className="mod-back-link">← Back to inbox</Link>

          {/* Header */}
          <div className="mod-detail-header">
            <p className="eyebrow">
              {CATEGORY_LABELS[detail.category]} · {STATUS_LABELS[detail.status]}
            </p>
            <h1 style={{ marginTop: '0.5rem' }}>{detail.subject}</h1>
            <div className="mod-detail-meta">
              <span>From: {detail.requester_name || 'Unknown member'}</span>
              <span>Submitted: {new Date(detail.created_at).toLocaleString()}</span>
              <span>Visibility: {detail.visibility.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Request body */}
          <div className="mod-detail-body">
            <p>{detail.body}</p>
          </div>

          {/* Actions */}
          {actionMsg && (
            <div className={`alert ${actionMsg.ok ? 'ok' : 'err'}`} style={{ marginTop: '1rem' }}>
              {actionMsg.message}
            </div>
          )}

          <div className="mod-actions">
            <h3>Actions</h3>
            <div className="mod-action-buttons">
              {!detail.assigned_to && (
                <button
                  type="button"
                  className="btn btn-solid"
                  onClick={() => performAction({ assignToSelf: true, status: 'in_progress' })}
                >
                  Assign to me
                </button>
              )}
              {detail.status !== 'resolved' && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => performAction({ status: 'resolved' })}
                >
                  Mark resolved
                </button>
              )}
              {detail.status !== 'closed' && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => performAction({ status: 'closed' })}
                >
                  Close
                </button>
              )}
              {detail.status === 'closed' && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => performAction({ status: 'open' })}
                >
                  Reopen
                </button>
              )}
            </div>
          </div>

          {/* Internal notes */}
          <div className="mod-notes">
            <h3>Internal notes</h3>
            <p className="mod-notes-disclaimer">
              These notes are visible only to moderators and admins. They are never shown
              to the member who submitted the request.
            </p>

            {notes.length === 0 ? (
              <p className="lede" style={{ marginTop: '0.75rem' }}>No notes yet.</p>
            ) : (
              <div className="mod-notes-list">
                {notes.map((n) => (
                  <div key={n.id} className="mod-note">
                    <div className="mod-note-header">
                      <strong>{n.author_name || 'Staff'}</strong>
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    <p>{n.body}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={addNote} className="mod-note-form">
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add an internal note…"
                autoComplete="off"
              />
              <button
                type="submit"
                className="btn btn-solid"
                disabled={!noteText.trim()}
              >
                Add note
              </button>
            </form>
          </div>
        </div>
      </section>
    </RequireAuth>
  )
}
