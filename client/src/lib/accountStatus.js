export function isStaff(status) {
  return status?.role === 'admin' || status?.role === 'moderator'
}

export function isVerifiedMember(status) {
  return status?.step === 'complete' && status?.accountStatus === 'verified'
}

export function memberHomePath(status) {
  return isStaff(status) ? '/moderation/verifications' : '/career'
}

export function canAccessMembers(status) {
  return isStaff(status) || isVerifiedMember(status)
}
