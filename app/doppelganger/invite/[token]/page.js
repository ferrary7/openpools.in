'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token

  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      if (user) {
        const storedToken = localStorage.getItem('dg_pending_invite')
        if (storedToken === token) {
          localStorage.removeItem('dg_pending_invite')
        }
      }

      try {
        const res = await fetch(`/api/doppelganger/invite/${token}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error)
        } else {
          setInvite(data.invite)
        }
      } catch (err) {
        setError('Failed to load invite details')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      init()
    }
  }, [token])

  const handleAccept = async () => {
    if (!isLoggedIn) {
      localStorage.setItem('dg_pending_invite', token)
      router.push('/signup')
      return
    }

    setAccepting(true)
    setError(null)

    try {
      const res = await fetch(`/api/doppelganger/invite/${token}`, {
        method: 'POST'
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        router.push(`/doppelganger/team/${encodeURIComponent(data.teamName)}`)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setAccepting(false)
    }
  }

  const handleDecline = async () => {
    try {
      await fetch(`/api/doppelganger/invite/${token}`, {
        method: 'DELETE'
      })
      router.push('/doppelganger')
    } catch (err) {
      setError('Could not decline the invite')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-sm mx-auto px-6 text-center">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invalid Invite</h1>
          <p className="text-sm text-gray-500 mb-8">{error}</p>
          <Link href="/doppelganger">
            <button className="px-6 py-3 bg-white/5 text-white rounded-xl text-sm font-medium border border-white/10 hover:bg-white/10 transition-all">
              Back to Event
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 md:py-24 flex items-center justify-center animate-fadeIn">
      <div className="max-w-md w-full mx-auto px-6">
        <div className="glass-dark rounded-[2.5rem] border border-white/5 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-10 pb-8 text-center border-b border-white/5">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 mb-1">You've been invited to join</p>
            <h1 className="text-2xl font-bold text-white">{invite.teamName}</h1>
          </div>

          {/* Body */}
          <div className="p-8 text-center">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                  {invite.inviterName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{invite.inviterName}</p>
                  <p className="text-xs text-gray-500">invited you</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Event: <span className="text-gray-400">{invite.eventName}</span>
              </p>
            </div>

            {/* Error inside form */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {!isLoggedIn && (
              <div className="mb-5 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                <p className="text-xs text-primary-400 font-medium">
                  You'll need to create an account to join the team
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full py-4 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-400 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {accepting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Joining...
                  </>
                ) : (
                  isLoggedIn ? 'Accept & Join Team' : 'Sign Up & Join'
                )}
              </button>

              <button
                onClick={handleDecline}
                className="w-full py-3 text-gray-500 text-sm font-medium hover:text-white transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
