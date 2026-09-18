import { NavLink, useLocation } from 'react-router-dom'

export function memberRegisterPath(to) {
  return `/register?next=${encodeURIComponent(to)}`
}

export default function NavItem({ to, label, membersOnly, onClick, end }) {
  const location = useLocation()

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
