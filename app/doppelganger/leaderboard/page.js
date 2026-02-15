'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDoppelgangerStore } from '@/store/doppelgangerStore'
import { Leaderboard, Confetti } from '@/components/doppelganger'

export default function LeaderboardPage() {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const {
    event,
    leaderboard,
    loadingLeaderboard,
    loading,
    fetchEvent,
    fetchLeaderboard
  } = useDoppelgangerStore()

  useEffect(() => {
    fetchEvent().then((evt) => {
      if (evt) {
        fetchLeaderboard(evt.id)

        // Show confetti only once per completed event
        if (evt.status === 'completed') {
          const confettiKey = `confetti_shown_${evt.id}`
          if (!sessionStorage.getItem(confettiKey)) {
            setShowConfetti(true)
            sessionStorage.setItem(confettiKey, 'true')
          }
        }
      } else {
        router.push('/')
      }
    }).finally(() => setInitialLoading(false))
  }, [fetchEvent, fetchLeaderboard, router])

  if (initialLoading || (loading && !event)) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">SYNCHRONIZING BOARD...</p>
        </div>
      </div>
    )
  }

  const isCompleted = event?.status === 'completed'
  const isJudging = event?.status === 'judging'

  return (
    <div className="min-h-screen bg-[#030303] py-24 pb-32 animate-fadeIn">
      {/* Confetti celebration for completed events (only once per session) */}
      {showConfetti && <Confetti duration={6000} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results Announced Banner */}
        {isCompleted && (
          <div className="mb-8 p-6 rounded-[2rem] bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 animate-fadeInUp">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🏆</span>
              </div>
              <div>
                <h3 className="text-green-400 font-black text-lg uppercase tracking-wider">Results Announced</h3>
                <p className="text-green-400/70 text-sm mt-1">The competition has ended. Congratulations to all winners!</p>
              </div>
            </div>
          </div>
        )}

        {/* Judging in Progress Banner */}
        {isJudging && (
          <div className="mb-8 p-6 rounded-[2rem] bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 animate-fadeInUp">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-amber-400 font-black text-lg uppercase tracking-wider">Judging In Progress</h3>
                <p className="text-amber-400/70 text-sm mt-1">Submissions are being evaluated. Final results will be announced soon.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <Link href={isCompleted ? "/dashboard" : "/doppelganger"} className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors group">
              <div className="p-2 glass-dark rounded-xl border border-white/5 group-hover:border-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-black text-[10px] tracking-[0.2em] uppercase">{isCompleted ? "BACK TO DASHBOARD" : "BACK TO HANGAR"}</span>
            </Link>

            <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase mb-6">
              {isCompleted ? (
                <>FINAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">RESULTS</span></>
              ) : (
                <>HALL <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">OF FAME</span></>
              )}
            </h1>
            <p className="text-gray-400 font-medium text-lg leading-relaxed italic">
              {isCompleted
                ? "The competition has concluded. Here are the final standings."
                : "Real-time signal analysis of the top performing squads. Only the strongest resonance survives the board."}
            </p>
          </div>

          <div className="glass-dark rounded-[2rem] p-6 border border-white/5 flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">TOTAL SIGNALS</p>
              <div className="text-3xl font-black text-white italic tracking-tighter">{leaderboard?.length || 0}</div>
            </div>
            <div className="w-[1px] h-12 bg-white/5"></div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">STATUS</p>
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-black text-green-500 uppercase tracking-widest">FINAL</span>
                  </>
                ) : isJudging ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-xs font-black text-amber-500 uppercase tracking-widest">JUDGING</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-black text-green-500 uppercase tracking-widest">LIVE</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scoring Protocol Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { l: 'SYN', title: 'SYNERGY', desc: 'Skill resonance balance', weight: '25%' },
            { l: 'CON', title: 'CONSISTENCY', desc: 'Log submission streak', weight: '20%' },
            { l: 'TEC', title: 'TECHNICAL', desc: 'Execution quality/AI fit', weight: '35%' },
            { l: 'SOC', title: 'SOCIAL', desc: 'Viral signal strength', weight: '20%' }
          ].map((item) => (
            <div key={item.l} className="glass-dark rounded-2xl p-4 border border-white/5 hover:bg-white/5 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[8px] font-black text-purple-500 tracking-widest">{item.l}</span>
                <span className="text-[10px] font-black text-gray-600">{item.weight}</span>
              </div>
              <h4 className="text-[10px] font-black text-white mb-1 uppercase tracking-tight">{item.title}</h4>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Board */}
        <div className="relative">
          <Leaderboard teams={leaderboard} loading={loadingLeaderboard} />

          {/* Subtle background text */}
          <div className="absolute -bottom-20 left-0 w-full text-center pointer-events-none opacity-[0.02] overflow-hidden">
            <span className="text-[10rem] font-black text-white italic tracking-tighter uppercase whitespace-nowrap">
              SIGNAL SPRINT LIVE BOARD
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
