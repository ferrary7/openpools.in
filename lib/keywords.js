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

export function recalculateKeywordWeights(keywords) {
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return keywords
  }

  // Count category occurrences for each keyword to detect prominence
  const keywordInfo = new Map()
  
  keywords.forEach((kw, index) => {
    const keyword = typeof kw === 'string' ? kw : kw.keyword || kw.name || ''
    if (keyword) {
      if (!keywordInfo.has(keyword)) {
        keywordInfo.set(keyword, {
          firstIndex: index,
          categories: new Set(),
          count: 0
        })
      }
      const info = keywordInfo.get(keyword)
      info.count++
      if (kw.category) {
        info.categories.add(kw.category)
      }
    }
  })

  // Recalculate weights based on:
  // 1. Position in list (earlier = more important)
  // 2. Category diversity (appearing in multiple categories = more important)
  // 3. Frequency (appearing multiple times = more important)
  return keywords.map((kw, index) => {
    if (typeof kw === 'string') {
      // String-only keywords: weight based on position
      const positionWeight = 1.0 - (index / Math.max(keywords.length, 1)) * 0.5 // 1.0 to 0.5
      return {
        keyword: kw,
        weight: Math.round(positionWeight * 100) / 100
      }
    }

    const keyword = kw.keyword || kw.name || ''
    const info = keywordInfo.get(keyword) || { firstIndex: index, categories: new Set(), count: 1 }
    
    // Position-based weight: earlier keywords are stronger
    // First keyword gets 1.0, last gets ~0.3
    const positionWeight = 1.0 - (info.firstIndex / Math.max(keywords.length, 1)) * 0.7
    
    // Category diversity bonus: keywords in multiple categories are more prominent
    const categoryBonus = Math.min(info.categories.size * 0.15, 0.3) // Max 30% boost
    
    // Frequency bonus: repeated keywords get boost
    const frequencyBonus = Math.min((info.count - 1) * 0.1, 0.2) // Max 20% boost
    
    // Combine all factors
    const baseWeight = kw.weight || 1.0
    const finalWeight = Math.min(1.0, baseWeight * (positionWeight + categoryBonus + frequencyBonus))

    return {
      ...kw,
      keyword: keyword,
      weight: Math.round(finalWeight * 100) / 100
    }
  })
}

