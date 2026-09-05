import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import KolamDivider from '../components/design/KolamDivider.jsx'

const API = import.meta.env.VITE_API_URL || ''

function formatWhen(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function EventCard({ event }) {
  const place = event.is_online ? 'Online' : (event.location || 'Location to be shared')
  const spots = event.capacity == null
    ? 'Open RSVP'
    : `${Math.max(0, event.capacity - event.rsvp_count)} of ${event.capacity} places left`

  return (
    <Link to={`/community/events/${event.id}`} className="event-card">
      {event.cover_image && <img src={event.cover_image} alt="" />}
      <div className="event-card-body">
        <span className="meta">{formatWhen(event.starts_at)} · {place}</span>
        <h3>{event.title}</h3>
        {event.description && (
          <p>{event.description.length > 160 ? `${event.description.slice(0, 160)}…` : event.description}</p>
        )}
        <span className="event-card-spots">{spots}</span>
        <span className="link-more">View event</span>
      </div>
    </Link>
  )
}

export default function CommunityEvents() {
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API}/api/events`)
        if (!res.ok) throw new Error('Failed to load events.')
        const data = await res.json()
        setUpcoming(data.upcoming || [])
        setPast(data.past || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 980 }}>
        <p className="eyebrow">Community · Events</p>
        <h1 style={{ marginTop: '0.5rem' }}>Gatherings</h1>
        <p className="lede" style={{ marginTop: '0.75rem' }}>
          Upcoming and past community gatherings. Anyone can browse. RSVP is for verified members
          and does not guarantee a place beyond the listed capacity.
        </p>

        <div style={{ margin: '2rem 0' }}>
          <KolamDivider />
        </div>

        {loading && <p className="lede">Loading events…</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && !error && (
          <>
            <h2>Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="lede" style={{ marginTop: '0.75rem' }}>No upcoming gatherings are listed yet.</p>
            ) : (
              <div className="event-list">
                {upcoming.map((event) => <EventCard key={event.id} event={event} />)}
              </div>
            )}

            <div style={{ margin: '2.5rem 0 1.5rem' }}>
              <KolamDivider />
            </div>

            <h2>Past</h2>
            {past.length === 0 ? (
              <p className="lede" style={{ marginTop: '0.75rem' }}>Past gatherings will appear here.</p>
            ) : (
              <div className="event-list">
                {past.map((event) => <EventCard key={event.id} event={event} />)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
