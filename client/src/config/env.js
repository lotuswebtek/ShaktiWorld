export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''

export const API = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
