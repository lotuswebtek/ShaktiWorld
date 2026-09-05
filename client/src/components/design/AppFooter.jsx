import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { navLinks, site } from '../../data/site.js'
import SocialIcons from '../SocialIcons.jsx'
import NavItem from '../NavItem.jsx'
import KolamDivider from './KolamDivider.jsx'
import { KolamCorner } from './KolamBorder.jsx'

/**
 * Redesigned footer with kolam accents.
 * Dark surface with textile-dye palette accents.
 */
export default function AppFooter() {
  const { isSignedIn } = useAuth()
  const visibleLinks = navLinks.filter((item) => !item.membersOnly || isSignedIn)

  return (
    <footer className="ds-footer">
      {/* Kolam divider at top of footer */}
      <div className="ds-footer-divider">
        <KolamDivider lineColor="rgba(227, 199, 122, 0.2)" rosetteFill="var(--color-haldi-400)" />
      </div>

      <div className="ds-footer-grid">
        {/* Brand column */}
        <div className="ds-footer-brand">
          <div className="ds-footer-brand-row">
            <img src="/images/logo.png" alt="" width="64" height="64" />
            <div>
              <h3>Shaktiworld</h3>
              <p>{site.footer}</p>
            </div>
          </div>
          {/* Corner ornament */}
          <KolamCorner
            color="var(--color-haldi-500)"
            size={40}
            position="bottom-left"
            className="ds-footer-corner"
          />
        </div>

        {/* Explore links */}
        <div>
          <h4>Explore</h4>
          <ul>
            {visibleLinks.map((item) => (
              <li key={item.to}>
                <NavItem {...item} />
              </li>
            ))}
            <li>
              <Link to="/register">Join the movement</Link>
            </li>
          </ul>
        </div>

        {/* Contact / social */}
        <div>
          <h4>Connect</h4>
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

      {/* Legal bar */}
      <div className="ds-footer-legal">
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
  )
}
