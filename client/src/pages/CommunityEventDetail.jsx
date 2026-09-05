import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import useOnboarding from '../hooks/useOnboarding.js'
import { memberRegisterPath } from '../components/NavItem.jsx'

const API = import.meta.env.VITE_API_URL || ''

function formatRange(startIso, endIso) {
  const start = new Date(startIso)
  const end = endIso ? new Date(endIso) : null
  const date = start.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const startTime = start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (!end) return `${date} · ${startTime}`
  const endTime = end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  return `${date} · ${startTime} – ${endTime}`
}

export default function CommunityEventDetail() {
  const { id } = useParams()
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const { status, loading: onboardingLoading } = useOnboarding()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rsvpBusy, setRsvpBusy] = useState(false)
  const [rsvpMessage, setRsvpMessage] = useState(null)

  const verified = status?.step === 'complete' && status?.accountStatus === 'verified'

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const headers = {}
      if (isSignedIn) {
        const token = await getToken()
        if (token) headers.Authorization = `Bearer ${token}`
      }
      const res = await fetch(`${API}/api/events/${id}`, { headers })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Event not found.')
      setEvent(data.event)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoaded) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isLoaded, isSignedIn])

  const rsvp = async () => {
    setRsvpBusy(true)
    setRsvpMessage(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/community/events/${id}/rsvp`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Could not RSVP.')
      setRsvpMessage('Your RSVP is recorded.')
      await load()
    } catch (err) {
      setRsvpMessage(err.message)
    } finally {
      setRsvpBusy(false)
    }
  }

  const cancelRsvp = async () => {
    setRsvpBusy(true)
    setRsvpMessage(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/community/events/${id}/rsvp`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Could not cancel RSVP.')
      setRsvpMessage('Your RSVP has been cancelled.')
      await load()
    } catch (err) {
      setRsvpMessage(err.message)
    } finally {
      setRsvpBusy(false)
    }
  }

  if (loading || onboardingLoading) {
    return (
      <section className="section">
        <div className="container"><p className="lede">Loading event…</p></div>
      </section>
    )
  }

  if (error || !event) {
    return (
      <section className="section">
        <div className="container">
          <p className="form-error">{error || 'Event not found.'}</p>
          <Link to="/our-events" className="btn btn-ghost" style={{ marginTop: '1rem' }}>
            ← All events
          </Link>
        </div>
      </section>
    )
  }

  const ended = new Date(event.ends_at || event.starts_at).getTime() < Date.now()
  const full = event.capacity != null && event.spots_left === 0 && !event.has_rsvp
  const place = event.is_online ? 'Online gathering' : (event.location || 'Location to be shared')

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <Link to="/our-events" className="mod-back-link">← All events</Link>
        <p className="eyebrow">{event.is_online ? 'Online' : 'In person'}</p>
        <h1 style={{ marginTop: '0.5rem' }}>{event.title}</h1>
        <p className="meta" style={{ marginTop: '0.75rem' }}>
          {formatRange(event.starts_at, event.ends_at)} · {place}
        </p>

        {event.cover_image && (
          <img className="event-detail-cover" src={event.cover_image} alt="" />
        )}

        {event.description && (
          <div className="rich" style={{ marginTop: '1.5rem' }}>
            {event.description.split('\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}

        {event.is_online && event.has_rsvp && event.event_url && (
          <p style={{ marginTop: '1rem' }}>
            <a href={event.event_url} target="_blank" rel="noreferrer">Open join link ↗</a>
          </p>
        )}

        {event.is_online && !event.has_rsvp && (
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>
            The join link is shared after a verified member RSVP.
          </p>
        )}

        <div className="event-rsvp-panel">
          <p>
            {event.capacity == null
              ? `${event.rsvp_count} member${event.rsvp_count === 1 ? '' : 's'} have RSVP’d.`
              : `${event.rsvp_count} of ${event.capacity} places filled.`}
          </p>

          {ended && <p className="lede">This gathering has ended.</p>}

          {!ended && !isSignedIn && (
            <Link className="btn btn-solid" to={memberRegisterPath(`/community/events/${id}`)}>
              Register to RSVP
            </Link>
          )}

          {!ended && isSignedIn && !verified && (
            <Link className="btn btn-solid" to="/onboarding">
              Complete verification to RSVP
            </Link>
          )}

          {!ended && verified && !event.has_rsvp && (
            <button type="button" className="btn btn-solid" onClick={rsvp} disabled={rsvpBusy || full}>
              {full ? 'At capacity' : rsvpBusy ? 'Saving…' : 'RSVP'}
            </button>
          )}

          {!ended && verified && event.has_rsvp && (
            <button type="button" className="btn btn-ghost" onClick={cancelRsvp} disabled={rsvpBusy}>
              {rsvpBusy ? 'Saving…' : 'Cancel RSVP'}
            </button>
          )}

          {rsvpMessage && <p className="event-rsvp-note">{rsvpMessage}</p>}
        </div>

        <a className="btn btn-ghost" href={`${API}/api/events/${id}/ics`}>
          Add to calendar (.ics)
        </a>
      </div>
    </section>
  )
}
