import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/react'
import { footerLinks, navLinks, site } from '../data/site.js'
import AuthButtons from './AuthButtons.jsx'
import NavItem from './NavItem.jsx'
import PostAuthRedirect from './PostAuthRedirect.jsx'
import RevealObserver from './RevealObserver.jsx'
import SocialIcons from './SocialIcons.jsx'
import WhatsAppJoin from './WhatsAppJoin.jsx'
import CrisisBanner from './safety/CrisisBanner.jsx'
import useOnboarding from '../hooks/useOnboarding.js'
import { clerkUserIsStaff } from '../config/staff.js'

const SAFETY_PREFIXES = [
  '/services',
  '/listening',
  '/support',
  '/career',
  '/job',
  '/community/jobs',
  '/community/businesses',
  '/community/events',
  '/community/resources',
  '/training',
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const { status } = useOnboarding()
  const location = useLocation()
  const visibleLinks = navLinks
  const isAdmin = status?.role === 'admin' || clerkUserIsStaff(user)
  const isStaff = isAdmin || status?.role === 'moderator'
  const showStaffNav = Boolean(isSignedIn && (isStaff || status?.role !== 'member'))
  const showSafety = SAFETY_PREFIXES.some((p) => location.pathname.startsWith(p))
  const close = () => setOpen(false)

  useEffect(() => {
    close()
  }, [location.pathname])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <PostAuthRedirect />
      <RevealObserver />
      <WhatsAppJoin />

      <header className="site-header">
        <Link to="/" className="brand" onClick={close}>
          <img src="/images/logo.png" alt="Shaktiworld logo" />
          <span className="brand-text">
            <strong>Shaktiworld</strong>
            <span>Voice · Power · Community</span>
          </span>
        </Link>

        <div className="header-actions">
          {showStaffNav && (
            <Link to="/moderation/verifications" className="header-staff-link" onClick={close}>
              Verify members
            </Link>
          )}
          <button
            className={`menu-toggle ${open ? 'open' : ''}`}
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {open && (
        <button className="sidebar-backdrop" type="button" aria-label="Close menu" onClick={close} />
      )}

      <aside className={`site-sidebar ${open ? 'open' : ''}`} aria-hidden={!open}>
        {!isSignedIn && (
          <div className="nav-cta">
            <Link className="btn btn-solid" to="/register" onClick={close}>
              Register
            </Link>
            <Link className="btn btn-ghost" to="/log-in" onClick={close}>
              Sign in
            </Link>
          </div>
        )}

        <nav className="nav" aria-label="Primary">
          {visibleLinks.map((item) => (
            <NavItem key={item.to} {...item} end={item.to === '/'} onClick={close} />
          ))}
          {showStaffNav && (
            <>
              <p className="nav-staff-label">Moderation</p>
              <NavItem to="/moderation/verifications" label="Verify members" onClick={close} />
              {isAdmin && (
                <NavItem to="/moderation/content" label="Post event" onClick={close} />
              )}
            </>
          )}
        </nav>

        <div className="sidebar-end">
          {!isSignedIn && <SocialIcons />}
          {isSignedIn && (
            <div className="nav-cta">
              {showStaffNav && (
                <Link className="btn btn-solid" to="/moderation/verifications" onClick={close}>
                  Verify members
                </Link>
              )}
              <AuthButtons onNavigate={close} />
            </div>
          )}
        </div>
      </aside>

      {isSignedIn && <SocialIcons variant="float" />}
      {showSafety && <CrisisBanner />}

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <img src="/images/logo.png" alt="" />
            <div>
              <h3>Shaktiworld</h3>
              <p>{site.footer}</p>
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              {footerLinks.map((item) => (
                <li key={item.to}>
                  <NavItem {...item} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Follow us</h4>
            <SocialIcons variant="footer" />
            <ul>
              {isSignedIn && (
                <li>
                  <a href={site.whatsappGroup} target="_blank" rel="noreferrer">
                    WhatsApp group
                  </a>
                </li>
              )}
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>{site.location}</li>
            </ul>
          </div>
        </div>
        <div className="container legal">
          <span>© {new Date().getFullYear()} Shaktiworld / All Rights Reserved</span>
          <nav className="legal-links" aria-label="Legal">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/community-guidelines">Guidelines</Link>
            <Link to="/content-policy">Content policy</Link>
            <Link to="/volunteer-agreement">Volunteer agreement</Link>
          </nav>
        </div>
      </footer>
    </>
  )
}
