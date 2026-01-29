'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function JoinOrganizationPage() {
  const { token } = useParams()
  const router = useRouter()
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      fetchInvitation()
    }
  }, [token])

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/org/invite/${token}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid or expired invitation')
      }

      setInvitation(data.invitation)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    setAccepting(true)
    setError(null)

    try {
      const response = await fetch(`/api/org/invite/${token}`, {
        method: 'POST'
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation')
      }

      setSuccess(true)

      // Redirect to org dashboard after short delay
      setTimeout(() => {
        router.push(data.redirectUrl || `/org/${invitation.organization.slug}`)
      }, 2000)
    } catch (err) {
      setError(err.message)
      setAccepting(false)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-700'
      case 'recruiter':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/org"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Organizations
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
          <p className="text-gray-500 mb-4">
            You've successfully joined <strong>{invitation.organization.name}</strong>
          </p>
          <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center text-white">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/20 flex items-center justify-center">
            {invitation.organization.logo_url ? (
              <img
                src={invitation.organization.logo_url}
                alt={invitation.organization.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <span className="text-3xl">🏢</span>
            )}
          </div>
          <h1 className="text-xl font-bold">Join {invitation.organization.name}</h1>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              {invitation.invitedBy ? (
                <>
                  <strong>{invitation.invitedBy.name || invitation.invitedBy.email}</strong> has invited you to join
                </>
              ) : (
                'You have been invited to join'
              )}
            </p>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              {invitation.organization.name}
            </p>
          </div>

          {/* Role */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Your role</span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleBadgeColor(invitation.role)}`}>
                {invitation.role}
              </span>
            </div>
          </div>

          {/* Invitation email */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Invited email</span>
              <span className="text-sm font-medium text-gray-900">{invitation.email}</span>
            </div>
          </div>

          {/* Expiry */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">
              This invitation expires on{' '}
              <span className="font-medium">
                {new Date(invitation.expiresAt).toLocaleDateString()}
              </span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-center">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {accepting ? 'Joining...' : 'Accept Invitation'}
            </button>
            <Link
              href="/org"
              className="block w-full py-3 text-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              Decline
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
