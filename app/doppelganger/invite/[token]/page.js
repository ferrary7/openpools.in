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
      // Check if user is logged in
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      // If user came back after signup/onboarding with this token, clear the stored token
      if (user) {
        const storedToken = localStorage.getItem('dg_pending_invite')
        if (storedToken === token) {
          localStorage.removeItem('dg_pending_invite')
        }
      }

      // Fetch invite details
      try {
        const res = await fetch(`/api/doppelganger/invite/${token}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error)
        } else {
          setInvite(data.invite)
        }
      } catch (err) {
        setError('SIGNAL_DECODER_FAILURE')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      init()
    }
  }, [token])

  const handleAccept = async () => {
    // If not logged in, store token and redirect to signup
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
      setError('SYNC_PROTOCOL_FAILED')
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
      setError('SIGNAL_REJECTION_ERROR')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-black tracking-widest uppercase text-xs italic">DECODING INCOMING SIGNAL...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-shake">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">SIGNAL_DECODE_ERR</h1>
          <p className="text-gray-500 font-medium mb-10 italic uppercase text-[10px] tracking-widest leading-relaxed">{error}</p>
          <Link href="/doppelganger">
            <button className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-gray-100 transition-all">
              RETURN_TO_HANGAR
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030303] py-24 animate-fadeIn flex items-center justify-center">
      <div className="max-w-xl w-full mx-auto px-6">
        <div className="glass-dark rounded-[3rem] border border-white/5 overflow-hidden relative group">
          {/* Animated Background Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full group-hover:bg-purple-500/10 transition-all duration-1000"></div>

          <div className="bg-white/5 border-b border-white/5 px-8 pt-12 pb-10 text-center relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/20">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] mb-2 italic">SIGNAL_INTERCEPTED</h3>
            <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">{invite.eventName}</h1>
          </div>

          <div className="p-8 md:p-12 relative z-10 text-center">
            <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-8 mb-10 shadow-inner">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-3">SQUAD_IDENTIFIED</p>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">{invite.teamName}</h2>
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest italic">ENLISTMENT REQUESTED BY {invite.inviterName}</p>
              </div>
            </div>

            {/* Show signup hint for non-logged-in users */}
            {!isLoggedIn && (
              <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">
                  NEW_RECRUIT_DETECTED — SIGNUP REQUIRED TO JOIN SQUAD
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-sm tracking-[0.2em] uppercase hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl shadow-white/5"
              >
                {accepting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    SYNCING_PROTOCOL...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {isLoggedIn ? 'CONFIRM_ENLISTMENT' : 'SIGNUP_&_JOIN'}
                  </>
                )}
              </button>

              <button
                onClick={handleDecline}
                className="w-full py-4 text-gray-600 font-black text-[10px] tracking-[0.3em] uppercase hover:text-white transition-opacity"
              >
                REJECT_SIGNAL
              </button>
            </div>

            <div className="mt-12 flex items-center gap-4 opacity-20">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
              <span className="text-[8px] font-black text-white uppercase tracking-[0.5em] italic">SECURE_TRANSMISSION</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
