import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/react'

export function memberRegisterPath(to) {
  return `/register?next=${encodeURIComponent(to)}`
}

export default function NavItem({ to, label, membersOnly, onClick, end }) {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()

  if (membersOnly && (!isLoaded || !isSignedIn)) return null

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => {
        if (membersOnly) return location.pathname === to ? 'active' : ''
        return isActive ? 'active' : ''
      }}
      onClick={onClick}
    >
      {label}
    </NavLink>
  )
}
