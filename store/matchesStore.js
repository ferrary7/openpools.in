import { create } from 'zustand'

export const useMatchesStore = create((set, get) => ({
  // State
  matches: [],
  allMatches: [],
  loading: false,
  error: null,
  searchKeyword: '',
  searchKeywords: [],
  displayCount: 10,
  lastFetched: null,

  // Actions
  setMatches: (matches) => set({ matches }),
  setAllMatches: (allMatches) => set({ allMatches }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setDisplayCount: (displayCount) => set({ displayCount }),

  setSearchKeyword: (searchKeyword) => {
    const keywords = searchKeyword
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)
    set({ searchKeyword, searchKeywords: keywords })
    get().filterMatches()
  },

  filterMatches: () => {
    const { searchKeywords, allMatches } = get()

    if (searchKeywords.length === 0) {
      set({ matches: allMatches })
      return
    }

    const filtered = allMatches.filter(match => {
      return searchKeywords.every(keyword => {
        const lowerKeyword = keyword.toLowerCase()
        const hasUsername = match.username?.toLowerCase().includes(lowerKeyword)
        const hasFullName = match.fullName?.toLowerCase().includes(lowerKeyword)
        const hasCommonKeyword = match.commonKeywords?.some(k =>
          k.keyword?.toLowerCase().includes(lowerKeyword)
        )
        const hasAnyKeyword = Array.isArray(match.allKeywords) && match.allKeywords.some(k => {
          const kw = typeof k === 'string' ? k : k.keyword
          return kw?.toLowerCase().includes(lowerKeyword)
        })
        return hasUsername || hasFullName || hasCommonKeyword || hasAnyKeyword
      })
    })

    set({ matches: filtered, displayCount: 10 })
  },

  removeKeyword: (indexToRemove) => {
    const { searchKeyword } = get()
    const keywords = searchKeyword.split(',').map(k => k.trim()).filter(k => k.length > 0)
    keywords.splice(indexToRemove, 1)
    get().setSearchKeyword(keywords.join(', '))
  },

  handleShowMore: () => {
    set(state => ({ displayCount: state.displayCount + 10 }))
  },

  fetchMatches: async (force = false) => {
    const { lastFetched, allMatches } = get()

    // Skip fetch if we have data and it's less than 5 minutes old (unless forced)
    if (!force && allMatches.length > 0 && lastFetched) {
      const fiveMinutes = 5 * 60 * 1000
      if (Date.now() - lastFetched < fiveMinutes) {
        return
      }
    }

    set({ loading: true, error: null })

    try {
      const response = await fetch('/api/matches')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch matches')
      }

      const matches = data.matches || []
      set({
        allMatches: matches,
        matches: matches,
        lastFetched: Date.now()
      })

      // Re-apply filter if there's an active search
      get().filterMatches()
    } catch (err) {
      set({ error: err.message })
    } finally {
      set({ loading: false })
    }
  },

  // Add new matches without full refresh (for real-time updates)
  addNewMatches: (newMatches) => {
    const { allMatches } = get()
    const existingIds = new Set(allMatches.map(m => m.userId))
    const uniqueNew = newMatches.filter(m => !existingIds.has(m.userId))

    if (uniqueNew.length > 0) {
      const updated = [...uniqueNew, ...allMatches]
      set({ allMatches: updated })
      get().filterMatches()
    }
  },

  clearSearch: () => {
    set({ searchKeyword: '', searchKeywords: [] })
    get().filterMatches()
  }
}))
