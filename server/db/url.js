function readDatabaseUrl() {
  let raw = String(process.env.DATABASE_URL || '').trim()
  raw = raw.replace(/^DATABASE_URL\s*=\s*/i, '')
  raw = raw.split(/\r?\n/)[0].trim()
  raw = raw.replace(/^['"]|['"]$/g, '')
  const embedded = raw.match(/postgres(?:ql)?:\/\/\S+/i)
  if (embedded) {
    raw = embedded[0].replace(/[),;]+$/, '')
  }
  return raw
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

export function databaseHost() {
  const connectionString = readDatabaseUrl()
  if (!connectionString) return null
  try {
    return new URL(connectionString.replace(/^postgres:\/\//, 'postgresql://')).hostname || null
  } catch {
    const host = libpqParams(connectionString).host
    return host || null
  }
}

export { readDatabaseUrl, libpqParams }
