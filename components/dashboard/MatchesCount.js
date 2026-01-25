'use client'

import { useState, useEffect } from 'react'

export default function MatchesCount({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(initialCount === 0)

  useEffect(() => {
    // If initial count is 0, fetch matches (this will calculate them if needed)
    if (initialCount === 0) {
      fetchMatches()
    }
  }, [initialCount])

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      if (response.ok) {
        const data = await response.json()
        setCount(data.matches?.length || data.total || 0)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
        <span className="text-sm text-gray-500">Calculating...</span>
      </div>
    )
  }

  return <>{count}</>
}
