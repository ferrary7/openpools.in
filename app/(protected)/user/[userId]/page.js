'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import KeywordDisplay from '@/components/onboarding/KeywordDisplay'
import CollabButton from '@/components/collab/CollabButton'
import CollabAnimation from '@/components/collab/CollabAnimation'

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAnimation, setShowAnimation] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (params.userId) {
      fetchProfile()
    }
  }, [params.userId])

  useEffect(() => {
    if (!profile?.collabStatus) return
    if (profile.collabStatus.status === 'pending' && profile.collabStatus.isSender) {
      const pollInterval = setInterval(() => {
        fetchProfile()
      }, 5000)
      return () => clearInterval(pollInterval)
    }
  }, [profile?.collabStatus?.status, profile?.collabStatus?.isSender])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${params.userId}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch profile')
      setProfile(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCollabSuccess = () => {
    setShowAnimation(true)
    setTimeout(() => {
      setShowAnimation(false)
      fetchProfile()
    }, 3000)
  }

  const handleRemoveConnection = async () => {
    if (!profile?.collabStatus?.collabId) return
    if (!confirm(`Are you sure you want to remove your collaboration with ${profile.profile.full_name}?`)) return
    setRemoving(true)
    try {
      const response = await fetch(`/api/collabs/${profile.collabStatus.collabId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to remove collaboration')
      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchProfile()
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setRemoving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border border-primary-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <span className="mt-6 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Syncing...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="inline-block p-4 bg-white border border-slate-100 text-slate-600 rounded-2xl font-semibold shadow-sm">
          System Message: {error}
        </div>
      </div>
    )
  }

  const { profile: userData, isCollaborating, collabStatus, canViewContactInfo } = profile
  const isPremiumActive = userData.is_premium && (!userData.premium_expires_at || new Date(userData.premium_expires_at) > new Date())

  return (
    <div className="relative min-h-screen bg-white flex flex-col overflow-hidden">
      {showAnimation && <CollabAnimation onComplete={() => setShowAnimation(false)} />}

      {/* Subtle Product Canvas - "Quiet Luxury" Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary-500/[0.04] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[35%] h-[35%] bg-pink-500/[0.04] rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Navigation Bar */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Pool
          </button>

          <div className="flex gap-3">
            <CollabButton
              userId={userData.id}
              collabStatus={collabStatus}
              onCollabSuccess={handleCollabSuccess}
            />
            {isCollaborating && (
              <button
                onClick={handleRemoveConnection}
                disabled={removing}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm disabled:opacity-50"
              >
                {removing ? '...' : 'Remove'}
              </button>
            )}
          </div>
        </div>

        {/* Identity Grid - Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Main Dossier Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Identity Hero Header */}
            <div className={`relative overflow-hidden p-8 md:p-10 rounded-2xl border transition-all duration-500 ${isPremiumActive
              ? 'bg-gradient-to-br from-amber-50/30 via-white to-transparent border-amber-100 shadow-sm'
              : 'bg-white border-slate-200 shadow-sm'
              }`}>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Profile Picture */}
                <div className="relative shrink-0">
                  <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 bg-slate-50 shadow-sm ${isPremiumActive ? 'border-amber-200' : 'border-slate-100'
                    }`}>
                    {userData.profile_picture_url ? (
                      <img
                        src={userData.profile_picture_url}
                        alt={userData.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl font-bold">
                        {userData.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Name & Credentials */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                      {userData.full_name}
                    </h1>
                    {isPremiumActive && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-md text-[9px] font-bold uppercase tracking-widest shadow-sm">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {userData.premium_source || 'Verified'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {userData.job_title && (
                      <p className="text-lg md:text-xl font-semibold text-slate-500 tracking-tight">
                        {userData.job_title} {userData.company && <span className="text-slate-300 font-medium">@ {userData.company}</span>}
                      </p>
                    )}
                    {userData.location && (
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5">
                        <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {userData.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About Unit */}
            {userData.bio && (
              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm group">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  Background
                  <div className="flex-1 h-px bg-slate-50"></div>
                </h2>
                <p className="text-base text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                  {userData.bio}
                </p>
              </div>
            )}

            {/* Keyword Unit */}
            <div className={`p-8 rounded-2xl border shadow-sm transition-all ${!canViewContactInfo ? 'border-amber-100 bg-amber-50/20' : 'bg-white border-slate-200'
              }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${!canViewContactInfo ? 'text-amber-500' : 'text-slate-400'
                  }`}>
                  Core Capabilities
                </h2>
                {!canViewContactInfo && userData.total_keywords > 4 && (
                  <span className="text-[9px] font-bold text-amber-600/70 border border-amber-100 px-2 py-0.5 rounded uppercase">
                    Locked Results: {userData.total_keywords - 4}
                  </span>
                )}
              </div>

              {userData.keywords && userData.keywords.length > 0 ? (
                <div className="space-y-6">
                  <KeywordDisplay
                    keywords={canViewContactInfo ? userData.keywords : userData.keywords.slice(0, 4)}
                    personName={currentUserId !== params.userId ? userData.full_name : null}
                  />
                  {!canViewContactInfo && userData.keywords.length > 4 && (
                    <div className="flex justify-center pt-6 border-t border-amber-100/50">
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Collaborate to unlock full stream
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic font-medium">Identity matrix pending broadcast.</p>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            {/* Contact Information Hub */}
            <div className={`p-7 rounded-2xl border shadow-sm transition-all ${canViewContactInfo
              ? 'bg-gradient-to-br from-emerald-50/20 to-white border-emerald-100 shadow-emerald-500/5'
              : 'bg-white border-slate-200'
              }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${canViewContactInfo ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'
                  }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {canViewContactInfo ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    )}
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-none">Intelligence</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Secure</p>
                </div>
              </div>

              {canViewContactInfo ? (
                <div className="space-y-5">
                  {userData.email && (
                    <div className="group/item">
                      <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1 group-hover/item:text-emerald-500 transition-colors">Verified Email</label>
                      <a href={`mailto:${userData.email}`} className="text-slate-800 font-semibold hover:text-emerald-600 transition-colors break-all text-[15px]">
                        {userData.email}
                      </a>
                    </div>
                  )}
                  {userData.phone_number && (
                    <div className="group/item">
                      <label className="block text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1 group-hover/item:text-emerald-500 transition-colors">Signal Line</label>
                      <a href={`tel:${userData.phone_number}`} className="text-slate-800 font-semibold hover:text-emerald-600 transition-colors text-[15px]">
                        {userData.phone_number}
                      </a>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-3 pt-4">
                    {userData.linkedin_url && (
                      <a href={userData.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-xl transition-all group/sub">
                        <span className="text-xs font-bold text-slate-500 group-hover/sub:text-emerald-700 uppercase tracking-widest">LinkedIn</span>
                        <svg className="w-4 h-4 text-slate-300 group-hover/sub:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    {userData.github_url && (
                      <a href={userData.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-xl transition-all group/sub">
                        <span className="text-xs font-bold text-slate-500 group-hover/sub:text-emerald-700 uppercase tracking-widest">GitHub Profile</span>
                        <svg className="w-4 h-4 text-slate-300 group-hover/sub:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-60 italic">Identity Shielded</p>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed px-4">
                    Establish a collaboration to authenticate and unlock secure contact protocols.
                  </p>
                </div>
              )}
            </div>

            {/* Platform Stats */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">Chronology</span>
              <p className="mt-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Verified {new Date(userData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
