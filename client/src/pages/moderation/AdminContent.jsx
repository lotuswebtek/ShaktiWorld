import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import useOnboarding from '../../hooks/useOnboarding.js'

const API = import.meta.env.VITE_API_URL || ''

const RESOURCE_TYPES = [
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'guide', label: 'Guide' },
  { value: 'downloadable', label: 'Downloadable' },
]

export default function AdminContent() {
  const { getToken } = useAuth()
  const { status, loading } = useOnboarding()
  const isAdmin = status?.role === 'admin'

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    isOnline: false,
    eventUrl: '',
    startsAt: '',
    endsAt: '',
    coverImage: '',
    capacity: '',
  })
  const [eventMsg, setEventMsg] = useState(null)
  const [eventErr, setEventErr] = useState(null)
  const [eventBusy, setEventBusy] = useState(false)

  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    topic: '',
    resourceType: 'article',
    readingTimeMinutes: '',
    tags: '',
    source: 'in_house',
    bodyMarkdown: '',
    url: '',
  })
  const [resMsg, setResMsg] = useState(null)
  const [resErr, setResErr] = useState(null)
  const [resBusy, setResBusy] = useState(false)

  if (loading) {
    return (
      <section className="section">
        <div className="container"><p className="lede">Checking access…</p></div>
      </section>
    )
  }

  if (!isAdmin) return <Navigate to="/" replace />

  const submitEvent = async (e) => {
    e.preventDefault()
    setEventErr(null)
    setEventMsg(null)
    setEventBusy(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/moderation/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...eventForm,
          capacity: eventForm.capacity ? Number(eventForm.capacity) : null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Could not publish event.')
      setEventMsg('Event published. It is now listed on Our Events.')
      setEventForm((f) => ({ ...f, title: '', description: '', eventUrl: '' }))
    } catch (err) {
      setEventErr(err.message)
    } finally {
      setEventBusy(false)
    }
  }

  const submitResource = async (e) => {
    e.preventDefault()
    setResErr(null)
    setResMsg(null)
    setResBusy(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/moderation/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...resourceForm,
          readingTimeMinutes: resourceForm.readingTimeMinutes
            ? Number(resourceForm.readingTimeMinutes)
            : null,
          tags: resourceForm.tags,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Could not publish resource.')
      setResMsg('Resource published.')
      setResourceForm((f) => ({ ...f, title: '', description: '', bodyMarkdown: '', url: '' }))
    } catch (err) {
      setResErr(err.message)
    } finally {
      setResBusy(false)
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 860 }}>
        <p className="eyebrow">Admin</p>
        <h1 style={{ marginTop: '0.5rem' }}>Publish events and resources</h1>
        <p className="lede">
          New events appear on the Our Events page. Anyone can read them.
        </p>

        <div className="admin-content-grid">
          <form className="jobs-form businesses-panel" onSubmit={submitEvent}>
            <h2>New event</h2>
            <label>Title <span className="required">*</span>
              <input required value={eventForm.title} onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))} />
            </label>
            <label>Description
              <textarea rows={4} value={eventForm.description} onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))} />
            </label>
            <label className="check">
              <input type="checkbox" checked={eventForm.isOnline} onChange={(e) => setEventForm((f) => ({ ...f, isOnline: e.target.checked }))} />
              Online gathering
            </label>
            <label>{eventForm.isOnline ? 'Join URL' : 'Location'}
              <input
                value={eventForm.isOnline ? eventForm.eventUrl : eventForm.location}
                onChange={(e) => setEventForm((f) => (
                  eventForm.isOnline
                    ? { ...f, eventUrl: e.target.value }
                    : { ...f, location: e.target.value }
                ))}
              />
            </label>
            <div className="jobs-form-row">
              <label>Starts <span className="required">*</span>
                <input type="datetime-local" required value={eventForm.startsAt} onChange={(e) => setEventForm((f) => ({ ...f, startsAt: e.target.value }))} />
              </label>
              <label>Ends
                <input type="datetime-local" value={eventForm.endsAt} onChange={(e) => setEventForm((f) => ({ ...f, endsAt: e.target.value }))} />
              </label>
            </div>
            <div className="jobs-form-row">
              <label>Capacity
                <input type="number" min="1" value={eventForm.capacity} onChange={(e) => setEventForm((f) => ({ ...f, capacity: e.target.value }))} />
              </label>
              <label>Cover image URL
                <input value={eventForm.coverImage} onChange={(e) => setEventForm((f) => ({ ...f, coverImage: e.target.value }))} />
              </label>
            </div>
            {eventErr && <p className="form-error">{eventErr}</p>}
            {eventMsg && <div className="alert ok">{eventMsg}</div>}
            <button className="btn btn-solid" type="submit" disabled={eventBusy}>
              {eventBusy ? 'Publishing…' : 'Publish event'}
            </button>
          </form>

          <form className="jobs-form businesses-panel" onSubmit={submitResource}>
            <h2>New resource</h2>
            <label>Title <span className="required">*</span>
              <input required value={resourceForm.title} onChange={(e) => setResourceForm((f) => ({ ...f, title: e.target.value }))} />
            </label>
            <div className="jobs-form-row">
              <label>Topic <span className="required">*</span>
                <input required value={resourceForm.topic} onChange={(e) => setResourceForm((f) => ({ ...f, topic: e.target.value }))} />
              </label>
              <label>Type <span className="required">*</span>
                <select value={resourceForm.resourceType} onChange={(e) => setResourceForm((f) => ({ ...f, resourceType: e.target.value }))}>
                  {RESOURCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
            </div>
            <label>Description
              <textarea rows={3} value={resourceForm.description} onChange={(e) => setResourceForm((f) => ({ ...f, description: e.target.value }))} />
            </label>
            <div className="jobs-form-row">
              <label>Reading time (minutes)
                <input type="number" min="1" value={resourceForm.readingTimeMinutes} onChange={(e) => setResourceForm((f) => ({ ...f, readingTimeMinutes: e.target.value }))} />
              </label>
              <label>Tags (comma-separated)
                <input value={resourceForm.tags} onChange={(e) => setResourceForm((f) => ({ ...f, tags: e.target.value }))} />
              </label>
            </div>
            <label>Source
              <select value={resourceForm.source} onChange={(e) => setResourceForm((f) => ({ ...f, source: e.target.value }))}>
                <option value="in_house">In-house (markdown)</option>
                <option value="external">Third-party link</option>
              </select>
            </label>
            {resourceForm.source === 'in_house' ? (
              <label>Markdown content <span className="required">*</span>
                <textarea rows={8} required value={resourceForm.bodyMarkdown} onChange={(e) => setResourceForm((f) => ({ ...f, bodyMarkdown: e.target.value }))} />
              </label>
            ) : (
              <label>External URL <span className="required">*</span>
                <input required type="url" value={resourceForm.url} onChange={(e) => setResourceForm((f) => ({ ...f, url: e.target.value }))} />
              </label>
            )}
            {resErr && <p className="form-error">{resErr}</p>}
            {resMsg && <div className="alert ok">{resMsg}</div>}
            <button className="btn btn-solid" type="submit" disabled={resBusy}>
              {resBusy ? 'Publishing…' : 'Publish resource'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
