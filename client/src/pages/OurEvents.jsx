import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { events } from '../data/site.js'
import useOnboarding from '../hooks/useOnboarding.js'

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

export default function OurEvents() {
  const { status } = useOnboarding()
  const isAdmin = status?.role === 'admin'
  const [posted, setPosted] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/events`)
        if (!res.ok) throw new Error('Could not load posted events.')
        const data = await res.json()
        setPosted([...(data.upcoming || []), ...(data.past || [])])
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [])

  return (
    <>
      <section className="page-hero">
        <img src="/images/event-shakti-2026a.jpeg" alt="Shaktiworld community event" />
        <div className="page-hero-copy">
          <p className="kicker">Our events</p>
          <h1>Gatherings of strength, heritage, and sisterhood</h1>
          <p>
            At Shaktiworld, our events are more than just gatherings; they are a heartfelt tribute
            to the strength, resilience, and invaluable contributions of women. We create welcoming,
            inclusive spaces where women of all generations and backgrounds can connect, share their
            lived experiences, and honor the journeys that shape their lives.
          </p>
          {isAdmin && (
            <p style={{ marginTop: '1.25rem' }}>
              <Link className="btn btn-solid" to="/moderation/content">
                Post an event
              </Link>
            </p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          {error && <p className="form-error">{error}</p>}

          {posted.length > 0 && (
            <>
              <h2 style={{ marginBottom: '1.25rem' }}>Upcoming and posted gatherings</h2>
              <div className="card-grid">
                {posted.map((event) => {
                  const place = event.is_online ? 'Online' : (event.location || 'Location to be shared')
                  return (
                    <Link className="media-card" key={event.id} to={`/community/events/${event.id}`}>
                      <img src={event.cover_image || '/images/event-shakti-2026a.jpeg'} alt="" />
                      <div className="body">
                        <span className="meta">
                          {formatWhen(event.starts_at)} · {place}
                        </span>
                        <h3>{event.title}</h3>
                        {event.description && (
                          <p>
                            {event.description.length > 160
                              ? `${event.description.slice(0, 160)}…`
                              : event.description}
                          </p>
                        )}
                        <span className="link-more">View event</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}

          <h2 style={{ margin: posted.length ? '2.5rem 0 1.25rem' : '0 0 1.25rem' }}>
            Past gatherings
          </h2>
          <div className="card-grid">
            {events.map((event) => (
              <Link className="media-card" key={event.slug} to={`/our-events/${event.slug}`}>
                <img src={event.image} alt={event.title} />
                <div className="body">
                  <span className="meta">
                    {event.date} · {event.place}
                  </span>
                  <h3>{event.title}</h3>
                  <p>{event.excerpt}</p>
                  <span className="link-more">View event</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
