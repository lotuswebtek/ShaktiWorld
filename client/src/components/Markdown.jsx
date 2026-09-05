function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inline(text) {
  let html = escapeHtml(text)
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  return html
}

/**
 * Conservative markdown renderer for in-house articles.
 * No raw HTML. Links must be http(s).
 */
export function Markdown({ source }) {
  if (!source) return null

  const blocks = String(source).replace(/\r\n/g, '\n').split(/\n{2,}/)

  const html = blocks.map((block) => {
    const trimmed = block.trim()
    if (!trimmed) return ''

    if (trimmed.startsWith('### ')) return `<h4>${inline(trimmed.slice(4))}</h4>`
    if (trimmed.startsWith('## ')) return `<h3>${inline(trimmed.slice(3))}</h3>`
    if (trimmed.startsWith('# ')) return `<h2>${inline(trimmed.slice(2))}</h2>`

    const listLines = trimmed.split('\n')
    if (listLines.every((line) => /^[-*]\s+/.test(line))) {
      const items = listLines.map((line) => `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`).join('')
      return `<ul>${items}</ul>`
    }

    return `<p>${inline(trimmed).replace(/\n/g, '<br />')}</p>`
  }).join('')

  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
}
