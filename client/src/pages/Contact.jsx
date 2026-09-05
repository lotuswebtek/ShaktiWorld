import { useState } from 'react'
import { site } from '../data/site.js'
import SocialIcons from '../components/SocialIcons.jsx'

const empty = { name: '', email: '', subject: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(empty)
  const [status, setStatus] = useState(null)

  function update(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setStatus(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Unable to send message.')
      setStatus({ type: 'ok', text: data.message })
      setForm(empty)
    } catch (err) {
      setStatus({ type: 'err', text: err.message })
    }
  }

  return (
    <>
      <section className="page-hero">
        <img src="/images/contact.jpeg" alt="Shaktiworld community" />
        <div className="page-hero-copy">
          <p className="kicker">Contact us</p>
          <h1>We’d love to hear from you</h1>
          <p>
            Whether you have a question, want to collaborate, or are ready to share your work,
            Shaktiworld is here to connect with you. Reach out and be part of a growing community
            rooted in the spirit of Maa Durga, Maa Saraswati, and Maa Lakshmi — a space of strength,
            wisdom, and abundance.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container form-shell">
          <div>
            <p className="kicker">Have a question?</p>
            <h2>Do not hesitate to write</h2>
            <p className="lede">
              Do you have questions or comments? Contact us and we will answer you quickly.
            </p>
            <p className="lede">
              Houston Chapter
              <br />
              {site.email}
              <br />
              {site.phone}
              <br />
              {site.location}
            </p>
            <p className="lede">Follow us</p>
            <SocialIcons />
          </div>
          <form className="form" onSubmit={onSubmit}>
            {status && <div className={`alert ${status.type}`}>{status.text}</div>}
            <label>
              Name
              <input name="name" value={form.name} onChange={update} required />
            </label>
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={update} required />
            </label>
            <label>
              Subject
              <input name="subject" value={form.subject} onChange={update} />
            </label>
            <label>
              Message
              <textarea name="message" value={form.message} onChange={update} required />
            </label>
            <button className="btn btn-solid" type="submit">
              Send message
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
