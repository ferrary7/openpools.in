import { normalizeKeyword, getCommonKeywords } from './keywords'

/**
 * Calculate weighted compatibility score between two keyword profiles
 */
export function calculateCompatibility(profile1Keywords, profile2Keywords) {
  if (!profile1Keywords?.length || !profile2Keywords?.length) {
    return {
      score: 0,
      commonKeywords: [],
      totalKeywords: 0
    }
  }

  // Create maps for quick lookup with weights
  const profile1Map = new Map()
  const profile2Map = new Map()

  profile1Keywords.forEach(kw => {
    const keyword = typeof kw === 'string' ? kw : kw.keyword
    const weight = typeof kw === 'object' ? kw.weight : 1.0
    profile1Map.set(normalizeKeyword(keyword), weight)
  })

  profile2Keywords.forEach(kw => {
    const keyword = typeof kw === 'string' ? kw : kw.keyword
    const weight = typeof kw === 'object' ? kw.weight : 1.0
    profile2Map.set(normalizeKeyword(keyword), weight)
  })

  // Find common keywords and calculate weighted score
  const commonKeywords = []
  let weightedIntersection = 0
  let totalWeight1 = 0
  let totalWeight2 = 0

  // Calculate total weights
  profile1Map.forEach(weight => {
    totalWeight1 += weight
  })

  profile2Map.forEach(weight => {
    totalWeight2 += weight
  })

  // Find matches and calculate weighted intersection
  profile1Map.forEach((weight1, keyword) => {
    if (profile2Map.has(keyword)) {
      const weight2 = profile2Map.get(keyword)
      const avgWeight = (weight1 + weight2) / 2
      weightedIntersection += avgWeight
      commonKeywords.push({
        keyword,
        weight: avgWeight
      })
    }
  })

  // Calculate compatibility score
  // Using weighted Jaccard similarity
  const weightedUnion = totalWeight1 + totalWeight2 - weightedIntersection
  const score = weightedUnion > 0 ? (weightedIntersection / weightedUnion) * 100 : 0

  return {
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    commonKeywords: commonKeywords.sort((a, b) => b.weight - a.weight),
    totalCommon: commonKeywords.length
  }
}

/**
 * Find top matches for a user from a pool of candidates
 */
export function findTopMatches(userKeywords, candidateProfiles, limit = 10) {
  const matches = candidateProfiles.map(candidate => {
    const compatibility = calculateCompatibility(userKeywords, candidate.keywords)
    return {
      ...candidate,
      compatibility: compatibility.score,
      commonKeywords: compatibility.commonKeywords,
      totalCommon: compatibility.totalCommon
    }
  })

  // Sort by compatibility score (descending) and return top matches
  return matches
    .filter(match => match.compatibility > 0)
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, limit)
}

/**
 * Calculate match quality categories
 */
export function getMatchQuality(score) {
  if (score >= 70) return { label: 'Excellent Match', color: 'green' }
  if (score >= 50) return { label: 'Great Match', color: 'blue' }
  if (score >= 30) return { label: 'Good Match', color: 'yellow' }
  if (score >= 15) return { label: 'Moderate Match', color: 'orange' }
  return { label: 'Low Match', color: 'gray' }
}
