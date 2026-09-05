import { Link } from 'react-router-dom'

/**
 * Post preview card for the listening feed.
 */
export default function PostCard({ post }) {
  const authorDisplay = post.is_anonymous ? 'A member' : (post.author_name || 'A member')
  const date = new Date(post.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link to={`/listening/${post.id}`} className="listening-card">
      <div className="listening-card-header">
        <span className="listening-card-author">{authorDisplay}</span>
        <span className="listening-card-date">{date}</span>
      </div>
      {post.title && <h3 className="listening-card-title">{post.title}</h3>}
      <p className="listening-card-body">
        {post.body.length > 220 ? `${post.body.slice(0, 220)}…` : post.body}
      </p>
      <div className="listening-card-footer">
        <span>{post.reply_count || 0} {post.reply_count === 1 ? 'reply' : 'replies'}</span>
      </div>
    </Link>
  )
}
