/**
 * Convert a string to a URL-friendly slug
 * - Spaces become hyphens
 * - Existing hyphens are preserved
 * - Other symbols become hyphens
 * - Convert to lowercase
 */
export function titleToSlug(title) {
  if (!title) return ''
  
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/[^\w\-]/g, '-')       // other symbols to hyphens
    .replace(/\-+/g, '-')           // multiple hyphens to single hyphen
    .replace(/^\-+|\-+$/g, '')      // remove leading/trailing hyphens
}

/**
 * Find a problem by slug
 */
export async function findProblemBySlug(slug) {
  try {
    const res = await fetch(`/api/counterpools/problems?sort=newest`)
    const data = await res.json()

    if (data.success && data.data) {
      const found = data.data.find(p => titleToSlug(p.problem_title) === slug)
      return found || null
    }
    return null
  } catch (err) {
    console.error('Error fetching problem:', err)
    return null
  }
}
