// Username validation utilities

// Reserved usernames that cannot be claimed
const RESERVED_USERNAMES = [
  'admin', 'administrator', 'mod', 'moderator', 'support', 'help',
  'api', 'www', 'mail', 'ftp', 'localhost', 'dashboard', 'settings',
  'profile', 'profiles', 'user', 'users', 'login', 'logout', 'signup',
  'signin', 'register', 'auth', 'account', 'accounts', 'home', 'index',
  'about', 'contact', 'privacy', 'terms', 'tos', 'blog', 'news',
  'dna', 'antenna', 'matches', 'journal', 'journals', 'collaborators',
  'messages', 'notifications', 'search', 'explore', 'discover',
  'onboarding', 'premium', 'pricing', 'billing', 'payment', 'checkout',
  'null', 'undefined', 'true', 'false', 'root', 'system', 'config', 'openpools.in'
]

/**
 * Validates username format
 * Rules:
 * - 3-30 characters
 * - Lowercase letters, numbers, underscores, hyphens
 * - Must start with letter or number
 * - Must end with letter or number
 * - No consecutive special characters
 */
export function validateUsernameFormat(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' }
  }

  // Convert to lowercase for validation
  const normalized = username.toLowerCase().trim()

  // Check length
  if (normalized.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }
  if (normalized.length > 30) {
    return { valid: false, error: 'Username must be less than 30 characters' }
  }

  // Check format: alphanumeric + underscores/hyphens, start with letter/number
  const formatRegex = /^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$/
  if (!formatRegex.test(normalized)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, underscores, and hyphens. Must start and end with a letter or number.'
    }
  }

  // Check for consecutive special characters
  if (/__|-_|_-|--/.test(normalized)) {
    return { valid: false, error: 'Username cannot have consecutive underscores or hyphens' }
  }

  // Check if reserved
  if (RESERVED_USERNAMES.includes(normalized)) {
    return { valid: false, error: 'This username is reserved and cannot be used' }
  }

  // Check if it starts with reserved prefix
  const reservedPrefixes = ['admin', 'mod', 'support', 'system', 'api']
  for (const prefix of reservedPrefixes) {
    if (normalized.startsWith(prefix)) {
      return { valid: false, error: `Username cannot start with "${prefix}"` }
    }
  }

  return { valid: true, normalized }
}

/**
 * Check if a string is a valid UUID (to differentiate from usernames)
 */
export function isUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Sanitize username input
 */
export function sanitizeUsername(username) {
  if (!username) return ''
  return username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '')
}

/**
 * Generate username suggestions based on full name
 */
export function generateUsernameSuggestions(fullName) {
  if (!fullName) return []

  const suggestions = []
  const normalized = fullName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  const parts = normalized.split(/\s+/)

  if (parts.length === 0) return []

  // First name
  if (parts[0] && parts[0].length >= 3) {
    suggestions.push(parts[0])
  }

  // First name + last initial
  if (parts.length >= 2 && parts[1]) {
    suggestions.push(`${parts[0]}${parts[1][0]}`)
    suggestions.push(`${parts[0]}_${parts[1][0]}`)
  }

  // First initial + last name
  if (parts.length >= 2 && parts[1] && parts[1].length >= 3) {
    suggestions.push(`${parts[0][0]}${parts[1]}`)
    suggestions.push(`${parts[0][0]}_${parts[1]}`)
  }

  // Full name with underscore
  if (parts.length >= 2) {
    const combined = parts.join('_')
    if (combined.length <= 30) {
      suggestions.push(combined)
    }
  }

  // Full name without spaces
  if (parts.length >= 2) {
    const combined = parts.join('')
    if (combined.length <= 30 && combined.length >= 3) {
      suggestions.push(combined)
    }
  }

  // Filter out invalid ones
  return suggestions
    .filter(s => s.length >= 3 && s.length <= 30)
    .filter(s => !RESERVED_USERNAMES.includes(s))
    .slice(0, 5) // Return max 5 suggestions
}

/**
 * Format username for display (with @ symbol)
 */
export function formatUsername(username) {
  return username ? `@${username}` : ''
}
