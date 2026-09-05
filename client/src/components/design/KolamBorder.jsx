/**
 * Horizontal kolam-inspired border — interlocking looped curves
 * derived from traditional South Indian threshold line-work.
 * Pure SVG geometry, no figurative imagery.
 */
export function KolamBorder({ className = '', color = 'currentColor' }) {
  return (
    <svg
      className={`ds-kolam-border ${className}`}
      viewBox="0 0 400 20"
      preserveAspectRatio="none"
      fill="none"
      stroke={color}
      strokeWidth="1"
      aria-hidden="true"
      role="presentation"
      style={{ width: '100%', height: '20px', display: 'block' }}
    >
      {/* Repeating interlocking loops — kolam single-line tradition */}
      <path d="M0 10 Q10 0 20 10 Q30 20 40 10 Q50 0 60 10 Q70 20 80 10 Q90 0 100 10 Q110 20 120 10 Q130 0 140 10 Q150 20 160 10 Q170 0 180 10 Q190 20 200 10 Q210 0 220 10 Q230 20 240 10 Q250 0 260 10 Q270 20 280 10 Q290 0 300 10 Q310 20 320 10 Q330 0 340 10 Q350 20 360 10 Q370 0 380 10 Q390 20 400 10" />
    </svg>
  )
}

/**
 * Corner ornament — quarter-circle kolam dot grid pattern.
 * Used as structural accent on cards and section edges.
 */
export function KolamCorner({
  className = '',
  color = 'currentColor',
  size = 48,
  position = 'top-left',
}) {
  const rotate =
    position === 'top-right' ? 90 :
    position === 'bottom-right' ? 180 :
    position === 'bottom-left' ? 270 : 0

  return (
    <svg
      className={`ds-kolam-corner ${className}`}
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="0.75"
      aria-hidden="true"
      role="presentation"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* Concentric quarter arcs with dot grid */}
      <path d="M0 48 A48 48 0 0 1 48 0" opacity="0.3" />
      <path d="M0 36 A36 36 0 0 1 36 0" opacity="0.45" />
      <path d="M0 24 A24 24 0 0 1 24 0" opacity="0.6" />
      <path d="M0 12 A12 12 0 0 1 12 0" opacity="0.8" />
      {/* Kolam dots at intersections */}
      <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.4" stroke="none" />
      <circle cx="24" cy="24" r="1.5" fill={color} opacity="0.35" stroke="none" />
      <circle cx="36" cy="36" r="1.5" fill={color} opacity="0.3" stroke="none" />
      <circle cx="24" cy="12" r="1" fill={color} opacity="0.25" stroke="none" />
      <circle cx="12" cy="24" r="1" fill={color} opacity="0.25" stroke="none" />
      <circle cx="36" cy="12" r="1" fill={color} opacity="0.2" stroke="none" />
      <circle cx="12" cy="36" r="1" fill={color} opacity="0.2" stroke="none" />
    </svg>
  )
}
