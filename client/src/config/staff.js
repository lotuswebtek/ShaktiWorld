export function clerkEmails(user) {
  const values = [
    user?.primaryEmailAddress?.emailAddress,
    ...(user?.emailAddresses || []).map((item) => item?.emailAddress),
    ...(user?.externalAccounts || []).map((item) => item?.emailAddress),
  ]
  return [...new Set(values.map((value) => String(value || '').trim().toLowerCase()).filter(Boolean))]
}

export function configuredAdminEmails() {
  const fromEnv = String(import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
  return new Set(['ritzdhanwani@gmail.com', ...fromEnv])
}

export function clerkUserIsStaff(user) {
  const allowed = configuredAdminEmails()
  return clerkEmails(user).some((email) => allowed.has(email))
}
