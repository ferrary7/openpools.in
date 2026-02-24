'use client'

import { useState, useEffect } from 'react'

const PLATFORMS = [
  { id: 'twitter', label: 'X / Twitter', icon: '𝕏', placeholder: 'https://x.com/...' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'in', placeholder: 'https://linkedin.com/posts/...' },
  { id: 'instagram', label: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/p/...' },
  { id: 'youtube', label: 'YouTube', icon: '▶', placeholder: 'https://youtube.com/watch?v=...' },
  { id: 'other', label: 'Other', icon: '🔗', placeholder: 'https://...' }
]

export default function SubmissionForm({ submission, onSubmit, disabled }) {
  const [prototypeUrl, setPrototypeUrl] = useState('')
  const [description, setDescription] = useState('')
  const [socialLinks, setSocialLinks] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState(null)

  const isSubmitted = !!submission

  useEffect(() => {
    if (submission) {
      setPrototypeUrl(submission.prototype_url || '')
      setDescription(submission.prototype_description || '')
      if (submission.social_links?.length) {
        setSocialLinks(submission.social_links)
      } else if (submission.social_post_url) {
        setSocialLinks([{ platform: submission.social_platform || 'other', url: submission.social_post_url }])
      }
    }
  }, [submission])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!prototypeUrl) {
      setError('Prototype URL is required')
      return
    }

    try {
      new URL(prototypeUrl)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    const validLinks = socialLinks.filter(link => link.url?.trim())
    for (const link of validLinks) {
      try {
        new URL(link.url)
      } catch {
        setError(`Invalid URL for ${link.platform || 'social link'}`)
        return
      }
    }

    setSubmitting(true)
    await onSubmit?.({
      prototype_url: prototypeUrl,
      prototype_description: description || null,
      social_links: validLinks.length > 0 ? validLinks : null
    })
    setSubmitting(false)
  }

  const detectPlatform = (url) => {
    if (!url) return 'other'
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
    if (url.includes('linkedin.com')) return 'linkedin'
    if (url.includes('instagram.com')) return 'instagram'
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    return 'other'
  }

  const addSocialLink = () => {
    if (socialLinks.length >= 5) return
    setSocialLinks([...socialLinks, { platform: '', url: '' }])
  }

  const removeSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const updateSocialLink = (index, field, value) => {
    const updated = [...socialLinks]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'url') {
      updated[index].platform = detectPlatform(value)
    }
    setSocialLinks(updated)
  }

  return (
    <div className="glass-dark rounded-[2.5rem] border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Submit Your Project</h2>
            <p className="text-xs text-gray-500">Final submission for judging</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        {isSubmitted && (
          <div className="space-y-3">
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-400 text-sm font-semibold">Submitted</span>
              </div>
              <p className="text-emerald-400/70 text-xs">
                Your project has been submitted. Submissions cannot be modified.
              </p>
              <p className="text-gray-500 text-xs mt-1.5">
                {new Date(submission.submitted_at).toLocaleString()}
              </p>
            </div>

            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
              <p className="text-xs font-semibold text-gray-400 mb-3">What happens next</p>
              <ul className="text-gray-500 text-xs space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">1.</span>
                  <span>Judges evaluate all submissions after the sprint</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">2.</span>
                  <span>Results appear on the Leaderboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">3.</span>
                  <span>Top teams get notified by email</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Prototype URL */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Prototype URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={prototypeUrl}
              onChange={(e) => setPrototypeUrl(e.target.value)}
              placeholder="https://your-project.vercel.app"
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all placeholder:text-gray-700 disabled:opacity-50"
              disabled={disabled || submitting || isSubmitted}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Project Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you built and how it works..."
              rows={4}
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all resize-none leading-relaxed placeholder:text-gray-700 disabled:opacity-50"
              disabled={disabled || submitting || isSubmitted}
            />
          </div>

          {/* Social Links */}
          <div className="pt-6 border-t border-white/5">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-medium text-gray-400">Social Proof</label>
              <span className="text-[10px] text-gray-600">{socialLinks.length}/5 links</span>
            </div>

            <div className="space-y-3">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    placeholder={PLATFORMS.find(p => p.id === link.platform)?.placeholder || 'https://...'}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-gray-700 disabled:opacity-50"
                    disabled={disabled || submitting || isSubmitted}
                  />
                  {link.platform && (
                    <span className="text-xs text-gray-500 w-16 text-center shrink-0">
                      {PLATFORMS.find(p => p.id === link.platform)?.label || link.platform}
                    </span>
                  )}
                  {!isSubmitted && (
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="p-2 text-gray-600 hover:text-red-400 rounded-lg transition-colors"
                      disabled={disabled || submitting}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}

              {!isSubmitted && socialLinks.length < 5 && (
                <button
                  type="button"
                  onClick={addSocialLink}
                  disabled={disabled || submitting}
                  className="w-full py-3 border border-dashed border-white/10 hover:border-primary-500/30 rounded-xl text-gray-500 hover:text-primary-400 text-xs font-medium transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add social link
                </button>
              )}
            </div>
          </div>
        </div>

        {!isSubmitted && (
          <div className="space-y-4 pt-2">
            {/* Warning */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-400">This is a one-time submission</p>
                <p className="text-xs text-amber-400/70 mt-1">Once submitted, you will not be able to edit or resubmit. Please double-check your prototype URL and all details before proceeding.</p>
              </div>
            </div>

            {/* Confirmation checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={disabled || submitting}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                I have verified all the details above and understand that this submission is final and cannot be changed.
              </span>
            </label>

            <button
              type="submit"
              disabled={disabled || submitting || !confirmed}
              className="w-full py-4 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Project
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
