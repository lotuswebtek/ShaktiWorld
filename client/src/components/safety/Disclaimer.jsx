const VARIANTS = {
  medical: {
    title: 'Not medical advice',
    body: 'Shaktiworld does not provide medical diagnoses, treatment plans, or clinical services. The health and wellbeing resources shared here are for informational purposes only. Always consult a qualified healthcare professional for medical concerns.',
    resources: [
      { label: 'Find a doctor near you', url: 'https://www.who.int/' },
    ],
  },
  legal: {
    title: 'Not legal counsel',
    body: 'Shaktiworld does not offer legal advice or representation. Information about domestic violence laws, dowry protections, and rights awareness is shared for educational purposes. For legal guidance, please consult a licensed attorney or legal aid organization in your area.',
    resources: [
      { label: 'Legal Aid Society', url: 'https://www.legalaid.org/' },
    ],
  },
  crisis: {
    title: 'Not a crisis service',
    body: 'Shaktiworld is a community platform — not an emergency response service. If you or someone you know is in immediate danger, please contact local emergency services or a crisis helpline right away.',
    resources: [
      { label: 'Emergency: call 112 (India) or 911 (US)', url: null },
    ],
  },
  employment: {
    title: 'Not an employment agency',
    body: 'Shaktiworld shares job listings and career resources contributed by our community. We do not act as recruiters, guarantee job placement, or match candidates to employers. Opportunities are informational — research each listing independently.',
    resources: [],
  },
}

/**
 * Reusable disclaimer block.
 * @param {{ variant: 'medical' | 'legal' | 'crisis' | 'employment' }} props
 */
export default function Disclaimer({ variant }) {
  const data = VARIANTS[variant]
  if (!data) return null

  return (
    <aside className="disclaimer" role="note" aria-label={data.title}>
      <div className="disclaimer-icon" aria-hidden="true">ℹ</div>
      <div>
        <strong className="disclaimer-title">{data.title}</strong>
        <p className="disclaimer-body">{data.body}</p>
        {data.resources.length > 0 && (
          <ul className="disclaimer-links">
            {data.resources.map((r, i) =>
              r.url ? (
                <li key={i}>
                  <a href={r.url} target="_blank" rel="noreferrer">{r.label} ↗</a>
                </li>
              ) : (
                <li key={i}>{r.label}</li>
              ),
            )}
          </ul>
        )}
      </div>
    </aside>
  )
}
