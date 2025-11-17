'use client'

import { useState } from 'react'

export default function CollabButton({ userId, collabStatus, onCollabSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendCollabRequest = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/collabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: userId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send collaboration request')
      }

      window.location.reload() // Refresh to show updated status
    } catch (err) {
      setError(err.message)
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const respondToCollab = async (status) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/collabs/${collabStatus.collabId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to respond to collaboration')
      }

      if (status === 'accepted' && onCollabSuccess) {
        onCollabSuccess()
      } else {
        window.location.reload()
      }
    } catch (err) {
      setError(err.message)
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // No collab yet
  if (!collabStatus) {
    return (
      <button
        onClick={sendCollabRequest}
        disabled={loading}
        className="btn-primary flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {loading ? 'Sending...' : 'Start Collaboration'}
      </button>
    )
  }

  // Pending - user is sender
  if (collabStatus.status === 'pending' && collabStatus.isSender) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg border border-amber-300">
        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">Pending Request</span>
      </div>
    )
  }

  // Pending - user is receiver (can accept/reject)
  if (collabStatus.status === 'pending' && !collabStatus.isSender) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => respondToCollab('accepted')}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {loading ? 'Accepting...' : 'Accept Collaboration'}
        </button>
        <button
          onClick={() => respondToCollab('rejected')}
          disabled={loading}
          className="btn-secondary"
        >
          Decline
        </button>
      </div>
    )
  }

  // Accepted
  if (collabStatus.status === 'accepted') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-300">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">Collaborating</span>
      </div>
    )
  }

  return null
}
