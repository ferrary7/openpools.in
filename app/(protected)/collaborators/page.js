'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCollaboratorsStore } from '@/store/collaboratorsStore'

export default function CollaboratorsPage() {
  const {
    collaborators,
    loading,
    error,
    searchQuery,
    currentUserId,
    removing,
    setSearchQuery,
    setCurrentUserId,
    getCollaboratorInfo,
    getFilteredCollaborators,
    fetchCollaborators,
    removeCollaborator,
    clearSearch
  } = useCollaboratorsStore()

  const supabase = createClient()

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.id !== currentUserId) {
        setCurrentUserId(user.id)
      }
    }
    getCurrentUser()
  }, [supabase.auth, currentUserId, setCurrentUserId])

  useEffect(() => {
    if (currentUserId) {
      fetchCollaborators(false)
    }
  }, [currentUserId, fetchCollaborators])

  const filteredCollaborators = getFilteredCollaborators()

  if (loading && collaborators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border border-primary-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <span className="mt-6 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Syncing...</span>
      </div>
    )
  }

  if (error && collaborators.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block p-4 bg-white border border-rose-100 text-rose-600 rounded-2xl font-semibold shadow-sm text-sm">
          System Message: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-white">
      {/* Subtle Atmospheric Depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary-500/[0.04] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[35%] h-[35%] bg-pink-500/[0.04] rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Persistent Header */}
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Collaborators</h1>
            <p className="text-slate-500 mt-2 font-medium">
              Professionals you're actively collaborating with
            </p>
          </div>
          <button
            onClick={() => fetchCollaborators(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100/50 rounded-lg transition-all disabled:opacity-50 uppercase tracking-widest"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Search Protcol */}
        {collaborators.length > 0 && (
          <div className="mb-8">
            <div className="relative group max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collaborators..."
                className="block w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:border-primary-400 transition-all shadow-sm font-medium"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Product Stats Bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Collaborators</div>
            <div className="text-3xl font-bold text-primary-600 tabular-nums">{collaborators.length}</div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Total Messages</div>
            <div className="text-3xl font-bold text-blue-600 tabular-nums">
              {collaborators.reduce((sum, c) => sum + (c.message_stats?.total || 0), 0)}
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 border-b border-orange-100 pb-1 mb-2">Unread</div>
            <div className="text-3xl font-bold text-orange-600 tabular-nums">
              {collaborators.reduce((sum, c) => sum + (c.message_stats?.unread || 0), 0)}
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Companies</div>
            <div className="text-3xl font-bold text-emerald-600 tabular-nums">
              {new Set(collaborators.map(c => getCollaboratorInfo(c).company).filter(Boolean)).size}
            </div>
          </div>
        </div>

        {/* Connection Discovery Grid */}
        {filteredCollaborators.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl py-16 text-center shadow-sm max-w-xl mx-auto">
            <div className="text-4xl mb-6">{searchQuery ? '🔍' : '🤝'}</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {searchQuery ? 'No results found' : 'No collaborators yet'}
            </h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">
              {searchQuery
                ? `No collaborators match "${searchQuery}"`
                : 'Start collaborating with professionals in your pool!'}
            </p>
            {!searchQuery && (
              <Link href="/matches" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg inline-block active:scale-95">
                Browse Matches
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollaborators.map((collab) => {
              const collaborator = getCollaboratorInfo(collab)
              return (
                <div
                  key={collab.id}
                  className="group flex flex-col bg-white border border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-xl hover:border-primary-500/10 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="p-7 flex-1">
                    {/* Header with Consistent Color Status */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1 min-w-0 pr-6">
                        <Link href={`/user/${collaborator.username || collaborator.id}`}>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors truncate tracking-tight">
                            {collaborator.full_name}
                          </h3>
                        </Link>
                        {collaborator.job_title && (
                          <p className="text-sm font-semibold text-slate-500 mt-1 truncate">
                            {collaborator.job_title}
                          </p>
                        )}
                      </div>
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm flex-shrink-0">
                        <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* High-Contrast Info Links */}
                    <div className="space-y-2.5 mb-6">
                      {collaborator.company && (
                        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600">
                          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {collaborator.company}
                        </div>
                      )}

                      {collaborator.location && (
                        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400">
                          <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {collaborator.location}
                        </div>
                      )}

                      {collaborator.email && (
                        <div className="flex items-center gap-2.5 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">
                          <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {collaborator.email}
                        </div>
                      )}
                    </div>

                    {/* Message Protocol Status */}
                    {collab.message_stats && (
                      <div className="pt-4 border-t border-slate-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {collab.message_stats.total} total
                          </span>
                          {collab.message_stats.unread > 0 && (
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-black rounded uppercase tracking-wider">
                              {collab.message_stats.unread} new
                            </span>
                          )}
                        </div>
                        {collab.message_stats.last_message && (
                          <p className="text-[11px] font-medium text-slate-600 truncate italic">
                            {collab.message_stats.last_message.is_from_me ? 'You: ' : ''}
                            {collab.message_stats.last_message.preview?.startsWith('{')
                              ? '🔒 Encrypted message'
                              : collab.message_stats.last_message.preview || 'Start a conversation'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Foot Action Hub - Active Brand Buttons & Normal Labels */}
                  <div className="px-7 py-5 bg-slate-50/30 border-t border-slate-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href={`/user/${collaborator.username || collaborator.id}`}
                        className="flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-primary-700 shadow-md active:scale-95"
                      >
                        View Profile
                      </Link>
                      <Link
                        href={`/chat/${collaborator.username || collaborator.id}`}
                        className="relative flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-blue-700 shadow-md active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                        {collab.message_stats?.unread > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                            {collab.message_stats.unread > 9 ? '9+' : collab.message_stats.unread}
                          </span>
                        )}
                      </Link>
                    </div>
                    <button
                      onClick={() => removeCollaborator(collab.id, collaborator.full_name)}
                      disabled={removing === collab.id}
                      className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-2"
                    >
                      {removing === collab.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-rose-600"></div>
                      ) : (
                        <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                      {removing === collab.id ? 'Removing...' : 'Remove Connection'}
                    </button>
                    <div className="text-center pt-1">
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                        Since {new Date(collab.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
