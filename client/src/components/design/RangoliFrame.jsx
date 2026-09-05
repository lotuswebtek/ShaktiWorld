/**
 * Decorative frame with rangoli-inspired border pattern.
 * Used as a structural accent on feature cards and pull-quotes.
 * Pattern: repeating diamond-dot lattice — geometric only.
 */
export default function RangoliFrame({ children, className = '' }) {
  return (
    <div className={`ds-rangoli-frame ${className}`}>
      {/* Top border pattern */}
      <svg
        className="ds-rangoli-frame-edge ds-rangoli-frame-top"
        viewBox="0 0 200 8"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <pattern id="rangoli-diamond" x="0" y="0" width="16" height="8" patternUnits="userSpaceOnUse">
          <path
            d="M8 0 L12 4 L8 8 L4 4 Z"
            fill="none"
            stroke="var(--color-highlight)"
            strokeWidth="0.5"
            opacity="0.5"
          />
          <circle cx="8" cy="4" r="0.8" fill="var(--color-highlight)" opacity="0.4" />
        </pattern>
        <rect width="200" height="8" fill="url(#rangoli-diamond)" />
      </svg>

      {/* Content */}
      <div className="ds-rangoli-frame-content">{children}</div>

      {/* Bottom border pattern */}
      <svg
        className="ds-rangoli-frame-edge ds-rangoli-frame-bottom"
        viewBox="0 0 200 8"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <use href="#rangoli-diamond" />
        <rect width="200" height="8" fill="url(#rangoli-diamond)" />
      </svg>
    </div>
  )
}
