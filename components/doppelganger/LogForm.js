'use client'

import { useState } from 'react'

export default function LogForm({ checkpointNumber, onSubmit, disabled }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters')
      return
    }

    if (content.trim().length < 10) {
      setError('Description must be at least 10 characters')
      return
    }

    setSubmitting(true)
    const success = await onSubmit?.(checkpointNumber, title.trim(), content.trim())
    setSubmitting(false)

    if (success) {
      setTitle('')
      setContent('')
    }
  }

  return (
    <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
          {checkpointNumber}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Log Update</h2>
          <p className="text-xs text-gray-500">Checkpoint {checkpointNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What did you accomplish?"
            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/30 transition-all placeholder:text-gray-700"
            disabled={disabled || submitting}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Description</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your progress in detail..."
            rows={4}
            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/30 transition-all resize-none leading-relaxed placeholder:text-gray-700"
            disabled={disabled || submitting}
          />
        </div>

        <button
          type="submit"
          disabled={disabled || submitting}
          className="w-full py-4 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-400 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            'Submit Log'
          )}
        </button>
      </form>
    </div>
  )
}
