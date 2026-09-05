import RequireAuth from '../components/RequireAuth.jsx'
import PostComposer from '../components/listening/PostComposer.jsx'
import PostCard from '../components/listening/PostCard.jsx'
import KolamDivider from '../components/design/KolamDivider.jsx'
import { useListeningFeed } from '../hooks/useListening.js'

const GUIDELINES_POINTS = [
  'Speak from your own experience. Use "I" more than "you."',
  'Listen without fixing. Not every story needs advice — sometimes presence is enough.',
  'Respect anonymity. If someone posts anonymously, do not try to identify them.',
  'No judgement, no shaming, no "you should have" language.',
  'If someone is in immediate danger, direct them to a crisis helpline — do not attempt to intervene.',
  'Report content that feels harmful. Moderators review every report.',
]

export default function ListeningFeed() {
  const { posts, loading, createPost, refresh } = useListeningFeed()

  return (
    <RequireAuth>
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <p className="eyebrow">Community</p>
          <h1 style={{ marginTop: '0.5rem' }}>Listening</h1>
          <p className="lede" style={{ marginTop: '0.75rem' }}>
            A space to share experiences and be heard. Not therapy, not counselling
            — human connection. Every voice matters here.
          </p>

          {/* Community guidelines */}
          <details className="listening-guidelines" open>
            <summary>Community guidelines</summary>
            <ul>
              {GUIDELINES_POINTS.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </details>

          <div style={{ margin: '1.5rem 0' }}>
            <KolamDivider />
          </div>

          {/* Composer */}
          <PostComposer onCreate={createPost} />

          <div style={{ margin: '1.5rem 0' }}>
            <KolamDivider />
          </div>

          {/* Feed */}
          {loading ? (
            <p className="lede">Loading stories…</p>
          ) : posts.length === 0 ? (
            <div className="listening-empty">
              <div className="listening-empty-icon" aria-hidden="true">🌿</div>
              <h3>This space is quiet — for now</h3>
              <p>
                Be the first to share. Your story might be exactly what
                someone else needs to hear today.
              </p>
              <button type="button" className="btn btn-ghost" onClick={refresh}>
                Refresh
              </button>
            </div>
          ) : (
            <div className="listening-feed">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </RequireAuth>
  )
}
