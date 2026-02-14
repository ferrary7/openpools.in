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
      setError('Signal header must be at least 3 characters')
      return
    }

    if (content.trim().length < 10) {
      setError('Signal payload must be at least 10 characters')
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
    <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
        <span className="text-8xl font-black italic tracking-tighter">SIGNAL</span>
      </div>

      <div className="flex items-center gap-6 mb-10 relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-purple-500/20 italic">
          #{checkpointNumber}
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-1">ENCRYPTED SIGNAL TERMINAL</h2>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">TRANSMISSION LOG_{checkpointNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest animate-shake">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">
              SIGNAL HEADER
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CORE_MODULE_STABILIZED"
              className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all font-black tracking-widest uppercase text-sm placeholder:text-gray-800 italic"
              disabled={disabled || submitting}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">
              SIGNAL PAYLOAD
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What have you unlocked? What is the current trajectory?"
              rows={4}
              className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all resize-none font-medium text-sm leading-relaxed placeholder:text-gray-800 shadow-inner"
              disabled={disabled || submitting}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || submitting}
          className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl shadow-white/5 group/btn"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              TRANSMITTING_SIGNAL...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              BROADCAST_PROGRESS
            </>
          )}
        </button>
      </form>
    </div>
  )
}
