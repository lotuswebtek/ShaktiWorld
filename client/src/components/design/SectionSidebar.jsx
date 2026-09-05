import { NavLink, useLocation } from 'react-router-dom'
import { KolamCorner } from './KolamBorder.jsx'

/**
 * Section-aware sidebar navigation.
 * Shows contextual sub-navigation based on the current section.
 * Renders only on pages that have sidebar content defined.
 */

const SECTION_NAV = {
  community: {
    label: 'Community',
    links: [
      { to: '/our-events', label: 'Our Events' },
      { to: '/community/resources', label: 'Resources' },
      { to: '/community/businesses', label: 'Businesses' },
      { to: '/career', label: 'Career' },
      { to: '/community/jobs', label: 'Jobs' },
      { to: '/training', label: 'Training' },
    ],
  },
  services: {
    label: 'Services',
    links: [
      { to: '/services/health', label: 'Health' },
      { to: '/services/mental-wellbeing', label: 'Mental Wellbeing' },
      { to: '/services/domestic-violence', label: 'Domestic Violence' },
      { to: '/services/dowry', label: 'Dowry Support' },
    ],
  },
  listening: {
    label: 'Listening',
    links: [
      { to: '/listening', label: 'All Posts' },
      { to: '/listening/new', label: 'Share Your Story' },
    ],
  },
}

function detectSection(pathname) {
  if (pathname.startsWith('/services')) return 'services'
  if (pathname.startsWith('/listening')) return 'listening'
  if (['/career', '/community/jobs', '/community/businesses', '/community/events', '/community/resources', '/training'].some((p) => pathname.startsWith(p))) return 'community'
  return null
}

export default function SectionSidebar() {
  const location = useLocation()
  const sectionKey = detectSection(location.pathname)
  const section = sectionKey ? SECTION_NAV[sectionKey] : null

  if (!section) return null

  return (
    <aside className="ds-sidebar" aria-label={`${section.label} navigation`}>
      <div className="ds-sidebar-inner">
        {/* Corner ornament */}
        <KolamCorner
          color="var(--color-highlight)"
          size={32}
          position="top-left"
          className="ds-sidebar-corner"
        />

        <h4 className="ds-sidebar-title">{section.label}</h4>

        <nav>
          <ul className="ds-sidebar-links">
            {section.links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `ds-sidebar-link ${isActive ? 'ds-sidebar-link-active' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
