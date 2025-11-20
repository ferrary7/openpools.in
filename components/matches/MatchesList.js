'use client'

import { useState, useEffect } from 'react'
import MatchCard from './MatchCard'

export default function MatchesList() {
  const [matches, setMatches] = useState([])
  const [allMatches, setAllMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchKeywords, setSearchKeywords] = useState([])
  const [displayCount, setDisplayCount] = useState(10)

  useEffect(() => {
    fetchMatches()
  }, [])

  useEffect(() => {
    // Parse comma-separated keywords
    const keywords = searchKeyword
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)
    setSearchKeywords(keywords)
  }, [searchKeyword])

  useEffect(() => {
    filterMatches()
  }, [searchKeywords, allMatches])

  const fetchMatches = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/matches')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch matches')
      }

      setAllMatches(data.matches || [])
      setMatches(data.matches || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filterMatches = () => {
    if (searchKeywords.length === 0) {
      setMatches(allMatches)
      return
    }

    const filtered = allMatches.filter(match => {
      // Match must have ALL of the search keywords (AND logic)
      return searchKeywords.every(keyword => {
        const lowerKeyword = keyword.toLowerCase()

        // Check both common keywords AND all keywords of the matched user
        const hasCommonKeyword = match.commonKeywords?.some(k =>
          k.keyword?.toLowerCase().includes(lowerKeyword)
        )

        const hasAnyKeyword = match.allKeywords?.some(k => {
          const kw = typeof k === 'string' ? k : k.keyword
          return kw?.toLowerCase().includes(lowerKeyword)
        })

        return hasCommonKeyword || hasAnyKeyword
      })
    })

    setMatches(filtered)
    setDisplayCount(10) // Reset to 10 when filtering
  }

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 10)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Finding your matches...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Error: {error}
      </div>
    )
  }

  const removeKeyword = (indexToRemove) => {
    const keywords = searchKeyword.split(',').map(k => k.trim()).filter(k => k.length > 0)
    keywords.splice(indexToRemove, 1)
    setSearchKeyword(keywords.join(', '))
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search by keywords (comma-separated: react, python, design)..."
            className="input-field w-full pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Display keywords as tags */}
        {searchKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {searchKeywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
              >
                {keyword}
                <button
                  onClick={() => removeKeyword(index)}
                  className="hover:text-primary-900 transition-colors"
                  aria-label={`Remove ${keyword}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{matches.length}</span> {matches.length === 1 ? 'match' : 'matches'} found
          {searchKeywords.length > 0 && ` for ${searchKeywords.length} keyword${searchKeywords.length > 1 ? 's' : ''}`}
        </p>
        <button
          onClick={fetchMatches}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Empty State */}
      {matches.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchKeywords.length > 0 ? 'No matches found' : 'No matches found yet'}
          </h3>
          <p className="text-gray-600">
            {searchKeywords.length > 0
              ? `No users found with the keyword${searchKeywords.length > 1 ? 's' : ''}: ${searchKeywords.join(', ')}. Try different search terms.`
              : 'There are no other users with keyword profiles yet. Check back later!'}
          </p>
          {searchKeywords.length > 0 && (
            <button
              onClick={() => setSearchKeyword('')}
              className="mt-4 btn-secondary"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Matches Grid */}
      {matches.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.slice(0, displayCount).map((match, index) => (
              <MatchCard key={match.userId || index} match={match} />
            ))}
          </div>

          {/* Show More Button */}
          {displayCount < matches.length && (
            <div className="mt-8 text-center">
              <button
                onClick={handleShowMore}
                className="px-6 py-3 bg-white border-2 border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold shadow-sm hover:shadow-md"
              >
                Show more matches ({matches.length - displayCount} remaining)
              </button>
            </div>
          )}

          {/* All Loaded Message */}
          {displayCount >= matches.length && matches.length > 10 && (
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                You've reached the end! All {matches.length} matches shown.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
