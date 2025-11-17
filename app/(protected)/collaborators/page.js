'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCollaborators()
  }, [])

  const fetchCollaborators = async () => {
    try {
      const response = await fetch('/api/collabs')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch collaborators')
      }

      // Filter only accepted collaborations
      const activeCollabs = data.active || []
      setCollaborators(activeCollabs)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getCollaboratorInfo = (collab) => {
    // Determine if current user is sender or receiver
    const isSender = collab.sender?.id
    const collaborator = isSender ? collab.receiver : collab.sender
    return collaborator || {}
  }

  const filteredCollaborators = collaborators.filter((collab) => {
    const collaborator = getCollaboratorInfo(collab)
    const searchLower = searchQuery.toLowerCase()
    return (
      collaborator.full_name?.toLowerCase().includes(searchLower) ||
      collaborator.email?.toLowerCase().includes(searchLower) ||
      collaborator.company?.toLowerCase().includes(searchLower) ||
      collaborator.job_title?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading your collaborators...</span>
        </div>
      </div>
    )
  }

  if (error) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Collaborators</h1>
        <p className="text-gray-600 mt-2">
          Professionals you're actively collaborating with
        </p>
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
          <div className="text-sm text-gray-600 mt-1">Companies</div>
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
              <Link
                key={collab.id}
                href={`/user/${collaborator.id}`}
                className="card hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] duration-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
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

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Since {new Date(collab.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-primary-600 font-medium flex items-center gap-1">
                      View Profile
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
