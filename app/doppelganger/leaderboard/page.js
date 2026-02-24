'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useDoppelgangerStore } from '@/store/doppelgangerStore'
import { Leaderboard, Confetti } from '@/components/doppelganger'

export default function LeaderboardPage() {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const prevEventStatus = useRef(null)
  const {
    event,
    leaderboard,
    loadingLeaderboard,
    loading,
    fetchEvent,
    fetchLeaderboard,
    startLeaderboardPolling,
    stopLeaderboardPolling
  } = useDoppelgangerStore()

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      const evt = await fetchEvent()
      if (evt) {
        const lb = await fetchLeaderboard(evt.id)
        startLeaderboardPolling(evt.id)
        prevEventStatus.current = evt.status

        if (evt.status === 'completed' && user && lb?.length >= 1) {
          const top3 = lb.slice(0, 3)
          const isInTop3 = top3.some(team => team.memberUserIds?.includes(user.id))
          if (isInTop3) setShowConfetti(true)
        }
      } else {
        router.push('/')
      }
      setInitialLoading(false)
    }
    init()

    return () => stopLeaderboardPolling()
  }, [fetchEvent, fetchLeaderboard, startLeaderboardPolling, stopLeaderboardPolling, router])

  // Watch for event status changing to 'completed' via polling
  useEffect(() => {
    if (!event || !currentUserId) return

    if (event.status === 'completed' && prevEventStatus.current && prevEventStatus.current !== 'completed') {
      // Status just changed to completed — check if user is in top 3
      const top3 = leaderboard?.slice(0, 3) || []
      const isInTop3 = top3.some(team => team.memberUserIds?.includes(currentUserId))
      if (isInTop3) setShowConfetti(true)
    }

    prevEventStatus.current = event.status
  }, [event?.status, leaderboard, currentUserId])

  if (initialLoading || (loading && !event)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  const isCompleted = event?.status === 'completed'
  const isJudging = event?.status === 'judging'

  return (
    <div className="min-h-screen py-12 md:py-20 pb-32 animate-fadeIn">
      {showConfetti && <Confetti duration={6000} />}

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back link */}
        <Link
          href={isCompleted ? '/dashboard' : '/doppelganger'}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-10 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {isCompleted ? 'Back to dashboard' : 'Back to event'}
        </Link>

        {/* Status banners */}
        {isCompleted && (
          <div className="mb-8 p-5 glass-dark rounded-2xl border border-emerald-500/20 animate-fadeInUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-400">Results Announced</h3>
                <p className="text-xs text-emerald-400/60 mt-0.5">The competition has ended. Congratulations to all winners!</p>
              </div>
            </div>
          </div>
        )}

        {isJudging && (
          <div className="mb-8 p-5 glass-dark rounded-2xl border border-amber-500/20 animate-fadeInUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-400">Judging In Progress</h3>
                <p className="text-xs text-amber-400/60 mt-0.5">Submissions are being evaluated. Results will be announced soon.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            {isCompleted ? 'Final Results' : 'Leaderboard'}
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-500 text-sm">
              {isCompleted
                ? 'The competition has concluded. Here are the final standings.'
                : 'Live rankings across all participating teams.'}
            </p>
            <div className="flex items-center gap-2 ml-auto shrink-0">
              {isCompleted ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-medium text-emerald-400">Final</span>
                </>
              ) : isJudging ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-xs font-medium text-amber-400">Judging</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-medium text-emerald-400">Live</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scoring categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Signal Synergy', weight: '25%', desc: 'Skill alignment' },
            { label: 'Consistency', weight: '20%', desc: 'Progress updates' },
            { label: 'Technical', weight: '35%', desc: 'Execution quality' },
            { label: 'Social Proof', weight: '20%', desc: 'Community reach' }
          ].map((item) => (
            <div key={item.label} className="glass-dark rounded-xl p-4 border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-400">{item.label}</span>
                <span className="text-xs font-bold text-primary-400">{item.weight}</span>
              </div>
              <p className="text-[10px] text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs text-gray-600">{leaderboard?.length || 0} teams</span>
        </div>

        {/* Leaderboard */}
        <Leaderboard teams={leaderboard} loading={loadingLeaderboard} />
      </div>
    </div>
  )
}
