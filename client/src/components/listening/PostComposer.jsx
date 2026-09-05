import { useState } from 'react'
import SafeForm from '../safety/SafeForm.jsx'

/**
 * Compose a new listening post.
 * Optional anonymity: post shows "A member" publicly but
 * the record still links to user_id internally.
 */
export default function PostComposer({ onCreate }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    setResult(null)
    try {
      const data = await onCreate({ title: title.trim() || undefined, body, isAnonymous })
      setResult({ ok: true, message: data.message })
      setTitle('')
      setBody('')
      setIsAnonymous(false)
      setOpen(false)
    } catch (err) {
      setResult({ ok: false, message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <div className="listening-composer-trigger">
        {result && (
          <div className={`alert ${result.ok ? 'ok' : 'err'}`} style={{ marginBottom: '1rem' }}>
            {result.message}
          </div>
        )}
        <button type="button" className="btn btn-solid" onClick={() => setOpen(true)}>
          Share your story
        </button>
      </div>
    )
  }

  return (
    <div className="listening-composer">
      {result && (
        <div className={`alert ${result.ok ? 'ok' : 'err'}`} style={{ marginBottom: '1rem' }}>
          {result.message}
        </div>
      )}
      <SafeForm onSubmit={handleSubmit} className="onboarding-form">
        <label>
          Title <small style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</small>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your story a title, or leave blank"
            autoComplete="off"
          />
        </label>

        <label>
          Your story <span className="required">*</span>
          <textarea
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            autoComplete="off"
            placeholder="Share what's on your mind. This is a space for listening — no judgement."
          />
        </label>

        <label className="check" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          Post anonymously
          <small style={{ fontWeight: 400, color: 'var(--muted)', marginLeft: '0.3rem' }}>
            — your name won't be shown, but moderators can still see it
          </small>
        </label>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button type="submit" className="btn btn-solid" disabled={submitting || !body.trim()}>
            {submitting ? 'Posting…' : 'Post'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      </SafeForm>
    </div>
  )
}
