import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { memberRegisterPath } from '../components/NavItem.jsx'
import { opportunities } from '../data/site.js'
import { API } from '../config/env.js'

const empty = { name: '', email: '', interest: 'career', message: '' }

export default function WorkWithUs() {
  const { isSignedIn } = useAuth()
  const [form, setForm] = useState(empty)
  const [status, setStatus] = useState(null)

  function update(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setStatus(null)
    try {
      const res = await fetch(`${API}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Something went wrong.')
      setStatus({ type: 'ok', text: data.message })
      setForm(empty)
    } catch (err) {
      setStatus({ type: 'err', text: err.message })
    }
  }

  return (
    <>
      <section className="page-hero">
        <img src="/images/opp-training.jpg" alt="Women collaborating at work" />
        <div className="page-hero-copy">
          <p className="kicker">Work with us</p>
          <h1>Unleash your inner strength & lead with purpose</h1>
          <p>
            At Shaktiworld, we are building a vibrant ecosystem where women are empowered to excel,
            innovate, and lead. Rooted in the transformative energy of Shakti and guided by Hindu
            values of wisdom, integrity, and unity, our platform uplifts women at every stage of
            their professional journey.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="kicker">Explore opportunities</p>
          <h2>Career. Job. Training.</h2>
          <p className="lede">
            Register or log in to unlock Career, Job, and Training in the top menu — with growth
            maps, open roles, and skill modules waiting inside.
          </p>
          <div className="card-grid" style={{ marginTop: '2.2rem' }}>
            {opportunities.map((item) => (
              <Link
                className="media-card"
                key={item.key}
                to={isSignedIn ? item.to : memberRegisterPath(item.to)}
                onClick={() => {
                  if (!isSignedIn) sessionStorage.setItem('sw_next', item.to)
                }}
              >
                <img src={item.image} alt={item.title} />
                <div className="body">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <span className="link-more">
                    {isSignedIn ? `Open ${item.title.toLowerCase()} space` : 'Register to explore'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container form-shell">
          <div>
            <p className="kicker">Get started today</p>
            <h2>Take the first step toward your goals</h2>
            <p className="lede">
              Whether you are looking to join our core team, upgrade your technical skills, or
              contribute to meaningful community initiatives, Shaktiworld offers a supportive space
              designed for your personal and career transformation.
            </p>
          </div>
          <form className="form" onSubmit={onSubmit}>
            {status && <div className={`alert ${status.type}`}>{status.text}</div>}
            <label>
              Full name
              <input name="name" value={form.name} onChange={update} required />
            </label>
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={update} required />
            </label>
            <label>
              I am interested in
              <select name="interest" value={form.interest} onChange={update}>
                {opportunities.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tell us about you
              <textarea name="message" value={form.message} onChange={update} />
            </label>
            <button className="btn btn-solid" type="submit">
              Submit application
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
