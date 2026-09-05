import { useEffect, useRef, useCallback } from 'react'

const SAFE_URL = 'https://www.google.com'

/**
 * Immediately leaves the site: clears sessionStorage,
 * replaces current history entry (no back-button trail),
 * and navigates to a neutral page.
 */
function exitNow() {
  try {
    sessionStorage.clear()
    localStorage.removeItem('sw_draft')
  } catch {
    // silent — exiting is more important than cleanup
  }
  window.location.replace(SAFE_URL)
}

/**
 * Fixed "Quick Exit" button visible on every page where safety matters.
 * Also listens for Esc pressed twice within 800 ms as a keyboard shortcut.
 */
export default function QuickExit() {
  const lastEsc = useRef(0)

  const handleKeyDown = useCallback((e) => {
    if (e.key !== 'Escape') return
    const now = Date.now()
    if (now - lastEsc.current < 800) {
      exitNow()
    }
    lastEsc.current = now
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <button
      type="button"
      className="quick-exit"
      onClick={exitNow}
      aria-label="Leave this site quickly"
      title="Leave this site quickly (or press Esc twice)"
    >
      <span className="quick-exit-icon" aria-hidden="true">✕</span>
      <span className="quick-exit-label">Quick Exit</span>
    </button>
  )
}
