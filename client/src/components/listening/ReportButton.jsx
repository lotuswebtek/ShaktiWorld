import { useState } from 'react'

/**
 * Report button for posts and replies.
 * Shows a reason input on click, then submits.
 */
export default function ReportButton({ targetType, targetId, onReport }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (done) {
    return <span className="listening-report-done">Report submitted</span>
  }

  if (!open) {
    return (
      <button
        type="button"
        className="listening-report-btn"
        onClick={() => setOpen(true)}
        title="Report this content"
      >
        Report
      </button>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) return
    setSubmitting(true)
    try {
      await onReport(targetType, targetId, reason)
      setDone(true)
    } catch {
      // silent — the button shows "Report submitted" on success only
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="listening-report-form">
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Why are you reporting this?"
        autoComplete="off"
        required
      />
      <button type="submit" disabled={submitting || !reason.trim()}>
        {submitting ? '…' : 'Send'}
      </button>
      <button type="button" onClick={() => { setOpen(false); setReason('') }}>
        Cancel
      </button>
    </form>
  )
}
