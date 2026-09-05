import { useState } from 'react'
import { useUser } from '@clerk/react'
import { CURRENT_LEGAL } from '../../data/legal.js'
import { TermsConsent } from '../legal/TermsConsent.jsx'
import { readStoredLegalConsent, storeLegalConsent, clearStoredLegalConsent } from '../../lib/legalConsent.js'

export default function ProfileForm({ onSubmit }) {
  const { user } = useUser()
  const [form, setForm] = useState({
    fullName: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '',
    city: '',
    state: '',
    country: 'India',
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    phone: '',
    whatsapp: '',
    bio: '',
  })
  const [accepted, setAccepted] = useState(() => Boolean(readStoredLegalConsent()))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleAccept = (checked) => {
    setAccepted(checked)
    if (checked) storeLegalConsent()
    else clearStoredLegalConsent()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!accepted) {
      setError('Accept the current Terms of Use, Privacy Policy, and Community Guidelines to continue.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        ...form,
        acceptedTermsVersion: CURRENT_LEGAL.terms,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 620 }}>
        <p className="eyebrow">Step 1 of 3</p>
        <h1 style={{ marginTop: '0.5rem' }}>Complete your profile</h1>
        <p className="lede" style={{ marginTop: '0.75rem', marginBottom: '2rem' }}>
          Tell us a little about yourself so the community knows who you are.
        </p>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit} className="onboarding-form">
          <label>
            Full name <span className="required">*</span>
            <input type="text" value={form.fullName} onChange={set('fullName')} required />
          </label>

          <div className="form-row">
            <label>
              City <span className="required">*</span>
              <input type="text" value={form.city} onChange={set('city')} required />
            </label>
            <label>
              State / Province
              <input type="text" value={form.state} onChange={set('state')} />
            </label>
          </div>

          <label>
            Country <span className="required">*</span>
            <input type="text" value={form.country} onChange={set('country')} required />
          </label>

          <label>
            Email <span className="required">*</span>
            <input type="email" value={form.email} onChange={set('email')} required />
          </label>

          <div className="form-row">
            <label>
              Phone
              <input type="tel" value={form.phone} onChange={set('phone')} />
            </label>
            <label>
              WhatsApp
              <input type="tel" value={form.whatsapp} onChange={set('whatsapp')} />
            </label>
          </div>

          <label>
            Short bio
            <textarea rows={3} value={form.bio} onChange={set('bio')} placeholder="A sentence or two about yourself…" />
          </label>

          <TermsConsent checked={accepted} onChange={handleAccept} id="accept-legal-profile" />

          <button type="submit" className="btn btn-solid" disabled={submitting || !accepted}>
            {submitting ? 'Saving…' : 'Continue'}
          </button>
        </form>
      </div>
    </section>
  )
}
