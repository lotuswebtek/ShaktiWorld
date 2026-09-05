import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import RequireAuth from '../components/RequireAuth.jsx'
import Reactions from '../components/listening/Reactions.jsx'
import ReportButton from '../components/listening/ReportButton.jsx'
import SafeForm from '../components/safety/SafeForm.jsx'
import { useListeningPost } from '../hooks/useListening.js'

export default function ListeningPost() {
  const { postId } = useParams()
  const { post, replies, loading, addReply, toggleReaction, report } = useListeningPost(postId)

  const [replyBody, setReplyBody] = useState('')
  const [replyAnon, setReplyAnon] = useState(false)
  const [replying, setReplying] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyBody.trim()) return
    setReplying(true)
    try {
      await addReply({ body: replyBody, isAnonymous: replyAnon })
      setReplyBody('')
      setReplyAnon(false)
      setShowReplyForm(false)
    } catch {
      // handled via UI state
    } finally {
      setReplying(false)
    }
  }

  if (loading) {
    return (
      <RequireAuth>
        <section className="section">
          <div className="container" style={{ maxWidth: 720 }}>
            <p className="lede">Loading…</p>
          </div>
        </section>
      </RequireAuth>
    )
  }

  if (!post) {
    return (
      <RequireAuth>
        <section className="section">
          <div className="container" style={{ maxWidth: 720 }}>
            <p className="form-error">Post not found.</p>
            <Link to="/listening" className="btn btn-ghost" style={{ marginTop: '1rem' }}>
              ← Back to feed
            </Link>
          </div>
        </section>
      </RequireAuth>
    )
  }

  const authorDisplay = post.is_anonymous ? 'A member' : (post.author_name || 'A member')
  const date = new Date(post.created_at).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <RequireAuth>
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <Link to="/listening" className="mod-back-link">← Back to feed</Link>

          {/* Post */}
          <article className="listening-post-full">
            <div className="listening-post-header">
              <span className="listening-card-author">{authorDisplay}</span>
              <span className="listening-card-date">{date}</span>
            </div>
            {post.title && <h1 style={{ marginTop: '0.5rem' }}>{post.title}</h1>}
            <div className="listening-post-body">
              {post.body.split('\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="listening-post-actions">
              <Reactions
                reactions={post.reactions}
                userReactions={post.userReactions}
                onToggle={(r) => toggleReaction('post', post.id, r)}
              />
              <ReportButton targetType="post" targetId={post.id} onReport={report} />
            </div>
          </article>

          {/* Replies */}
          <div className="listening-replies-section">
            <h3>
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </h3>

            {replies.map((reply) => {
              const rAuthor = reply.is_anonymous ? 'A member' : (reply.author_name || 'A member')
              const rDate = new Date(reply.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })

              return (
                <div key={reply.id} className="listening-reply">
                  <div className="listening-reply-header">
                    <span className="listening-card-author">{rAuthor}</span>
                    <span className="listening-card-date">{rDate}</span>
                  </div>
                  <p className="listening-reply-body">{reply.body}</p>
                  <div className="listening-post-actions">
                    <Reactions
                      reactions={reply.reactions}
                      userReactions={reply.userReactions}
                      onToggle={(r) => toggleReaction('reply', reply.id, r)}
                    />
                    <ReportButton targetType="reply" targetId={reply.id} onReport={report} />
                  </div>
                </div>
              )
            })}

            {/* Reply form */}
            {!showReplyForm ? (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ marginTop: '1rem' }}
                onClick={() => setShowReplyForm(true)}
              >
                Write a reply
              </button>
            ) : (
              <SafeForm onSubmit={handleReply} className="listening-reply-form">
                <textarea
                  rows={3}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="Respond with care…"
                />
                <div className="listening-reply-form-row">
                  <label className="check" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={replyAnon}
                      onChange={(e) => setReplyAnon(e.target.checked)}
                    />
                    Reply anonymously
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-solid" disabled={replying || !replyBody.trim()}>
                      {replying ? 'Sending…' : 'Reply'}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowReplyForm(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </SafeForm>
            )}
          </div>
        </div>
      </section>
    </RequireAuth>
  )
}
