'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import DNAHelixCanvas from '@/components/dna/DNAHelixCanvas'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [claiming, setClaiming] = useState(false)
  const [user, setUser] = useState(null)
  const ctaRef = useRef(null)
  const [highlightCta, setHighlightCta] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkUserAndFetchInvite()
  }, [params.token])

  const checkUserAndFetchInvite = async () => {
    try {
      // Check if user is logged in
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      // Fetch invite details
      const response = await fetch(`/api/invite/${params.token}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to load invite')
        return
      }

      setInvite(data.invite)
    } catch (err) {
      setError('Failed to load invite')
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    setClaiming(true)
    try {
      const response = await fetch(`/api/invite/${params.token}`, {
        method: 'POST'
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to claim invite')
        return
      }

      // Redirect to DNA page
      router.push('/dna')
    } catch (err) {
      setError('Failed to claim invite')
    } finally {
      setClaiming(false)
    }
  }

  // Get keyword display name
  const getKeywordName = (kw) => {
    if (typeof kw === 'string') return kw
    return kw.keyword || kw.name || ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary-500/30 animate-ping"></div>
            <div className="relative w-20 h-20 rounded-full border-4 border-t-primary-500 border-r-purple-500 border-b-primary-500/20 border-l-purple-500/20 animate-spin"></div>
          </div>
          <p className="text-gray-300 text-lg">Loading your invite...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">{error}</h1>
          <p className="text-gray-400 mb-6">
            This invite link may have expired or already been used.
          </p>
          <Link
            href="/signup"
            className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
          >
            Sign Up Instead
          </Link>
        </div>
      </div>
    )
  }

  const keywords = invite.keywords || []
  const displayKeywords = keywords.slice(0, 12)

  const highlightSignup = () => {
    ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlightCta(true)
    setTimeout(() => setHighlightCta(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-purple-900/20 pointer-events-none" />

      <div className="relative min-h-screen flex flex-col lg:flex-row">
        {/* Left side - DNA Helix */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary-500/30 to-purple-500/30 rounded-full scale-75" />

            {/* DNA Helix */}
            <div className="relative">
              <DNAHelixCanvas
                keywords={keywords}
                className="w-full max-w-[400px]"
              />
            </div>

            {/* Name overlay on helix */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Professional DNA</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                {invite.full_name || 'Your Profile'}
              </h2>
            </div>
          </div>
        </div>

        {/* Right side - Content */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="max-w-lg w-full space-y-8">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/20 rounded-full text-primary-400 text-sm mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Your DNA is Ready
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Claim Your Profile
              </h1>
              <p className="text-gray-400 text-lg">
                We've analyzed your resume and created a unique professional DNA.
                Sign up to claim it and start connecting.
              </p>
            </div>

            {/* Skills Section */}
            {keywords.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">
                    {keywords.length} Skills Detected
                  </h3>
                  {keywords.length > 12 && (
                    <button
                      onClick={highlightSignup}
                      className="text-primary-400 hover:text-primary-300 text-sm"
                    >
                      +{keywords.length - 12} more
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/30 rounded-full text-sm text-gray-200"
                    >
                      {getKeywordName(kw)}
                    </span>
                  ))}
                  {keywords.length > 12 && (
                    <button
                      onClick={highlightSignup}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-sm text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                    >
                      +{keywords.length - 12} more
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Unique DNA visualization of your expertise</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>AI-powered career insights and recommendations</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Smart matching with complementary professionals</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="space-y-4">
              {user ? (
                // User is logged in
                user.email?.toLowerCase() === invite.email.toLowerCase() ? (
                  <button
                    onClick={handleClaim}
                    disabled={claiming}
                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 text-lg"
                  >
                    {claiming ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Claiming...
                      </span>
                    ) : (
                      'Claim My DNA Profile'
                    )}
                  </button>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <p className="text-yellow-400">
                        You're logged in as <strong>{user.email}</strong>
                      </p>
                      <p className="text-yellow-400/70 text-sm mt-1">
                        This invite is for {invite.email}
                      </p>
                    </div>
                    <Link
                      href="/login"
                      className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
                    >
                      Sign in with {invite.email}
                    </Link>
                  </div>
                )
              ) : (
                // User is not logged in
                <>
                  <Link
                    href={`/signup?email=${encodeURIComponent(invite.email)}&invite=${params.token}`}
                    className={`block w-full py-4 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-semibold rounded-xl text-center transition-all duration-300 text-lg ${
                      highlightCta ? 'animate-pulse ring-4 ring-primary-400 ring-offset-2 ring-offset-[#1E1E1E] scale-105' : ''
                    }`}
                  >
                    Sign Up to Claim
                  </Link>
                  <Link
                    href={`/login?email=${encodeURIComponent(invite.email)}&redirect=/invite/${params.token}`}
                    className="block w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-center transition-colors"
                  >
                    Already have an account? Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Footer info */}
            <p className="text-center text-gray-500 text-sm">
              Invitation for <span className="text-gray-400">{invite.email}</span>
              <br />
              Expires: {new Date(invite.expires_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
