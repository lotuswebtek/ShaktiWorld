import { useState } from 'react'
import { helplines } from '../../config/helplines.js'

/**
 * A banner that surfaces verified crisis helpline numbers.
 * Shown at the top of Services / Listening / Support pages.
 * Can be dismissed for the current session.
 */
export default function CrisisBanner() {
  const [dismissed, setDismissed] = useState(false)

  // Filter out TODO entries so we only show verified numbers
  const verified = helplines.filter(
    (h) => h.number && !h.number.startsWith('TODO'),
  )

  if (dismissed || verified.length === 0) return null

  return (
    <div className="crisis-banner" role="alert">
      <div className="crisis-banner-inner container">
        <div className="crisis-banner-content">
          <strong>Need immediate help?</strong>
          <span className="crisis-banner-numbers">
            {verified.map((h, i) => (
              <span key={i} className="crisis-helpline">
                <span className="crisis-helpline-label">{h.label}:</span>{' '}
                <a
                  href={h.number.match(/^\d/) ? `tel:${h.number.replace(/[^+\d]/g, '')}` : undefined}
                  className="crisis-helpline-number"
                >
                  {h.number}
                </a>
                {h.available && h.available !== 'TODO' && (
                  <span className="crisis-helpline-avail">({h.available})</span>
                )}
              </span>
            ))}
          </span>
        </div>
        <button
          type="button"
          className="crisis-banner-close"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss crisis banner"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
