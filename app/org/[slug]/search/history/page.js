'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function SearchHistoryPage() {
  const { slug } = useParams()
  const [searches, setSearches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'saved'

  useEffect(() => {
    fetchSearches()
  }, [slug, filter])

  const fetchSearches = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', '50')
      if (filter === 'saved') {
        params.set('savedOnly', 'true')
      }

      const response = await fetch(`/api/org/${slug}/search?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch searches')
      }

      setSearches(data.searches || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToggle = async (searchId, currentSaved) => {
    try {
      const response = await fetch(`/api/org/${slug}/search/${searchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_saved: !currentSaved })
      })

      if (response.ok) {
        setSearches(prev =>
          prev.map(s =>
            s.id === searchId ? { ...s, is_saved: !currentSaved } : s
          )
        )
      }
    } catch (err) {
      console.error('Error updating search:', err)
    }
  }

  const handleDelete = async (searchId) => {
    if (!confirm('Delete this search from history?')) return

    try {
      const response = await fetch(`/api/org/${slug}/search/${searchId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSearches(prev => prev.filter(s => s.id !== searchId))
      }
    } catch (err) {
      console.error('Error deleting search:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/org/${slug}/search`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Search History</h1>
          <p className="text-sm text-gray-500">View and manage your past searches</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Searches
        </button>
        <button
          onClick={() => setFilter('saved')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'saved'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Saved Only
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      ) : searches.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {filter === 'saved' ? 'No saved searches' : 'No searches yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'saved'
              ? 'Save a search to access it quickly later'
              : 'Run a search to see it appear here'}
          </p>
          <div className="mt-6">
            <Link
              href={`/org/${slug}/search`}
              className="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800"
            >
              New Search
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {searches.map(search => (
            <div
              key={search.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {search.name ? (
                      <h3 className="font-medium text-gray-900">{search.name}</h3>
                    ) : (
                      <h3 className="text-gray-500 text-sm">Untitled Search</h3>
                    )}
                    {search.is_saved && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Saved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {search.query_text?.substring(0, 200)}...
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{search.results_count} results found</span>
                    <span>•</span>
                    <span>
                      {new Date(search.created_at).toLocaleDateString()}{' '}
                      {new Date(search.created_at).toLocaleTimeString()}
                    </span>
                    {search.creator && (
                      <>
                        <span>•</span>
                        <span>by {search.creator.full_name || search.creator.email}</span>
                      </>
                    )}
                  </div>
                  {search.query_keywords && search.query_keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {search.query_keywords.slice(0, 8).map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                        >
                          {kw.keyword}
                        </span>
                      ))}
                      {search.query_keywords.length > 8 && (
                        <span className="text-xs text-gray-500">
                          +{search.query_keywords.length - 8} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleSaveToggle(search.id, search.is_saved)}
                    className={`p-2 rounded-lg transition-colors ${
                      search.is_saved
                        ? 'text-yellow-600 hover:bg-yellow-50'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                    title={search.is_saved ? 'Unsave' : 'Save'}
                  >
                    <svg className="w-5 h-5" fill={search.is_saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(search.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
