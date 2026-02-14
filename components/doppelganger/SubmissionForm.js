'use client'

import { useState, useEffect } from 'react'

export default function SubmissionForm({ submission, onSubmit, disabled }) {
  const [prototypeUrl, setPrototypeUrl] = useState('')
  const [description, setDescription] = useState('')
  const [socialUrl, setSocialUrl] = useState('')
  const [socialPlatform, setSocialPlatform] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // If already submitted, form is locked
  const isSubmitted = !!submission

  useEffect(() => {
    if (submission) {
      setPrototypeUrl(submission.prototype_url || '')
      setDescription(submission.prototype_description || '')
      setSocialUrl(submission.social_post_url || '')
      setSocialPlatform(submission.social_platform || '')
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

    if (socialUrl) {
      try {
        new URL(socialUrl)
      } catch {
        setError('INVALID_SOCIAL_LINK')
        return
      }
    }

    setSubmitting(true)
    await onSubmit?.({
      prototype_url: prototypeUrl,
      prototype_description: description || null,
      social_post_url: socialUrl || null,
      social_platform: socialPlatform || null
    })
    setSubmitting(false)
  }

  const detectPlatform = (url) => {
    if (!url) return ''
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
    if (url.includes('linkedin.com')) return 'linkedin'
    if (url.includes('instagram.com')) return 'instagram'
    if (url.includes('facebook.com')) return 'facebook'
    return 'other'
  }

  useEffect(() => {
    setSocialPlatform(detectPlatform(socialUrl))
  }, [socialUrl])

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

            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">
                  SIGNAL_POST_LINK
                </label>
                <input
                  type="url"
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                  placeholder="https://x.com/operator_alpha/status/..."
                  className="w-full px-6 py-5 bg-[#0A0A0A] border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all font-black tracking-widest uppercase text-sm placeholder:text-gray-900 italic disabled:opacity-60"
                  disabled={disabled || submitting || isSubmitted}
                />
              </div>

              {socialPlatform && (
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-500/5 border border-purple-500/10 rounded-xl animate-fadeIn">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic">{socialPlatform}_DETECTED</span>
                </div>
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
