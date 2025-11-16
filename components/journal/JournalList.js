'use client'

import { useState, useEffect } from 'react'

export default function JournalList({ refresh }) {
  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchJournals()
  }, [refresh])

  const fetchJournals = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/journal')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch journals')
      }

      setJournals(data.journals || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) {
      return
    }

    try {
      const response = await fetch(`/api/journal?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete journal')
      }

      fetchJournals()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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

  if (journals.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No journal entries yet
        </h3>
        <p className="text-gray-600">
          Start documenting your professional journey above
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {journals.map((journal) => (
        <div key={journal.id} className="card">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {journal.title}
            </h3>
            <button
              onClick={() => handleDelete(journal.id)}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>

          <p className="text-gray-600 text-sm mb-3 whitespace-pre-wrap">
            {journal.content}
          </p>

          {journal.extracted_keywords && journal.extracted_keywords.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Extracted Keywords:</div>
              <div className="flex flex-wrap gap-1">
                {journal.extracted_keywords.map((kw, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs"
                  >
                    {kw.keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400">
            {new Date(journal.created_at).toLocaleDateString()} at{' '}
            {new Date(journal.created_at).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  )
}
