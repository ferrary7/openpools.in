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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading your collaborators...</span>
        </div>
      </div>
    )
  }

  if (error && collaborators.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Collaborators</h1>
          <p className="text-gray-600 mt-2">
            Professionals you're actively collaborating with
          </p>
        </div>
        <button
          onClick={() => fetchCollaborators(true)}
          disabled={loading}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 flex items-center gap-1"
        >
          {loading && (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
          )}
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      {collaborators.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collaborators..."
              className="input-field w-full pl-10"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">
            {collaborators.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Active Collaborations</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">
            {filteredCollaborators.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Search Results</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">
            {new Set(collaborators.map(c => {
              const collab = getCollaboratorInfo(c)
              return collab.company
            }).filter(Boolean)).size}
          </div>
          <div className="text-sm text-gray-600 mt-1">Companies Your Collaborators Work With</div>
        </div>
      </div>

      {/* Collaborators Grid */}
      {filteredCollaborators.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">
            {searchQuery ? '🔍' : '🤝'}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No results found' : 'No collaborators yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? `No collaborators match "${searchQuery}"`
              : 'Start collaborating with professionals in your matches!'}
          </p>
          {!searchQuery && (
            <Link href="/matches" className="btn-primary inline-block">
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
                className="card hover:shadow-lg transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {collaborator.full_name}
                    </h3>
                    {collaborator.job_title && (
                      <p className="text-sm text-gray-600 mt-1">
                        {collaborator.job_title}
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  {collaborator.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {collaborator.company}
                    </div>
                  )}

                  {collaborator.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {collaborator.location}
                    </div>
                  )}

                  {collaborator.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {collaborator.email}
                    </div>
                  )}
                </div>

                {/* Footer with Actions */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Since {new Date(collab.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Link
                        href={`/user/${collaborator.username || collaborator.id}`}
                        className="flex-1 text-center px-3 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors text-sm font-medium"
                      >
                        View Profile
                      </Link>
                      <Link
                        href={`/chat/${collaborator.username || collaborator.id}`}
                        className="flex-1 text-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                      </Link>
                    </div>
                    <button
                      onClick={() => removeCollaborator(collab.id, collaborator.full_name)}
                      disabled={removing === collab.id}
                      className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {removing === collab.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          Removing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove Connection
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
