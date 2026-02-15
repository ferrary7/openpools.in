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
  const [error, setError] = useState(null)

  // If already submitted, form is locked
  const isSubmitted = !!submission

  useEffect(() => {
    if (submission) {
      setPrototypeUrl(submission.prototype_url || '')
      setDescription(submission.prototype_description || '')
      // Support both old single link and new multiple links format
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
      setError('PROTOTYPE_SIGNAL_REQUIRED')
      return
    }

    try {
      new URL(prototypeUrl)
    } catch {
      setError('INVALID_SIGNAL_FORMAT')
      return
    }

    // Validate all social links
    const validLinks = socialLinks.filter(link => link.url?.trim())
    for (const link of validLinks) {
      try {
        new URL(link.url)
      } catch {
        setError(`INVALID_SOCIAL_LINK: ${link.platform}`)
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
    // Auto-detect platform from URL
    if (field === 'url') {
      updated[index].platform = detectPlatform(value)
    }
    setSocialLinks(updated)
  }

  return (
    <div className="glass-dark rounded-[2.5rem] border border-white/5 overflow-hidden relative group">
      {/* HUD Header */}
      <div className="bg-white/5 border-b border-white/5 px-8 pt-10 pb-8 relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-green-500/20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">SYSTEM_DEPLOYMENT_TERMINAL</h3>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">DEPLOY <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">SOLUTION</span></h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10 relative z-10">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-[0.2em] animate-shake">
            {error}
          </div>
        )}

        {isSubmitted && (
          <div className="space-y-4">
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-green-500 text-[10px] font-black uppercase tracking-[0.2em] italic">
                  SUBMISSION_LOCKED
                </span>
              </div>
              <p className="text-green-400/70 text-xs">
                Your project has been successfully submitted. Submissions cannot be modified after deployment.
              </p>
              <p className="text-gray-500 text-[10px] mt-2">
                Submitted: {new Date(submission.submitted_at).toLocaleString()}
              </p>
            </div>

            {/* Results info */}
            <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-purple-400 font-black uppercase tracking-widest text-[10px] mb-2">WHAT_HAPPENS_NEXT</p>
                  <ul className="text-gray-400 text-xs space-y-2 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">→</span>
                      <span>Judges will evaluate all submissions after the sprint ends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">→</span>
                      <span>Results will be announced on the <strong className="text-white">Leaderboard</strong> page</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">→</span>
                      <span>Top teams will be notified via email</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Prototype URL */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">
              PROTOTYPE_STAGING_URL <span className="text-red-500 opacity-50">*</span>
            </label>
            <div className="relative group/input">
              <input
                type="url"
                value={prototypeUrl}
                onChange={(e) => setPrototypeUrl(e.target.value)}
                placeholder="https://deployment-alpha.io"
                className="w-full px-6 py-5 bg-[#0A0A0A] border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/30 transition-all font-black tracking-widest uppercase text-sm placeholder:text-gray-900 italic shadow-inner disabled:opacity-60"
                disabled={disabled || submitting || isSubmitted}
                required
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-100 transition-opacity">
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest italic">READY</span>
              </div>
            </div>
            <p className="text-[9px] text-gray-600 mt-4 font-bold uppercase tracking-tight">Main deployment access point for evaluator synchronization.</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">
              ARCHITECTURAL_BRIEF
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the technical implementation and core synchronization logic..."
              rows={4}
              className="w-full px-6 py-5 bg-[#0A0A0A] border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/30 transition-all resize-none font-medium text-sm leading-relaxed placeholder:text-gray-900 shadow-inner disabled:opacity-60"
              disabled={disabled || submitting || isSubmitted}
            />
            <p className="text-[9px] text-gray-600 mt-4 font-bold uppercase tracking-tight italic">Describe the 'Doppelganger' resonance achieved in this build.</p>
          </div>

          {/* Social Proof */}
          <div className="pt-10 border-t border-white/5 group-hover:border-white/10 transition-colors">
            <div className="flex items-center gap-4 mb-8">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">SOCIAL_AMPLIFICATION</h4>
              <div className="h-[1px] flex-1 bg-white/5"></div>
              <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest italic">+ RESONANCE_BONUS</span>
            </div>

            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex gap-3 items-start animate-fadeIn">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        placeholder={PLATFORMS.find(p => p.id === link.platform)?.placeholder || 'https://...'}
                        className="w-full px-6 py-4 bg-[#0A0A0A] border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all font-medium text-sm placeholder:text-gray-800 disabled:opacity-60"
                        disabled={disabled || submitting || isSubmitted}
                      />
                      {link.platform && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic">
                            {PLATFORMS.find(p => p.id === link.platform)?.icon} {link.platform}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {!isSubmitted && (
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      disabled={disabled || submitting}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="w-full py-4 border border-dashed border-white/10 hover:border-purple-500/30 rounded-2xl text-gray-500 hover:text-purple-400 font-black text-[10px] tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 hover:bg-purple-500/5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  ADD_SOCIAL_LINK
                </button>
              )}

              {socialLinks.length > 0 && (
                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tight italic mt-4">
                  {socialLinks.length}/5 SIGNAL_CHANNELS_CONFIGURED — More links = higher resonance bonus
                </p>
              )}
            </div>
          </div>
        </div>

        {!isSubmitted && (
          <button
            type="submit"
            disabled={disabled || submitting}
            className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-sm tracking-[0.3em] uppercase hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-2xl shadow-white/5 group/btn"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                INITIATING_DEPLOYMENT...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                INIT_DEPLOYMENT
              </>
            )}
          </button>
        )}
      </form>
    </div>
  )
}
