import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/react'
import RequireAuth from '../components/RequireAuth.jsx'
import Disclaimer from '../components/safety/Disclaimer.jsx'
import KolamDivider from '../components/design/KolamDivider.jsx'

import { API } from '../config/env.js'

const WORK_MODE_OPTIONS = [
  { value: 'either', label: 'Remote or onsite' },
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'Onsite' },
]

const CONTACT_METHOD_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'other', label: 'Other' },
]

function toTags(raw) {
  return String(raw)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 25)
}

function defaultExpiryDate() {
  // Today + 60 days (ISO YYYY-MM-DD) in UTC.
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + 60)
  return d.toISOString().slice(0, 10)
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export default function CommunityJobs() {
  const { getToken } = useAuth()

  const [filters, setFilters] = useState({
    city: '',
    skill: '',
    workMode: 'either',
  })

  // Opportunities
  const [oppList, setOppList] = useState([])
  const [oppLoading, setOppLoading] = useState(true)
  const [oppError, setOppError] = useState(null)

  // Seeker profiles
  const [seekList, setSeekList] = useState([])
  const [seekLoading, setSeekLoading] = useState(true)
  const [seekError, setSeekError] = useState(null)

  // Contact reveal
  const [contactReveal, setContactReveal] = useState(null) // { type, payload }
  const [revealError, setRevealError] = useState(null)
  const [revealBusy, setRevealBusy] = useState(false)

  const queryParams = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.city.trim()) params.set('city', filters.city.trim())
    if (filters.skill.trim()) params.set('skill', filters.skill.trim())
    if (filters.workMode && filters.workMode !== 'either') params.set('workMode', filters.workMode)
    return params.toString()
  }, [filters.city, filters.skill, filters.workMode])

  const refreshOpp = async () => {
    setOppLoading(true)
    setOppError(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/community/jobs/opportunities?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load opportunities.')
      const data = await res.json()
      setOppList(data.opportunities || [])
    } catch (e) {
      setOppError(e.message)
      setOppList([])
    } finally {
      setOppLoading(false)
    }
  }

  const refreshSeekers = async () => {
    setSeekLoading(true)
    setSeekError(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/community/jobs/seekers?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load seeker profiles.')
      const data = await res.json()
      setSeekList(data.seekers || [])
    } catch (e) {
      setSeekError(e.message)
      setSeekList([])
    } finally {
      setSeekLoading(false)
    }
  }

  useEffect(() => {
    refreshOpp()
    refreshSeekers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams])

  // Forms: opportunity
  const [oppForm, setOppForm] = useState({
    title: '',
    description: '',
    location: '',
    workMode: 'onsite',
    salaryRange: '',
    contactMethod: 'email',
    contactValue: '',
    expiryDate: defaultExpiryDate(),
  })
  const [oppSubmitting, setOppSubmitting] = useState(false)
  const [oppMessage, setOppMessage] = useState(null)
  const [oppErrorForm, setOppErrorForm] = useState(null)

  const submitOpportunity = async (e) => {
    e.preventDefault()
    setOppMessage(null)
    setOppErrorForm(null)
    setOppSubmitting(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/community/jobs/opportunities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: oppForm.title,
          description: oppForm.description,
          location: oppForm.location,
          workMode: oppForm.workMode,
          salaryRange: oppForm.salaryRange, // required
          contactMethod: oppForm.contactMethod,
          contactValue: oppForm.contactValue,
          expiryDate: oppForm.expiryDate,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Submission failed.')
      setOppMessage('Opportunity submitted for the member noticeboard.')
      setOppForm((f) => ({ ...f, title: '', description: '', salaryRange: '', contactValue: '' }))
      await refreshOpp()
    } catch (err) {
      setOppErrorForm(err.message)
    } finally {
      setOppSubmitting(false)
    }
  }

  // Forms: seeker
  const [seekForm, setSeekForm] = useState({
    skillsRaw: '',
    experienceSummary: '',
    availability: '',
    preferredLocation: '',
    preferredWorkMode: 'either',
    wantsDirectContact: true,
  })
  const [seekSubmitting, setSeekSubmitting] = useState(false)
  const [seekMessage, setSeekMessage] = useState(null)
  const [seekErrorForm, setSeekErrorForm] = useState(null)

  const submitSeeker = async (e) => {
    e.preventDefault()
    setSeekMessage(null)
    setSeekErrorForm(null)
    setSeekSubmitting(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/community/jobs/seekers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skills: toTags(seekForm.skillsRaw),
          experienceSummary: seekForm.experienceSummary,
          availability: seekForm.availability,
          preferredLocation: seekForm.preferredLocation,
          preferredWorkMode: seekForm.preferredWorkMode,
          wantsDirectContact: seekForm.wantsDirectContact,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Submission failed.')
      setSeekMessage('Your skills profile is saved on the member noticeboard.')
      await refreshSeekers()
    } catch (err) {
      setSeekErrorForm(err.message)
    } finally {
      setSeekSubmitting(false)
    }
  }

  const revealContact = async (type, id) => {
    setRevealBusy(true)
    setRevealError(null)
    setContactReveal(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/community/jobs/contact/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetType: type, targetId: id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Could not reveal contact.')
      setContactReveal({ type, payload: data.contact })
    } catch (err) {
      setRevealError(err.message)
    } finally {
      setRevealBusy(false)
    }
  }

  return (
    <RequireAuth>
      <section className="section">
        <div className="container" style={{ maxWidth: 1120 }}>
          <p className="eyebrow">Community · Jobs</p>
          <h1 style={{ marginTop: '0.5rem' }}>Member-to-member noticeboard</h1>
          <p className="lede" style={{ marginTop: '0.75rem', marginBottom: '1.5rem' }}>
            Post opportunities and share skills so verified members can connect with one another.
            We do not vet employers and we do not place candidates — each opportunity is an information
            notice for the community.
          </p>

          <div style={{ margin: '2rem 0' }}>
            <KolamDivider />
          </div>

          {/* Shared filters */}
          <div className="jobs-filters">
            <div className="jobs-filter">
              <label>
                City
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                  placeholder="e.g., Houston"
                  autoComplete="off"
                />
              </label>
            </div>
            <div className="jobs-filter">
              <label>
                Skill keyword
                <input
                  type="text"
                  value={filters.skill}
                  onChange={(e) => setFilters((f) => ({ ...f, skill: e.target.value }))}
                  placeholder="e.g., content, design"
                  autoComplete="off"
                />
              </label>
            </div>
            <div className="jobs-filter">
              <label>
                Remote / onsite
                <select
                  value={filters.workMode}
                  onChange={(e) => setFilters((f) => ({ ...f, workMode: e.target.value }))}
                >
                  {WORK_MODE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Two columns */}
          <div className="jobs-grid">
            {/* Opportunity posting */}
            <div className="jobs-panel">
              <h2>Posting opportunities</h2>
              <Disclaimer variant="employment" />

              <form onSubmit={submitOpportunity} className="jobs-form">
                <div className="jobs-form-row">
                  <label>
                    Title <span className="required">*</span>
                    <input required value={oppForm.title} onChange={(e) => setOppForm((f) => ({ ...f, title: e.target.value }))} />
                  </label>
                </div>

                <label>
                  Description <span className="required">*</span>
                  <textarea required rows={5} value={oppForm.description} onChange={(e) => setOppForm((f) => ({ ...f, description: e.target.value }))} />
                </label>

                <div className="jobs-form-row">
                  <label>
                    Location / City <span className="required">*</span>
                    <input required value={oppForm.location} onChange={(e) => setOppForm((f) => ({ ...f, location: e.target.value }))} />
                  </label>

                  <label>
                    Remote / onsite <span className="required">*</span>
                    <select required value={oppForm.workMode} onChange={(e) => setOppForm((f) => ({ ...f, workMode: e.target.value }))}>
                      {VALID_WORK_MODE_UI}
                    </select>
                  </label>
                </div>

                <div className="jobs-form-row">
                  <label>
                    Compensation range <span className="required">*</span>
                    <input
                      required
                      value={oppForm.salaryRange}
                      onChange={(e) => setOppForm((f) => ({ ...f, salaryRange: e.target.value }))}
                      placeholder="e.g., $60k–$80k"
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    Expiry date <span className="required">*</span>
                    <input
                      type="date"
                      required
                      value={oppForm.expiryDate}
                      onChange={(e) => setOppForm((f) => ({ ...f, expiryDate: e.target.value }))}
                    />
                    <small style={{ display: 'block', color: 'var(--muted)', marginTop: '0.35rem' }}>
                      Posts expire automatically after 60 days.
                    </small>
                  </label>
                </div>

                <div className="jobs-form-row">
                  <label>
                    Contact method <span className="required">*</span>
                    <select
                      required
                      value={oppForm.contactMethod}
                      onChange={(e) => setOppForm((f) => ({ ...f, contactMethod: e.target.value }))}
                    >
                      {CONTACT_METHOD_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Contact value <span className="required">*</span>
                    <input
                      required
                      value={oppForm.contactValue}
                      onChange={(e) => setOppForm((f) => ({ ...f, contactValue: e.target.value }))}
                      placeholder={oppForm.contactMethod === 'email' ? 'name@example.com' : 'Your contact'}
                      autoComplete="off"
                    />
                  </label>
                </div>

                {oppErrorForm && <p className="form-error">{oppErrorForm}</p>}
                {oppMessage && <div className="alert ok">{oppMessage}</div>}

                <button type="submit" className="btn btn-solid" disabled={oppSubmitting}>
                  {oppSubmitting ? 'Submitting…' : 'Post opportunity'}
                </button>
              </form>

              <div className="jobs-divider" />
              <h3>Opportunities</h3>
              {oppLoading && <p className="lede">Loading…</p>}
              {oppError && <p className="form-error">{oppError}</p>}
              {!oppLoading && oppList.length === 0 && <p className="lede">No matches for your filters.</p>}

              <div className="jobs-list">
                {oppList.map((o) => (
                  <div key={o.id} className="jobs-card">
                    <div className="jobs-card-header">
                      <strong>{o.title}</strong>
                      <span className="jobs-card-meta">{o.work_mode} · Expires {formatDate(o.expires_at)}</span>
                    </div>
                    <p className="jobs-card-text">{o.description}</p>
                    <div className="jobs-card-tags">
                      <span className="jobs-tag">{o.location}</span>
                      <span className="jobs-tag">Comp: {o.salary_range}</span>
                    </div>
                    <div className="jobs-card-actions">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={revealBusy}
                        onClick={() => revealContact('opportunity', o.id)}
                      >
                        Reveal contact ({o.contact_method})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seeker */}
            <div className="jobs-panel">
              <h2>Looking for work</h2>
              <Disclaimer variant="employment" />

              <form onSubmit={submitSeeker} className="jobs-form">
                <label>
                  Skills (comma-separated) <span className="required">*</span>
                  <input
                    required
                    value={seekForm.skillsRaw}
                    onChange={(e) => setSeekForm((f) => ({ ...f, skillsRaw: e.target.value }))}
                    placeholder="e.g., content writing, design, operations"
                    autoComplete="off"
                  />
                </label>

                <label>
                  Experience summary
                  <textarea
                    rows={4}
                    value={seekForm.experienceSummary}
                    onChange={(e) => setSeekForm((f) => ({ ...f, experienceSummary: e.target.value }))}
                    placeholder="A short summary of your experience…"
                    autoComplete="off"
                  />
                </label>

                <div className="jobs-form-row">
                  <label>
                    Availability
                    <input
                      value={seekForm.availability}
                      onChange={(e) => setSeekForm((f) => ({ ...f, availability: e.target.value }))}
                      placeholder="e.g., available from October"
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    Preferred work mode
                    <select
                      value={seekForm.preferredWorkMode}
                      onChange={(e) => setSeekForm((f) => ({ ...f, preferredWorkMode: e.target.value }))}
                    >
                      <option value="either">Either</option>
                      <option value="remote">Remote</option>
                      <option value="onsite">Onsite</option>
                    </select>
                  </label>
                </div>

                <label>
                  Preferred location <span className="required">*</span>
                  <input
                    required
                    value={seekForm.preferredLocation}
                    onChange={(e) => setSeekForm((f) => ({ ...f, preferredLocation: e.target.value }))}
                    autoComplete="off"
                  />
                </label>

                <label className="check" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={seekForm.wantsDirectContact}
                    onChange={(e) => setSeekForm((f) => ({ ...f, wantsDirectContact: e.target.checked }))}
                  />
                  I want to share direct contact details with other verified members
                </label>

                {seekErrorForm && <p className="form-error">{seekErrorForm}</p>}
                {seekMessage && <div className="alert ok">{seekMessage}</div>}

                <button type="submit" className="btn btn-solid" disabled={seekSubmitting}>
                  {seekSubmitting ? 'Saving…' : 'Save skills profile'}
                </button>
              </form>

              <div className="jobs-divider" />
              <h3>Member profiles</h3>
              {seekLoading && <p className="lede">Loading…</p>}
              {seekError && <p className="form-error">{seekError}</p>}
              {!seekLoading && seekList.length === 0 && <p className="lede">No matches for your filters.</p>}

              <div className="jobs-list">
                {seekList.map((s) => (
                  <div key={s.id} className="jobs-card">
                    <div className="jobs-card-header">
                      <strong>{s.member_name || 'Member'}</strong>
                      <span className="jobs-card-meta">
                        {s.preferred_work_mode} · {s.preferred_location}
                      </span>
                    </div>

                    <div className="jobs-card-tags">
                      {(s.skills || []).slice(0, 6).map((tag, i) => (
                        <span key={`${tag}-${i}`} className="jobs-tag">{tag}</span>
                      ))}
                    </div>

                    {s.experience_summary && (
                      <p className="jobs-card-text">{s.experience_summary}</p>
                    )}
                    {s.availability && (
                      <p className="jobs-card-note">
                        Availability: {s.availability}
                      </p>
                    )}

                    <div className="jobs-card-actions">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={revealBusy || !s.wants_direct_contact}
                        onClick={() => revealContact('seeker', s.id)}
                      >
                        {s.wants_direct_contact ? 'Reveal contact' : 'Direct contact not shared'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact reveal panel */}
          {contactReveal && (
            <div className="jobs-contact-panel" role="dialog" aria-modal="true">
              <div className="jobs-contact-panel-inner">
                <h3>Contact details</h3>
                {revealError && <p className="form-error">{revealError}</p>}

                {contactReveal.payload.contact_method && (
                  <p style={{ color: 'var(--muted)' }}>
                    Method: {contactReveal.payload.contact_method}
                  </p>
                )}

                {'contact_value' in contactReveal.payload && (
                  <p className="jobs-contact-value">{contactReveal.payload.contact_value}</p>
                )}

                {('email' in contactReveal.payload || 'phone' in contactReveal.payload || 'whatsapp' in contactReveal.payload) && (
                  <div className="jobs-contact-fields">
                    {contactReveal.payload.email && (
                      <p><strong>Email:</strong> {contactReveal.payload.email}</p>
                    )}
                    {contactReveal.payload.phone && (
                      <p><strong>Phone:</strong> {contactReveal.payload.phone}</p>
                    )}
                    {contactReveal.payload.whatsapp && (
                      <p><strong>WhatsApp:</strong> {contactReveal.payload.whatsapp}</p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setContactReveal(null)}
                  style={{ marginTop: '1rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {revealError && !contactReveal && (
            <p className="form-error" style={{ marginTop: '1rem' }}>{revealError}</p>
          )}
        </div>
      </section>
    </RequireAuth>
  )
}

// UI helper for remote/onsite select.
const VALID_WORK_MODE_UI = (
  <>
    <option value="remote">Remote</option>
    <option value="onsite">Onsite</option>
  </>
)

