import { site } from '../data/site.js'

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.2 21v-7.2h2.4l.36-2.8h-2.76V9.2c0-.8.22-1.35 1.38-1.35H17V5.34C16.66 5.3 15.7 5.2 14.6 5.2c-2.3 0-3.88 1.4-3.88 4V11H8.2v2.8h2.52V21h3.48Z"
      />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 8.2a2.7 2.7 0 0 0-1.9-1.92C18.1 6 12 6 12 6s-6.1 0-7.7.28A2.7 2.7 0 0 0 2.4 8.2 28 28 0 0 0 2.1 12a28 28 0 0 0 .3 3.8 2.7 2.7 0 0 0 1.9 1.92C5.9 18 12 18 12 18s6.1 0 7.7-.28a2.7 2.7 0 0 0 1.9-1.92 28 28 0 0 0 .3-3.8 28 28 0 0 0-.3-3.8ZM10.2 14.7V9.3L15.3 12l-5.1 2.7Z"
      />
    </svg>
  )
}

const networks = [
  { name: 'Instagram', href: site.instagram, Icon: InstagramIcon },
  { name: 'Facebook', href: site.facebook, Icon: FacebookIcon },
  { name: 'YouTube', href: site.youtube, Icon: YouTubeIcon },
]

export default function SocialIcons({ variant = 'icons' }) {
  if (variant === 'footer') {
    return (
      <ul className="social-footer">
        {networks.map(({ name, href, Icon }) => (
          <li key={name}>
            <a href={href} target="_blank" rel="noreferrer">
              <span className="social-icon">
                <Icon />
              </span>
              {name}
            </a>
          </li>
        ))}
      </ul>
    )
  }

  const className = variant === 'float' ? 'social-float' : 'social-row'

  return (
    <div className={className} aria-label="Social media">
      {networks.map(({ name, href, Icon }) => (
        <a key={name} className="social-icon" href={href} target="_blank" rel="noreferrer" aria-label={name}>
          <Icon />
        </a>
      ))}
    </div>
  )
}
