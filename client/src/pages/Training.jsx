import { Link } from 'react-router-dom'
import RequireAuth from '../components/RequireAuth.jsx'
import { memberAreas } from '../data/site.js'

const area = memberAreas.training

export default function Training() {
  return (
    <RequireAuth>
      <section className="page-hero">
        <img src={area.image} alt="Women learning together" />
        <div className="page-hero-copy">
          <p className="kicker">{area.kicker}</p>
          <h1>{area.title}</h1>
          <p>{area.intro}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="kicker">Learning modules</p>
          <h2>Skills you can use this season</h2>
          <div className="card-grid two" style={{ marginTop: '2rem' }}>
            {area.modules.map((mod) => (
              <article className="media-card" key={mod.title}>
                <div className="body">
                  <span className="meta">{mod.length}</span>
                  <h3>{mod.title}</h3>
                  <p>{mod.text}</p>
                  <p>
                    <strong>Practice:</strong> {mod.practice}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container why-grid">
          <div>
            <p className="kicker">A simple weekly rhythm</p>
            <h2>Learn. Make. Share.</h2>
            <div className="do-list">
              {area.weekly.map((item) => (
                <div className="do-item" key={item.day}>
                  <span className="do-num">{item.day}</span>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="quote-card">
            <p>“Progress is a finished draft, not a perfect brand.”</p>
            <ul className="guide-list light">
              {area.confidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="lede">{area.cta}</p>
          <div className="hero-actions" style={{ justifyContent: 'flex-start', marginTop: '1.2rem' }}>
            <Link className="btn btn-solid" to="/work-with-us">
              Request a mentor
            </Link>
            <Link className="btn btn-ghost" to="/community/jobs">
              See open roles
            </Link>
          </div>
        </div>
      </section>
    </RequireAuth>
  )
}
