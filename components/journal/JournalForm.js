'use client'

import { useState } from 'react'

export default function JournalForm({ onSuccess }) {
  const [entry, setEntry] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: entry.substring(0, 50), // Use first 50 chars as title
          content: entry
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save journal')
      }

      setEntry('')
      if (onSuccess) {
        onSuccess(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Quick Journal Entry
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Add a one-liner about your skills, projects, or professional experience
      </p>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="input-field text-lg"
            placeholder="e.g., Built a React dashboard with TypeScript and API integration"
            required
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-2 flex items-center justify-between">
            <span>✨ AI will extract keywords to enhance your profile</span>
            <span className={entry.length > 180 ? 'text-amber-600 font-medium' : ''}>
              {entry.length}/200
            </span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !entry.trim()}
          className="btn-primary w-full disabled:opacity-50"
        >
          {saving ? 'Extracting Keywords...' : 'Add Entry'}
        </button>
      </div>
    </form>
  )
}
