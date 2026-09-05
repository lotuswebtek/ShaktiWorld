/**
 * Section divider with a central kolam rosette.
 * The rosette is pure geometry — overlapping circles
 * forming a six-petal pattern (hexafoil), a motif
 * found across Indian decorative arts.
 *
 * No figurative depiction of any deity.
 */
export default function KolamDivider({
  className = '',
  lineColor = 'var(--color-border)',
  rosetteFill = 'var(--color-highlight)',
  width = '100%',
}) {
  return (
    <div
      className={`ds-kolam-divider ${className}`}
      aria-hidden="true"
      role="presentation"
      style={{ width, display: 'flex', alignItems: 'center', gap: 0 }}
    >
      {/* Left line */}
      <span style={{
        flex: 1,
        height: '1px',
        background: lineColor,
      }} />

      {/* Central hexafoil rosette */}
      <svg viewBox="0 0 40 40" width="40" height="40" fill="none" style={{ flexShrink: 0 }}>
        {/* Six overlapping circles forming a flower-of-life petal pattern */}
        <circle cx="20" cy="14" r="7" stroke={rosetteFill} strokeWidth="0.6" opacity="0.7" />
        <circle cx="25.2" cy="17" r="7" stroke={rosetteFill} strokeWidth="0.6" opacity="0.7" />
        <circle cx="25.2" cy="23" r="7" stroke={rosetteFill} strokeWidth="0.6" opacity="0.7" />
        <circle cx="20" cy="26" r="7" stroke={rosetteFill} strokeWidth="0.6" opacity="0.7" />
        <circle cx="14.8" cy="23" r="7" stroke={rosetteFill} strokeWidth="0.6" opacity="0.7" />
        <circle cx="14.8" cy="17" r="7" stroke={rosetteFill} strokeWidth="0.6" opacity="0.7" />
        {/* Centre dot */}
        <circle cx="20" cy="20" r="2" fill={rosetteFill} opacity="0.5" />
      </svg>

      {/* Right line */}
      <span style={{
        flex: 1,
        height: '1px',
        background: lineColor,
      }} />
    </div>
  )
}
