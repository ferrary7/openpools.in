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

        {/* Prize notice */}
        <div className="mb-8 p-5 glass-dark rounded-2xl border border-yellow-500/20 animate-fadeInUp">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-yellow-400 mb-1">Prize Money — Top 3 Teams</h3>
              <div className="flex flex-wrap gap-4 mb-3">
                {[
                  { rank: '1st', prize: '₹10,000', color: 'text-yellow-400' },
                  { rank: '2nd', prize: '₹7,000', color: 'text-gray-300' },
                  { rank: '3rd', prize: '₹3,000', color: 'text-orange-400' },
                ].map(({ rank, prize, color }) => (
                  <div key={rank} className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">{rank}</span>
                    <span className={`text-sm font-black ${color}`}>{prize}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-yellow-400/60">
                Winning teams will be contacted via email, receive a digital certificate, and the prize money will be transferred directly to each team.
              </p>
            </div>
          </div>
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
