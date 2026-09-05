import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import RequireAuth from '../components/RequireAuth.jsx'
import KolamDivider from '../components/design/KolamDivider.jsx'

const API = import.meta.env.VITE_API_URL || ''

const CATEGORY_OPTIONS = [
  { value: 'home_cooked_food', label: 'Home-cooked food' },
  { value: 'tailoring', label: 'Tailoring' },
  { value: 'handicrafts', label: 'Handicrafts' },
  { value: 'childcare', label: 'Childcare' },
  { value: 'beauty_services', label: 'Beauty services' },
  { value: 'other', label: 'Other' },
]

function categoryLabel(value) {
  return CATEGORY_OPTIONS.find((item) => item.value === value)?.label || 'Other'
}

function toPhotoUrls(raw) {
  return String(raw)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5)
}

export default function CommunityBusinesses() {
  const { getToken } = useAuth()
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(true)
  const [citiesError, setCitiesError] = useState(null)

  const [mine, setMine] = useState(null)
  const [form, setForm] = useState({
    name: '',
    category: 'home_cooked_food',
    description: '',
    city: '',
    state: '',
    country: 'India',
    serviceArea: '',
    contact: '',
    operatingHours: '',
    photosRaw: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)
  const [saveError, setSaveError] = useState(null)

  const loadCities = async () => {
    setLoadingCities(true)
    setCitiesError(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/community/businesses/cities`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load cities.')
      const data = await res.json()
      setCities(data.cities || [])
    } catch (err) {
      setCitiesError(err.message)
      setCities([])
    } finally {
      setLoadingCities(false)
    }
  }

  const loadMine = async () => {
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/community/businesses/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setMine(data.business || null)
      if (data.business) {
        setForm({
          name: data.business.name || '',
          category: data.business.category || 'home_cooked_food',
          description: data.business.description || '',
          city: data.business.city || '',
          state: data.business.state || '',
          country: data.business.country || 'India',
          serviceArea: data.business.service_area || '',
          contact: data.business.contact || '',
          operatingHours: data.business.operating_hours || '',
          photosRaw: Array.isArray(data.business.photo_urls) ? data.business.photo_urls.join('\n') : '',
        })
      }
    } catch {
      // non-blocking
    }
  }

  useEffect(() => {
    loadCities()
    loadMine()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submitBusiness = async (e) => {
    e.preventDefault()
    setSaveError(null)
    setSaveMessage(null)
    setSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/api/community/businesses/mine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          description: form.description,
          city: form.city,
          state: form.state,
          country: form.country,
          serviceArea: form.serviceArea,
          contact: form.contact,
          operatingHours: form.operatingHours,
          photoUrls: toPhotoUrls(form.photosRaw),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Could not save business.')
      setSaveMessage(mine ? 'Business profile updated.' : 'Business profile created.')
      await loadCities()
      await loadMine()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <RequireAuth>
      <section className="section">
        <div className="container" style={{ maxWidth: 1120 }}>
          <p className="eyebrow">Community · Businesses</p>
          <h1 style={{ marginTop: '0.5rem' }}>City-organised directory</h1>
          <p className="lede" style={{ marginTop: '0.75rem' }}>
            Browse women-run home businesses by city first, then narrow by category.
            This directory helps members discover one another’s food, craft, care, and service work.
          </p>

          <div style={{ margin: '2rem 0' }}>
            <KolamDivider />
          </div>

          <div className="businesses-grid">
            <div className="businesses-panel">
              <h2>Browse by city</h2>
              <p className="support-form-note">
                Start with the city, then filter inside each city directory by category or search term.
              </p>

              {loadingCities && <p className="lede">Loading cities…</p>}
              {citiesError && <p className="form-error">{citiesError}</p>}
              {!loadingCities && cities.length === 0 && (
                <p className="lede">No cities are listed yet.</p>
              )}

              <div className="city-index">
                {cities.map((city) => (
                  <Link
                    key={city.city}
                    to={`/community/businesses/${encodeURIComponent(city.city)}`}
                    className="city-index-card"
                  >
                    <strong>{city.city}</strong>
                    <span>{city.count} {city.count === 1 ? 'business' : 'businesses'}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="businesses-panel">
              <h2>{mine ? 'Edit your business' : 'Add your business'}</h2>
              <p className="support-form-note">
                One business per member for now. Photos should be image URLs, up to five.
              </p>

              <form onSubmit={submitBusiness} className="jobs-form">
                <div className="jobs-form-row">
                  <label>
                    Business name <span className="required">*</span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    Category <span className="required">*</span>
                    <select
                      required
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  Description
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </label>

                <div className="jobs-form-row">
                  <label>
                    City <span className="required">*</span>
                    <input
                      required
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    State
                    <input
                      value={form.state}
                      onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                      autoComplete="off"
                    />
                  </label>
                </div>

                <div className="jobs-form-row">
                  <label>
                    Country
                    <input
                      value={form.country}
                      onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    Service area
                    <input
                      value={form.serviceArea}
                      onChange={(e) => setForm((f) => ({ ...f, serviceArea: e.target.value }))}
                      placeholder="Neighborhoods or delivery area"
                      autoComplete="off"
                    />
                  </label>
                </div>

                <div className="jobs-form-row">
                  <label>
                    Contact <span className="required">*</span>
                    <input
                      required
                      value={form.contact}
                      onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                      placeholder="Phone, email, WhatsApp, or Instagram"
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    Operating hours
                    <input
                      value={form.operatingHours}
                      onChange={(e) => setForm((f) => ({ ...f, operatingHours: e.target.value }))}
                      placeholder="Mon–Sat, 9am–6pm"
                      autoComplete="off"
                    />
                  </label>
                </div>

                <label>
                  Photo URLs (one per line, max 5)
                  <textarea
                    rows={5}
                    value={form.photosRaw}
                    onChange={(e) => setForm((f) => ({ ...f, photosRaw: e.target.value }))}
                    placeholder={'https://...\nhttps://...'}
                  />
                </label>

                {saveError && <p className="form-error">{saveError}</p>}
                {saveMessage && <div className="alert ok">{saveMessage}</div>}

                <button type="submit" className="btn btn-solid" disabled={saving}>
                  {saving ? 'Saving…' : mine ? 'Update business' : 'Create business'}
                </button>
              </form>

              {mine && (
                <p className="businesses-edit-note">
                  Your directory entry is live in <strong>{mine.city}</strong>.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </RequireAuth>
  )
}

export { categoryLabel, CATEGORY_OPTIONS }

