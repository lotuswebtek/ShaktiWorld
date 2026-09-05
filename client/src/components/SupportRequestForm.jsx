import { useState } from 'react'
import { useAuth } from '@clerk/react'
import SafeForm from './safety/SafeForm.jsx'

const API = import.meta.env.VITE_API_URL || ''

const VISIBILITY_OPTIONS = [
  { value: 'private_to_moderators', label: 'Private — visible only to moderators' },
  { value: 'members_only', label: 'Members only — visible to verified community members' },
  { value: 'public', label: 'Public — visible to everyone' },
]

/**
 * Support request form used on Services category pages.
 * - Disables browser autofill (via SafeForm)
 * - Lets user choose visibility (defaults vary by category)
 * - Warns before submission if the user may be on a shared device
 * - Never sends email containing request content (server-side guarantee)
 *
 * @param {{ category: string, defaultVisibility: string }} props
 */
export default function SupportRequestForm({ category, defaultVisibility = 'private_to_moderators' }) {
  const { getToken } = useAuth()
  const [form, setForm] = useState({
    subject: '',
    body: '',
    visibility: defaultVisibility,
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [sharedDeviceAck, setSharedDeviceAck] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Shared device warning — ask for acknowledgement before first submit
    if (!sharedDeviceAck) {
      setSharedDeviceAck(true)
      return
    }

    setSubmitting(true)
    setResult(null)

    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/community/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-store',
        },
        body: JSON.stringify({ ...form, category }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Submission failed.')

      setResult({ ok: true, message: data.message })
      setForm({ subject: '', body: '', visibility: defaultVisibility })
      setSharedDeviceAck(false)
    } catch (err) {
      setResult({ ok: false, message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="support-form-wrap">
      <h3>Request support</h3>
      <p className="support-form-note">
        Your request is reviewed by a moderator — not an automated system.
        No email is sent containing what you write here.
      </p>

      {result && (
        <div className={`alert ${result.ok ? 'ok' : 'err'}`}>
          {result.message}
        </div>
      )}

      {/* Shared-device warning modal */}
      {sharedDeviceAck && !submitting && (
        <div className="notice notice-warning" style={{ marginBottom: '1rem' }}>
          <h4>Are you on a shared or public device?</h4>
          <p>
            If you are using a shared computer, library terminal, or someone else's phone,
            your browsing history may be visible to others. Consider using a private/incognito
            window, or submitting from your own device.
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <strong>Tap "Submit" again to confirm</strong>, or close this page if you'd prefer
            to come back later.
          </p>
        </div>
      )}

      <SafeForm onSubmit={handleSubmit} className="onboarding-form">
        <label>
          Subject <span className="required">*</span>
          <input
            type="text"
            value={form.subject}
            onChange={set('subject')}
            required
            autoComplete="off"
            placeholder="Brief summary of what you need help with"
          />
        </label>

        <label>
          Your message <span className="required">*</span>
          <textarea
            rows={5}
            value={form.body}
            onChange={set('body')}
            required
            autoComplete="off"
            placeholder="Share as much or as little as you're comfortable with…"
          />
        </label>

        <label>
          Who can see this request?
          <select
            value={form.visibility}
            onChange={set('visibility')}
            autoComplete="off"
          >
            {VISIBILITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {form.visibility === 'private_to_moderators' && (
            <small style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
              Only moderators will see your request. Other members will not.
            </small>
          )}
        </label>

        <button
          type="submit"
          className="btn btn-solid"
          disabled={submitting || !form.subject || !form.body}
        >
          {submitting ? 'Submitting…' : sharedDeviceAck ? 'Confirm and submit' : 'Submit request'}
        </button>
      </SafeForm>
    </div>
  )
}
