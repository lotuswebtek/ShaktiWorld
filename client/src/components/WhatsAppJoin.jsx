import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react'
import { site } from '../data/site.js'

const STORAGE_KEY = 'sw_whatsapp_joined'

function openWhatsAppGroup() {
  window.open(site.whatsappGroup, '_blank', 'noopener,noreferrer')
}

export default function WhatsAppJoin() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      if (isLoaded && !isSignedIn) setOpen(false)
      return
    }

    const seen = localStorage.getItem(`${STORAGE_KEY}_${userId}`)
    if (seen) return

    setOpen(true)
    openWhatsAppGroup()
  }, [isLoaded, isSignedIn, userId])

  if (!isSignedIn || !open) return null

  function joinGroup() {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, '1')
    openWhatsAppGroup()
    setOpen(false)
  }

  function continueToSite() {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, '1')
    setOpen(false)
  }

  return (
    <div className="wa-overlay" role="dialog" aria-modal="true" aria-labelledby="wa-title">
      <div className="wa-card">
        <p className="kicker">Welcome to the sisterhood</p>
        <h2 id="wa-title">Join the Shaktiworld WhatsApp group</h2>
        <p className="lede">
          You are in. We are opening the community group so you can meet other members, hear about
          events, and grow together in Career, Job, and Training.
        </p>
        <div className="hero-actions" style={{ justifyContent: 'flex-start', marginTop: '1.6rem' }}>
          <button className="btn btn-solid" type="button" onClick={joinGroup}>
            Join WhatsApp group
          </button>
          <button className="btn btn-ghost" type="button" onClick={continueToSite}>
            Continue to the site
          </button>
        </div>
      </div>
    </div>
  )
}
