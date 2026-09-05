import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import RequireAuth from '../components/RequireAuth.jsx'

const API = import.meta.env.VITE_API_URL || ''

export default function MemberProfile() {
  const { userId } = useParams()
  const { getToken } = useAuth()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = await getToken()
        const res = await fetch(`${API}/api/community/businesses/members/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || 'Failed to load member profile.')
        setMember(data.member)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getToken, userId])

  return (
    <RequireAuth>
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <Link to="/community/businesses" className="mod-back-link">← Back to directory</Link>

          {loading && <p className="lede">Loading member profile…</p>}
          {error && <p className="form-error">{error}</p>}

          {member && (
            <div className="member-profile-card">
              <div className="member-profile-top">
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.full_name || 'Member'} className="member-profile-photo" />
                ) : (
                  <div className="member-profile-photo member-profile-photo-empty">Member</div>
                )}
                <div>
                  <p className="eyebrow">Member profile</p>
                  <h1 style={{ marginTop: '0.5rem' }}>{member.full_name || 'Member'}</h1>
                  <p className="jobs-card-meta" style={{ marginTop: '0.5rem' }}>
                    {[member.city, member.state, member.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>

              {member.bio && (
                <div className="member-profile-bio">
                  <p>{member.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </RequireAuth>
  )
}

