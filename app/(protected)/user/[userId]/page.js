'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

  useEffect(() => {
    if (params.userId) {
      fetchProfile()
    }
  }, [params.userId])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${params.userId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile')
      }

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
      fetchProfile() // Refresh to show unlocked contact info
    }, 3000)
  }

  const handleRemoveConnection = async () => {
    if (!profile?.collabStatus?.collabId) return

    if (!confirm(`Are you sure you want to remove your connection with ${profile.profile.full_name}? This will delete all your messages and you'll need to send a new request to collaborate again.`)) {
      return
    }

    setRemoving(true)

    try {
      const response = await fetch(`/api/collabs/${profile.collabStatus.collabId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove connection')
      }

      // Refresh profile to show updated state
      await fetchProfile()
      alert('Connection removed successfully')
    } catch (err) {
      alert('Error removing connection: ' + err.message)
    } finally {
      setRemoving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    )
  }

  const { profile: userData, isCollaborating, collabStatus, canViewContactInfo } = profile

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showAnimation && <CollabAnimation onComplete={() => setShowAnimation(false)} />}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{userData.full_name}</h1>
          {userData.job_title && userData.company && (
            <p className="text-lg text-gray-600 mt-1">
              {userData.job_title} at {userData.company}
            </p>
          )}
          {userData.location && (
            <p className="text-gray-500 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {userData.location}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <CollabButton
            userId={params.userId}
            collabStatus={collabStatus}
            onCollabSuccess={handleCollabSuccess}
          />
          {isCollaborating && (
            <button
              onClick={handleRemoveConnection}
              disabled={removing}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {removing ? (
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
          )}
        </div>
      </div>

      {/* Bio */}
      {userData.bio && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
          <p className="text-gray-700 whitespace-pre-line">{userData.bio}</p>
        </div>
      )}

      {/* Keywords/Interests */}
      <div className={`card mb-6 ${!canViewContactInfo ? 'border-2 border-amber-200 bg-amber-50' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Professional Keywords ({userData.total_keywords})
          </h2>
          {!canViewContactInfo && userData.keywords && userData.keywords.length > 4 && (
            <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Showing {4} of {userData.total_keywords}
            </span>
          )}
        </div>
        {userData.keywords && userData.keywords.length > 0 ? (
          <>
            <KeywordDisplay keywords={canViewContactInfo ? userData.keywords : userData.keywords.slice(0, 4)} />
            {!canViewContactInfo && userData.keywords.length > 4 && (
              <p className="text-sm text-amber-700 mt-3 text-center">
                🔒 Collaborate to see all {userData.total_keywords} keywords
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-500">No keywords available</p>
        )}
      </div>

      {/* Contact Information */}
      <div className={`card ${!canViewContactInfo ? 'border-2 border-amber-200 bg-amber-50' : 'border-2 border-green-200 bg-green-50'}`}>
        <div className="flex items-start gap-3 mb-4">
          <svg
            className={`w-6 h-6 flex-shrink-0 mt-0.5 ${canViewContactInfo ? 'text-green-600' : 'text-amber-600'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {canViewContactInfo ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            )}
          </svg>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
            <p className={`text-sm mt-1 ${canViewContactInfo ? 'text-green-700' : 'text-amber-700'}`}>
              {canViewContactInfo
                ? 'You are collaborating with this user'
                : 'Start a collaboration to view contact details'}
            </p>
          </div>
        </div>

        {canViewContactInfo ? (
          <div className="space-y-3">
            {userData.email && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <a href={`mailto:${userData.email}`} className="text-primary-600 hover:underline">
                  {userData.email}
                </a>
              </div>
            )}

            {userData.phone_number && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <a href={`tel:${userData.phone_number}`} className="text-primary-600 hover:underline">
                  {userData.phone_number}
                </a>
              </div>
            )}

            {userData.linkedin_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <a href={userData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  {userData.linkedin_url}
                </a>
              </div>
            )}

            {userData.website && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <a href={userData.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  {userData.website}
                </a>
              </div>
            )}

            {(userData.twitter_url || userData.github_url) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {userData.twitter_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter/X</label>
                    <a href={userData.twitter_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      @{userData.twitter_url.split('/').pop()}
                    </a>
                  </div>
                )}

                {userData.github_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                    <a href={userData.github_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      @{userData.github_url.split('/').pop()}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-amber-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-gray-600 font-medium">Contact information is private</p>
            <p className="text-gray-500 text-sm mt-1">
              Start a collaboration to unlock email, phone, and social links
            </p>
          </div>
        )}
      </div>

      {/* Member Since */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Member since {new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </div>
    </div>
  )
}
