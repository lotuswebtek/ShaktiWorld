/**
 * Supportive reactions — no downvote, no dislike.
 * Only positive, affirming responses.
 */

const REACTION_SET = [
  { key: 'heart', emoji: '❤️', label: 'Heart' },
  { key: 'hug', emoji: '🤗', label: 'Hug' },
  { key: 'strength', emoji: '💪', label: 'Strength' },
  { key: 'listen', emoji: '👂', label: 'I hear you' },
  { key: 'pray', emoji: '🙏', label: 'Prayers' },
]

/**
 * @param {{ reactions: Record<string, number>, userReactions: string[], onToggle: (reaction: string) => void }} props
 */
export default function Reactions({ reactions = {}, userReactions = [], onToggle }) {
  return (
    <div className="listening-reactions">
      {REACTION_SET.map((r) => {
        const count = reactions[r.key] || 0
        const active = userReactions.includes(r.key)

        return (
          <button
            key={r.key}
            type="button"
            className={`listening-reaction ${active ? 'listening-reaction-active' : ''}`}
            onClick={() => onToggle(r.key)}
            title={r.label}
            aria-label={`${r.label}${count ? ` (${count})` : ''}`}
            aria-pressed={active}
          >
            <span className="listening-reaction-emoji">{r.emoji}</span>
            {count > 0 && <span className="listening-reaction-count">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
