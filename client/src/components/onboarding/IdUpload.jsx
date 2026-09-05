import { useState } from 'react'

const DOC_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar card' },
  { value: 'passport', label: 'Passport' },
  { value: 'driving_licence', label: 'Driving licence' },
  { value: 'student_id', label: 'Student ID' },
  { value: 'other', label: 'Other government ID' },
]

export default function IdUpload({ onUpload, rejectionReason }) {
  const [docType, setDocType] = useState('')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!docType || !file) return
    setSubmitting(true)
    setError(null)
    try {
      await onUpload(docType, file)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 620 }}>
        <p className="eyebrow">Step 2 of 3</p>
        <h1 style={{ marginTop: '0.5rem' }}>Identity verification</h1>

        {rejectionReason && (
          <div className="notice notice-warning" style={{ marginTop: '1rem' }}>
            <strong>Your previous submission was not approved.</strong>
            <p>{rejectionReason}</p>
            <p>Please upload a new document below.</p>
          </div>
        )}

        <div className="notice notice-info" style={{ marginTop: '1rem' }}>
          <h4>Why we ask for a document</h4>
          <p>
            To keep Shaktiworld a safe, trusted space, we verify that every member is a real person.
            A moderator will review your document manually — no automated scanning or OCR is used.
          </p>
          <h4 style={{ marginTop: '0.75rem' }}>What we store</h4>
          <p>
            We store only the <strong>type</strong> of document you submitted and the image itself
            in private storage that is not publicly accessible. <strong>The ID number on your document is never
            extracted, copied, or stored.</strong>
          </p>
          <h4 style={{ marginTop: '0.75rem' }}>How long we keep it</h4>
          <p>
            Your document is kept until verification is complete. Once your account is approved,
            the document is retained for 90 days for dispute resolution, then permanently deleted.
          </p>
        </div>

        {error && <p className="form-error" style={{ marginTop: '1rem' }}>{error}</p>}

        <form onSubmit={handleSubmit} className="onboarding-form" style={{ marginTop: '1.5rem' }}>
          <label>
            Document type <span className="required">*</span>
            <select value={docType} onChange={(e) => setDocType(e.target.value)} required>
              <option value="">Select document type…</option>
              {DOC_TYPES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </label>

          <label>
            Upload document <span className="required">*</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
            <small style={{ color: 'var(--muted)' }}>
              JPEG, PNG, WebP, or PDF — max 10 MB
            </small>
          </label>

          <button type="submit" className="btn btn-solid" disabled={submitting || !docType || !file}>
            {submitting ? 'Uploading…' : 'Submit for review'}
          </button>
        </form>
      </div>
    </section>
  )
}
