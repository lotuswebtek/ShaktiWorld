import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Local default; on Railway set ID_STORAGE_DIR to a mounted volume path. */
const DEFAULT_DIR = path.join(__dirname, 'data', 'id-documents')

const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

function storageRoot() {
  return process.env.ID_STORAGE_DIR || DEFAULT_DIR
}

function assertSafeKey(storageKey) {
  if (
    typeof storageKey !== 'string' ||
    !storageKey.startsWith('verifications/') ||
    storageKey.includes('..') ||
    path.isAbsolute(storageKey)
  ) {
    throw new Error('Invalid storage key.')
  }
}

/**
 * Write an ID document to private disk storage.
 * Returns the storage key (relative path). Never a public URL.
 */
export async function uploadIdDocument(userId, _fileName, buffer, mimeType) {
  const ext = EXT_BY_MIME[mimeType]
  if (!ext) {
    throw new Error('Unsupported file type.')
  }

  const key = `verifications/${userId}/${Date.now()}.${ext}`
  const dest = path.join(storageRoot(), key)
  await fs.mkdir(path.dirname(dest), { recursive: true })
  await fs.writeFile(dest, buffer)
  return key
}

/**
 * Read a stored ID file for authenticated staff review.
 * Callers must check staff auth before using this.
 */
export async function readIdDocument(storageKey) {
  assertSafeKey(storageKey)
  return fs.readFile(path.join(storageRoot(), storageKey))
}

export function mimeFromStorageKey(storageKey) {
  const ext = storageKey.split('.').pop()?.toLowerCase()
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'pdf') return 'application/pdf'
  return 'application/octet-stream'
}

export async function deleteIdDocument(storageKey) {
  assertSafeKey(storageKey)
  await fs.unlink(path.join(storageRoot(), storageKey)).catch(() => {})
}
