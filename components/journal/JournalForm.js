'use client'

import { useState } from 'react'

export default function JournalForm({ onSuccess }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
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
        body: JSON.stringify({ title, content }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save journal')
      }

      setTitle('')
      setContent('')
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
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Create Journal Entry
      </h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="What's on your mind?"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field resize-none"
            placeholder="Write about your professional experiences, learnings, projects, or goals..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            AI will extract keywords from your entry to enhance your profile
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full disabled:opacity-50"
        >
          {saving ? 'Saving & Extracting Keywords...' : 'Save Entry'}
        </button>
      </div>
    </form>
  )
}
