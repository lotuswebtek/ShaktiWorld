import { Link, useParams } from 'react-router-dom'
import { events } from '../data/site.js'
import NotFound from './NotFound.jsx'

export default function EventDetail() {
  const { slug } = useParams()
  const event = events.find((item) => item.slug === slug)
  if (!event) return <NotFound />

  return (
    <section className="section">
      <div className="container detail">
        <div>
          <img className="cover" src={event.image} alt={event.title} />
          {event.gallery?.length > 1 && (
            <div className="gallery">
              {event.gallery.map((src) => (
                <img key={src} src={src} alt="" />
              ))}
            </div>
          )}
        </div>
        <div className="detail-copy rich">
          <p className="kicker">Event</p>
          <h1>{event.title}</h1>
          <p className="meta">
            {event.date} · {event.place}
          </p>
          <p>{event.body}</p>
          <p style={{ marginTop: '1.8rem' }}>
            <Link className="btn btn-solid" to="/our-events">
              All events
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
