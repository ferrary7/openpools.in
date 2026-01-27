import { normalizeKeyword, getCommonKeywords } from './keywords'

/**
 * Calculate common keyword match score (0-100)
 */
function calculateKeywordMatchScore(profile1Keywords, profile2Keywords) {
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

  // Find common keywords and calculate weighted score using Cosine Similarity
  const commonKeywords = []
  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0

  // Calculate magnitudes
  profile1Map.forEach(weight => {
    magnitude1 += weight * weight
  })

  profile2Map.forEach(weight => {
    magnitude2 += weight * weight
  })

  magnitude1 = Math.sqrt(magnitude1)
  magnitude2 = Math.sqrt(magnitude2)

  // Calculate dot product and collect common keywords
  profile1Map.forEach((weight1, keyword) => {
    if (profile2Map.has(keyword)) {
      const weight2 = profile2Map.get(keyword)
      dotProduct += weight1 * weight2
      commonKeywords.push({
        keyword,
        weight: (weight1 + weight2) / 2
      })
    }
  })

  // Cosine similarity: dot product / (magnitude1 * magnitude2)
  const cosineSimilarity = magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0
  const score = cosineSimilarity * 100

  return {
    score: Math.round(score * 100) / 100,
    commonKeywords: commonKeywords.sort((a, b) => b.weight - a.weight),
    totalCommon: commonKeywords.length
  }
}

/**
 * Calculate skill diversity/complementarity bonus
 * Rewards profiles with different but complementary skills
 */
function calculateSkillDiversityBonus(profile1Keywords, profile2Keywords) {
  if (!profile1Keywords?.length || !profile2Keywords?.length) {
    return 0
  }

  const profile1Set = new Set(profile1Keywords.map(kw => 
    normalizeKeyword(typeof kw === 'string' ? kw : kw.keyword)
  ))
  const profile2Set = new Set(profile2Keywords.map(kw => 
    normalizeKeyword(typeof kw === 'string' ? kw : kw.keyword)
  ))

  // Calculate unique skills in each profile
  const uniqueIn1 = profile1Set.size - [...profile1Set].filter(k => profile2Set.has(k)).length
  const uniqueIn2 = profile2Set.size - [...profile2Set].filter(k => profile1Set.has(k)).length

  // Reward complementary diversity: having different skills is good
  // But not too different - you need some common ground
  const totalUnique = uniqueIn1 + uniqueIn2
  const totalCombined = new Set([...profile1Set, ...profile2Set]).size

  // Diversity score: higher when skills are complementary but not completely different
  // Target: 40-60% diversity for best match
  const diversityRatio = totalUnique / totalCombined
  let diversityBonus = 0

  if (diversityRatio >= 0.3 && diversityRatio <= 0.7) {
    // Optimal diversity range
    diversityBonus = 20
  } else if (diversityRatio >= 0.2 && diversityRatio <= 0.8) {
    // Good diversity range
    diversityBonus = 15
  } else if (diversityRatio >= 0.1 && diversityRatio <= 0.9) {
    // Acceptable diversity range
    diversityBonus = 10
  }

  return diversityBonus
}

/**
 * Calculate profile completeness score (0-20 points)
 * Rewards users with complete profiles
 */
function calculateProfileCompletenessBonus(profile) {
  if (!profile) return 0

  let completenessScore = 0
  const fields = [
    'full_name',
    'bio',
    'job_title',
    'company',
    'location',
    'linkedin_url',
    'github_url',
    'website'
  ]

  const filledFields = fields.filter(field => profile[field]?.toString().trim()).length
  const completenessRatio = filledFields / fields.length

  // Award points proportionally to profile completeness
  completenessScore = completenessRatio * 20

  return Math.round(completenessScore * 100) / 100
}

/**
 * Calculate location/timezone match bonus (0-10 points)
 */
function calculateLocationBonus(profile1Location, profile2Location) {
  // If either location is missing, don't award points
  if (!profile1Location || !profile2Location) {
    return 0
  }

  const loc1 = profile1Location.toLowerCase().trim()
  const loc2 = profile2Location.toLowerCase().trim()

  // Exact location match
  if (loc1 === loc2) return 10

  // Country/region match (basic check)
  if (loc1.includes(loc2) || loc2.includes(loc1)) return 7

  // Different locations - no bonus
  return 0
}

/**
 * Calculate collaboration style match from bio
 * Detects keywords that indicate collaboration preferences
 */
function calculateCollaborationStyleBonus(bio1, bio2) {
  // If either bio is missing, don't award points
  if (!bio1 || !bio2) {
    return 0
  }

  const collaborationKeywords = [
    'mentor', 'mentoring', 'advise', 'advising',
    'startup', 'startup founder', 'venture',
    'remote', 'async', 'flexible',
    'open source', 'opensource',
    'learning', 'growth', 'development',
    'team', 'collaboration', 'collaborate',
    'product', 'engineering', 'design'
  ]

  let matchingStyles = 0
  const bio1Lower = bio1.toLowerCase()
  const bio2Lower = bio2.toLowerCase()

  collaborationKeywords.forEach(keyword => {
    if (bio1Lower.includes(keyword) && bio2Lower.includes(keyword)) {
      matchingStyles++
    }
  })

  // Only award points if there's meaningful overlap (2+ matching keywords)
  if (matchingStyles < 2) return 0

  // Scale to 0-10: 2+ matches = award points
  const collaborationScore = Math.min(3 + (matchingStyles * 2), 10)

  return collaborationScore
}

/**
 * Calculate weighted compatibility score between two profiles (Multi-Factor)
 *
 * Formula weights (total = 100%):
 * - Common keyword match: 70% - PRIMARY SIGNAL (cosine similarity)
 * - Skill diversity bonus: 10% - Complementary skills reward
 * - Profile completeness: 7% - Complete profiles rank higher
 * - Location match: 5% - Same location/region bonus
 * - Collaboration style: 3% - Work style alignment
 * - Premium status: 5% - Boost for premium profiles
 */
export function calculateCompatibility(profile1Keywords, profile2Keywords, profile1 = {}, profile2 = {}) {
  if (!profile1Keywords?.length || !profile2Keywords?.length) {
    return {
      score: 0,
      commonKeywords: [],
      totalKeywords: 0
    }
  }

  // Factor 1: Common keyword match (70% weight) - PRIMARY SIGNAL
  const keywordMatch = calculateKeywordMatchScore(profile1Keywords, profile2Keywords)
  const keywordScore = (keywordMatch.score / 100) * 70

  // Factor 2: Skill diversity bonus (10% weight)
  const diversityBonus = calculateSkillDiversityBonus(profile1Keywords, profile2Keywords)
  const diversityScore = (diversityBonus / 20) * 10

  // Factor 3: Profile completeness (7% weight)
  const completenessBonus = (calculateProfileCompletenessBonus(profile1) + calculateProfileCompletenessBonus(profile2)) / 2
  const completenessScore = (completenessBonus / 20) * 7

  // Factor 4: Location match (5% weight)
  const locationBonus = calculateLocationBonus(profile1?.location, profile2?.location)
  const locationScore = (locationBonus / 10) * 5

  // Factor 5: Collaboration style match (3% weight)
  const collaborationBonus = calculateCollaborationStyleBonus(profile1?.bio, profile2?.bio)
  const collaborationScore = (collaborationBonus / 10) * 3

  // Factor 6: Premium status boost (5% weight)
  // Both premium: 5 points, One premium: 2.5 points, None: 0 points
  const isPremium1 = profile1?.is_premium || profile1?.isPremium
  const isPremium2 = profile2?.is_premium || profile2?.isPremium
  let premiumScore = 0
  if (isPremium1 && isPremium2) {
    premiumScore = 5
  } else if (isPremium1 || isPremium2) {
    premiumScore = 2.5
  }

  // Total compatibility score (0-100)
  const totalScore = keywordScore + diversityScore + completenessScore + locationScore + collaborationScore + premiumScore

  return {
    score: Math.min(Math.round(totalScore * 100) / 100, 100), // Cap at 100
    commonKeywords: keywordMatch.commonKeywords,
    totalCommon: keywordMatch.totalCommon,
    breakdown: {
      keyword: Math.round(keywordScore * 100) / 100,
      diversity: Math.round(diversityScore * 100) / 100,
      completeness: Math.round(completenessScore * 100) / 100,
      location: Math.round(locationScore * 100) / 100,
      collaboration: Math.round(collaborationScore * 100) / 100,
      premium: premiumScore
    }
  }
}

/**
 * Find top matches for a user from a pool of candidates
 */
export function findTopMatches(userKeywords, candidateProfiles, limit = 10, userProfile = {}) {
  const matches = candidateProfiles.map(candidate => {
    const compatibility = calculateCompatibility(
      userKeywords,
      candidate.keywords,
      userProfile,
      candidate.profile || {}
    )
    return {
      ...candidate,
      compatibility: compatibility.score,
      commonKeywords: compatibility.commonKeywords,
      totalCommon: compatibility.totalCommon,
      allKeywords: candidate.keywords,
      scoreBreakdown: compatibility.breakdown
    }
  })

  // Sort by compatibility score (descending) and return top matches
  return matches
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
