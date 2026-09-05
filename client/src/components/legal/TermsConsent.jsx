import { Link } from 'react-router-dom'
import { CURRENT_LEGAL } from '../../data/legal.js'

export function TermsConsent({ checked, onChange, id = 'accept-legal' }) {
  return (
    <label className="legal-consent" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
      />
      <span>
        I have read and agree to the{' '}
        <Link to="/terms" target="_blank" rel="noreferrer">
          Terms of Use
        </Link>
        ,{' '}
        <Link to="/privacy" target="_blank" rel="noreferrer">
          Privacy Policy
        </Link>
        , and{' '}
        <Link to="/community-guidelines" target="_blank" rel="noreferrer">
          Community Guidelines
        </Link>
        . Version {CURRENT_LEGAL.terms}.
      </span>
    </label>
  )
}
