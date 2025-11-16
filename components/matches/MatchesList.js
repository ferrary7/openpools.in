'use client'

import { useState, useEffect } from 'react'
import MatchCard from './MatchCard'

export default function MatchesList() {
  const [matches, setMatches] = useState([])
  const [allMatches, setAllMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    fetchMatches()
  }, [])

  useEffect(() => {
    filterMatches()
  }, [searchKeyword, allMatches])

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
    if (!searchKeyword.trim()) {
      setMatches(allMatches)
      return
    }

    const keyword = searchKeyword.toLowerCase().trim()
    const filtered = allMatches.filter(match => {
      // Check if any common keyword matches the search
      return match.commonKeywords?.some(k =>
        k.keyword?.toLowerCase().includes(keyword)
      )
    })

    setMatches(filtered)
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

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search by keyword (e.g., 'react', 'python', 'design')..."
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
      </div>

      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          Found {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          {searchKeyword && ` for "${searchKeyword}"`}
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
            {searchKeyword ? 'No matches found' : 'No matches found yet'}
          </h3>
          <p className="text-gray-600">
            {searchKeyword
              ? `No users found with the keyword "${searchKeyword}". Try a different search term.`
              : 'There are no other users with keyword profiles yet. Check back later!'}
          </p>
          {searchKeyword && (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match, index) => (
            <MatchCard key={match.userId || index} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}
