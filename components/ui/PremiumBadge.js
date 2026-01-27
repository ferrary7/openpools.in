'use client'

/**
 * PremiumBadge - Displays a premium indicator for users with premium access
 *
 * @param {Object} props
 * @param {boolean} props.isPremium - Whether the user has premium access
 * @param {string} props.premiumSource - Source of premium (e.g., 'coding_gita', 'paid')
 * @param {string} props.expiresAt - Expiration date of premium access
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} props.showLabel - Whether to show the label text (default: true)
 */
export default function PremiumBadge({
  isPremium,
  premiumSource,
  expiresAt,
  size = 'md',
  showLabel = true
}) {
  if (!isPremium) return null

  // Check if premium has expired
  if (expiresAt && new Date(expiresAt) < new Date()) {
    return null
  }

  const getSourceLabel = () => {
    switch (premiumSource) {
      case 'coding_gita':
        return 'Coding Gita'
      case 'paid':
        return 'Premium'
      case 'promo':
        return 'Premium'
      default:
        return 'Premium'
    }
  }

  const getSourceColor = () => {
    switch (premiumSource) {
      case 'coding_gita':
        return 'from-amber-400 to-orange-500'
      case 'paid':
        return 'from-purple-400 to-pink-500'
      default:
        return 'from-amber-400 to-yellow-500'
    }
  }

  const sizeClasses = {
    sm: {
      badge: 'px-2 py-0.5 text-xs gap-1',
      icon: 'w-3 h-3'
    },
    md: {
      badge: 'px-2.5 py-1 text-xs gap-1.5',
      icon: 'w-3.5 h-3.5'
    },
    lg: {
      badge: 'px-3 py-1.5 text-sm gap-2',
      icon: 'w-4 h-4'
    }
  }

  const classes = sizeClasses[size] || sizeClasses.md

  // Format date consistently to avoid hydration mismatch
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  return (
    <span
      className={`inline-flex items-center ${classes.badge} bg-gradient-to-r ${getSourceColor()} text-white font-semibold rounded-full shadow-sm`}
      title={expiresAt ? `Premium until ${formatDate(expiresAt)}` : 'Premium member'}
    >
      {/* Crown/Star Icon */}
      <svg
        className={classes.icon}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {showLabel && <span>{getSourceLabel()}</span>}
    </span>
  )
}
