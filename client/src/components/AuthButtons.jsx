import { Link } from 'react-router-dom'
import { UserButton, useAuth, useUser } from '@clerk/react'
import { site } from '../data/site.js'

export default function AuthButtons({ onNavigate }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const firstName = user?.firstName || user?.username || 'there'

  if (!isLoaded) return null

  if (!isSignedIn) {
    return (
      <>
        <Link className="btn btn-ghost" to="/log-in" onClick={onNavigate}>
          Sign in
        </Link>
        <Link className="btn btn-solid" to="/register" onClick={onNavigate}>
          Register
        </Link>
      </>
    )
  }

  return (
    <>
      <a
        className="btn btn-ghost"
        href={site.whatsappGroup}
        target="_blank"
        rel="noreferrer"
        onClick={onNavigate}
      >
        WhatsApp
      </a>
      <span className="user-chip">Namaste, {firstName}</span>
      <UserButton />
    </>
  )
}
