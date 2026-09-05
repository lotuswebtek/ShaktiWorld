import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { navLinks, site } from '../../data/site.js'
import AuthButtons from '../AuthButtons.jsx'
import NavItem from '../NavItem.jsx'
import SocialIcons from '../SocialIcons.jsx'
import { KolamBorder } from './KolamBorder.jsx'

/**
 * Redesigned app header using the design system.
 * Sticky, with glassmorphism backdrop and kolam accent border.
 * Member nav items conditionally shown based on auth status.
 * Works at 320px width (hamburger menu on mobile).
 */
export default function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isSignedIn } = useAuth()
  const visibleLinks = navLinks.filter((item) => !item.membersOnly || isSignedIn)

  return (
    <header className="ds-header">
      <div className="ds-header-inner">
        {/* Brand */}
        <Link to="/" className="ds-brand" onClick={() => setMenuOpen(false)}>
          <img
            src="/images/logo.png"
            alt="Shaktiworld logo"
            className="ds-brand-logo"
            width="72"
            height="72"
          />
          <span className="ds-brand-text">
            <strong>Shaktiworld</strong>
            <span>Voice · Power · Community</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ds-nav-desktop" aria-label="Primary navigation">
          {visibleLinks.map((item) => (
            <NavItem key={item.to} {...item} end={item.to === '/'} />
          ))}
        </nav>

        {/* Right cluster */}
        <div className="ds-header-end">
          {!isSignedIn && <SocialIcons />}
          <div className="ds-header-auth">
            <AuthButtons />
          </div>

          {/* Hamburger */}
          <button
            type="button"
            className="ds-hamburger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={menuOpen ? 'ds-hamburger-x' : ''} />
            <span className={menuOpen ? 'ds-hamburger-x' : ''} />
            <span className={menuOpen ? 'ds-hamburger-x' : ''} />
          </button>
        </div>
      </div>

      {/* Kolam accent — subtle structural border below header */}
      <KolamBorder color="var(--color-highlight)" className="ds-header-kolam" />

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="ds-nav-mobile" aria-label="Mobile navigation">
          {visibleLinks.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              end={item.to === '/'}
              onClick={() => setMenuOpen(false)}
            />
          ))}
          <div className="ds-nav-mobile-auth">
            {!isSignedIn && <SocialIcons />}
            <AuthButtons onNavigate={() => setMenuOpen(false)} />
          </div>
        </nav>
      )}
    </header>
  )
}
