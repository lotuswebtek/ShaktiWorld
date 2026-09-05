import { Link } from 'react-router-dom'
import RequireAuth from '../components/RequireAuth.jsx'
import { memberAreas } from '../data/site.js'

const area = memberAreas.career

export default function Career() {
  return (
    <RequireAuth>
      <section className="page-hero">
        <img src={area.image} alt="Women growing in their careers" />
        <div className="page-hero-copy">
          <p className="kicker">{area.kicker}</p>
          <h1>{area.title}</h1>
          <p>{area.intro}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="kicker">How we grow you</p>
          <h2>Mentorship. Leadership. Balance.</h2>
          <div className="card-grid" style={{ marginTop: '2rem' }}>
            {area.pillars.map((item) => (
              <article className="pillar" key={item.title}>
                <span className="eyebrow">{item.title}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container">
          <p className="kicker">{area.planTitle}</p>
          <h2>Four moves that compound</h2>
          <div className="do-list" style={{ marginTop: '1.6rem' }}>
            {area.plan.map((item) => (
              <div className="do-item" key={item.step}>
                <span className="do-num">{item.step}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="kicker">Tools for the path</p>
          <h2>Carry these into every room</h2>
          <div className="card-grid" style={{ marginTop: '2rem' }}>
            {area.resources.map((item) => (
              <article className="pillar" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <p className="lede" style={{ marginTop: '2.2rem' }}>
            {area.cta}
          </p>
          <div className="hero-actions" style={{ justifyContent: 'flex-start', marginTop: '1.2rem' }}>
            <Link className="btn btn-solid" to="/work-with-us">
              Talk with the team
            </Link>
            <Link className="btn btn-ghost" to="/training">
              Start training
            </Link>
          </div>
        </div>
      </section>
    </RequireAuth>
  )
}
