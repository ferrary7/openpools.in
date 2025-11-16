/**
 * Keyword management utilities
 */

export function normalizeKeyword(keyword) {
  return keyword.toLowerCase().trim()
}

export function mergeKeywords(existingKeywords, newKeywords) {
  const keywordMap = new Map()

  // Add existing keywords
  existingKeywords.forEach(kw => {
    keywordMap.set(kw.keyword, kw)
  })

  // Merge new keywords
  newKeywords.forEach(kw => {
    const normalized = normalizeKeyword(kw.keyword)
    if (keywordMap.has(normalized)) {
      const existing = keywordMap.get(normalized)
      // Take the higher weight
      existing.weight = Math.max(existing.weight, kw.weight)
      // Merge sources
      if (kw.sources) {
        existing.sources = [...new Set([...(existing.sources || [kw.source]), ...kw.sources])]
      } else if (kw.source && !existing.sources?.includes(kw.source)) {
        existing.sources = [...(existing.sources || []), kw.source]
      }
    } else {
      keywordMap.set(normalized, {
        ...kw,
        keyword: normalized,
        sources: kw.sources || [kw.source]
      })
    }
  })

  return Array.from(keywordMap.values())
}

export function calculateKeywordSimilarity(keywords1, keywords2) {
  const set1 = new Set(keywords1.map(kw =>
    typeof kw === 'string' ? normalizeKeyword(kw) : normalizeKeyword(kw.keyword)
  ))
  const set2 = new Set(keywords2.map(kw =>
    typeof kw === 'string' ? normalizeKeyword(kw) : normalizeKeyword(kw.keyword)
  ))

  const intersection = new Set([...set1].filter(k => set2.has(k)))
  const union = new Set([...set1, ...set2])

  if (union.size === 0) return 0

  return (intersection.size / union.size) * 100
}

export function getCommonKeywords(keywords1, keywords2) {
  const set2 = new Set(keywords2.map(kw =>
    typeof kw === 'string' ? normalizeKeyword(kw) : normalizeKeyword(kw.keyword)
  ))

  return keywords1.filter(kw => {
    const keyword = typeof kw === 'string' ? normalizeKeyword(kw) : normalizeKeyword(kw.keyword)
    return set2.has(keyword)
  })
}

export function sortKeywordsByWeight(keywords) {
  return [...keywords].sort((a, b) => (b.weight || 0) - (a.weight || 0))
}
