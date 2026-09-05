import { Link } from 'react-router-dom'
import RequireAuth from '../components/RequireAuth.jsx'
import { memberAreas } from '../data/site.js'

const area = memberAreas.job

export default function Job() {
  return (
    <RequireAuth>
      <section className="page-hero">
        <img src={area.image} alt="Women collaborating on meaningful work" />
        <div className="page-hero-copy">
          <p className="kicker">{area.kicker}</p>
          <h1>{area.title}</h1>
          <p>{area.intro}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="kicker">Open roles</p>
          <h2>Where you can make an impact now</h2>
          <div className="card-grid two" style={{ marginTop: '2rem' }}>
            {area.roles.map((role) => (
              <article className="media-card" key={role.title}>
                <div className="body">
                  <span className="meta">{role.type}</span>
                  <h3>{role.title}</h3>
                  <p>{role.summary}</p>
                  <p>
                    <strong>You’ll thrive if you bring:</strong> {role.need}
                  </p>
                  <Link className="link-more" to="/work-with-us">
                    Apply for this role
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container why-grid">
          <div>
            <p className="kicker">How to apply</p>
            <h2>A clear, human process</h2>
            <div className="do-list">
              {area.applySteps.map((item, index) => (
                <div className="do-item" key={item.title}>
                  <span className="do-num">0{index + 1}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="kicker">Stand out</p>
            <h2>Practical tips</h2>
            <ul className="guide-list">
              {area.tips.map((tip) => (
                <li key={tip}>{tip}</li>
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
              Submit an application
            </Link>
            <Link className="btn btn-ghost" to="/career">
              Build your career path
            </Link>
          </div>
        </div>
      </section>
    </RequireAuth>
  )
}
