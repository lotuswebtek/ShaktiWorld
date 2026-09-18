import { useEffect, useState } from 'react'

const CLERK_TIMEOUT_MESSAGE =
  'Your account is taking too long to load. Allow pop-ups for this site, then try again.'

export function useLoadTimeout(ready, ms = 10000) {
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (ready) {
      setTimedOut(false)
      return undefined
    }
    const id = window.setTimeout(() => setTimedOut(true), ms)
    return () => window.clearTimeout(id)
  }, [ready, ms])

  return timedOut
}

export { CLERK_TIMEOUT_MESSAGE }
