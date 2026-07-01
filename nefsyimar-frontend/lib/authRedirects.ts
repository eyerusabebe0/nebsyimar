export function getSafeRedirectPath(redirectPath?: string | null, fallback = '/dashboard') {
  if (typeof redirectPath !== 'string') return fallback
  const trimmed = redirectPath.trim()
  if (!trimmed) return fallback
  if (!trimmed.startsWith('/')) return fallback
  if (trimmed.startsWith('//')) return fallback
  return trimmed
}
