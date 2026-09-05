import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import KolamDivider from '../components/design/KolamDivider.jsx'

const API = import.meta.env.VITE_API_URL || ''

const TYPE_LABELS = {
  article: 'Article',
  video: 'Video',
  guide: 'Guide',
  downloadable: 'Downloadable',
}

export default function CommunityResources() {
  const [groups, setGroups] = useState({})
  const [topics, setTopics] = useState([])
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const qs = useMemo(() => {
    const params = new URLSearchParams()
    if (topic) params.set('topic', topic)
    return params.toString()
  }, [topic])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API}/api/resources${qs ? `?${qs}` : ''}`)
        if (!res.ok) throw new Error('Failed to load resources.')
        const data = await res.json()
        setGroups(data.groups || {})
        setTopics(data.topics || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [qs])

  const topicKeys = Object.keys(groups)

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 980 }}>
        <p className="eyebrow">Community · Resources</p>
        <h1 style={{ marginTop: '0.5rem' }}>Learning library</h1>
        <p className="lede" style={{ marginTop: '0.75rem' }}>
          Articles, videos, guides, and downloadable materials organised by topic.
          In-house writing and third-party links are labelled so you can tell them apart.
        </p>

        <div style={{ margin: '2rem 0 1.5rem' }}>
          <KolamDivider />
        </div>

        <div className="resource-filters">
          <label>
            Topic
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="">All topics</option>
              {topics.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>

        {loading && <p className="lede">Loading resources…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && topicKeys.length === 0 && (
          <p className="lede">No resources are published yet.</p>
        )}

        {topicKeys.map((name) => (
          <section key={name} className="resource-topic-group">
            <h2>{name}</h2>
            <div className="resource-cards">
              {groups[name].map((item) => (
                <Link key={item.id} to={`/community/resources/${item.id}`} className="resource-library-card">
                  <div className="resource-card-badges">
                    <span className="resource-type">{TYPE_LABELS[item.resource_type] || item.resource_type}</span>
                    <span className={`resource-source resource-source-${item.source}`}>
                      {item.source === 'in_house' ? 'In-house' : 'Third-party'}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}
                  <div className="resource-card-meta">
                    {item.reading_time_minutes && <span>{item.reading_time_minutes} min</span>}
                    {(item.tags || []).slice(0, 4).map((tag) => (
                      <span key={tag} className="jobs-tag">{tag}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
