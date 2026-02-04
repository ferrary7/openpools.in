'use client'

import { useEffect } from 'react'
import MatchCard from './MatchCard'
import { useMatchesStore } from '@/store/matchesStore'

export default function MatchesList() {
  const {
    matches,
    loading,
    error,
    searchKeyword,
    searchKeywords,
    displayCount,
    setSearchKeyword,
    removeKeyword,
    handleShowMore,
    fetchMatches,
    clearSearch
  } = useMatchesStore()

  useEffect(() => {
    // Only fetch if we don't have data or it's stale
    fetchMatches(false)
  }, [fetchMatches])

  if (loading && matches.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-500 font-medium">Finding your matches...</span>
      </div>
    )
  }

  if (error && matches.length === 0) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
        Error: {error}
      </div>
    )
  }

  return (
    <div>
      {/* Original Search Hub Layout */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search by name, username, or keywords (comma-separated)..."
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
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
              onClick={clearSearch}
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
          <div className="flex flex-wrap gap-2 mt-4">
            {searchKeywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold border border-primary-100"
              >
                {keyword}
                <button
                  onClick={() => removeKeyword(index)}
                  className="hover:text-primary-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 flex justify-between items-center text-sm">
        <p className="text-gray-600">
          <span className="font-bold text-gray-900">{matches.length}</span> matches found
        </p>
        <button
          onClick={() => fetchMatches(true)}
          disabled={loading}
          className="text-primary-600 hover:text-primary-700 font-bold hover:underline transition-all disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Empty State */}
      {matches.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl text-center py-16 shadow-sm">
          <div className="text-5xl mb-6">🔍</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No matches found
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
            {searchKeywords.length > 0
              ? `No users found with the keywords: ${searchKeywords.join(', ')}. Try broadening your search.`
              : 'The signal pool is currently awaiting new profiles. Check back later!'}
          </p>
          {searchKeywords.length > 0 && (
            <button
              onClick={clearSearch}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Matches Grid */}
      {matches.length > 0 && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {matches.slice(0, displayCount).map((match, index) => (
              <MatchCard key={match.userId || index} match={match} />
            ))}
          </div>

          {/* Show More Button */}
          {displayCount < matches.length && (
            <div className="mt-8 text-center">
              <button
                onClick={handleShowMore}
                className="px-8 py-4 bg-white border-2 border-primary-500 text-primary-600 rounded-xl hover:bg-primary-50 transition-all font-bold shadow-sm hover:shadow-md active:scale-95"
              >
                Show more matches ({matches.length - displayCount} remaining)
              </button>
            </div>
          )}

          {/* All Loaded Message */}
          {displayCount >= matches.length && matches.length > 6 && (
            <div className="mt-12 text-center">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest opacity-50">
                You've reached the end of the pool.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
