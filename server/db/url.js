function sanitize(raw) {
  let value = String(raw || '').trim()
  value = value.replace(/^DATABASE_(?:PUBLIC_)?URL\s*[:=]\s*/i, '')
  value = value.split(/\r?\n/)[0].trim()
  value = value.replace(/^['"]|['"]$/g, '')
  const embedded = value.match(/postgres(?:ql)?:\/\/\S+/i)
  if (embedded) {
    value = embedded[0].replace(/[),;]+$/, '')
  }
  return value
}

function libpqParams(raw) {
  const params = {}
  for (const part of raw.split(/\s+/)) {
    const eq = part.indexOf('=')
    if (eq < 1) continue
    params[part.slice(0, eq).toLowerCase()] = part.slice(eq + 1)
  }
  return params
}

function hostFrom(raw) {
  if (!raw) return null
  try {
    return new URL(raw.replace(/^postgres:\/\//, 'postgresql://')).hostname || null
  } catch {
    return libpqParams(raw).host || null
  }
}

export function isUsableDatabaseHost(host) {
  if (!host) return false
  const value = host.toLowerCase()
  if (value === 'base' || value === 'localhost' || value === '127.0.0.1') return false
  if (value.endsWith('.railway.internal')) return false
  return true
}

function candidates() {
  return [process.env.DATABASE_URL, process.env.DATABASE_PUBLIC_URL].filter(Boolean).map(sanitize)
}

export function readDatabaseUrl() {
  const list = candidates()
  for (const raw of list) {
    if (isUsableDatabaseHost(hostFrom(raw))) return raw
  }
  return list[0] || ''
}

export function databaseHost() {
  return hostFrom(readDatabaseUrl())
}

export { libpqParams }
