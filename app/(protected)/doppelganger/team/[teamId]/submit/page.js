'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDoppelgangerStore } from '@/store/doppelgangerStore'
import { SubmissionForm, ProblemStatement } from '@/components/doppelganger'

export default function SubmitPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.teamId
  const [initialLoading, setInitialLoading] = useState(true)

  const {
    team,
    submission,
    loadingTeam,
    loading,
    error,
    fetchTeam,
    submitProject,
    clearError
  } = useDoppelgangerStore()

  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId).finally(() => setInitialLoading(false))
    }
  }, [teamId, fetchTeam])

  const handleSubmit = async (data) => {
    await submitProject(teamId, data)
  }

  if (initialLoading || (loadingTeam && !team)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-black tracking-widest uppercase text-xs">INITIALIZING DEPLOYMENT PROTOCOL...</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-6">SIGNAL_LOST</h2>
          <Link href="/doppelganger" className="text-purple-400 font-bold tracking-widest uppercase text-xs hover:text-purple-300 transition-colors">
            RETURN_TO_HANGAR
          </Link>
        </div>
      </div>
    )
  }

  if (!team.problem_statement) {
    return (
      <div className="min-h-screen py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/10 opacity-20 italic text-2xl">🚫</div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">DEPLOYMENT_BLOCKED</h1>
          <p className="text-gray-500 font-medium mb-12 italic uppercase text-[10px] tracking-widest leading-relaxed">
            Signal parameters missing. You must generate a mission statement before final deployment protocols can be initialized.
          </p>
          <Link href={`/doppelganger/team/${teamId}`}>
            <button className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-gray-100 transition-all">
              RETURN_TO_COMMAND
            </button>
          </Link>
        </div>
      </div>
    )
  }

  // Use admin-controlled status as source of truth
  const eventStatus = team.event?.status
  const isPastDeadline = eventStatus === 'judging' || eventStatus === 'completed'

  // For display purposes only
  const now = new Date()
  const deadline = new Date(team.event?.submission_deadline)

  return (
    <div className="min-h-screen py-24 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link href={`/doppelganger/team/${teamId}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-10 transition-colors group">
          <div className="p-2 glass-dark rounded-xl border border-white/5 group-hover:border-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="font-black text-[10px] tracking-[0.2em] uppercase">ABORT_TO_DASHBOARD</span>
        </Link>

        {/* Header Section */}
        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase mb-6">
            DEPLOYMENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">PROTOCOL</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black text-white uppercase tracking-widest italic">{team.name}</div>
            <div className="w-[1px] h-4 bg-white/10"></div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">FINAL_TRANSMISSION_SEQUENCE</div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-12 p-6 glass-dark border border-red-500/20 rounded-[2rem] text-red-500 flex items-center justify-between animate-shake">
            <span className="text-xs font-black uppercase tracking-[0.2em]">SECURITY_BREACH: {error}</span>
            <button onClick={clearError} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Deadline HUD */}
        {!isPastDeadline && (
          <div className="mb-12 glass-dark rounded-[2.5rem] p-8 border border-white/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <span className="text-9xl font-black italic tracking-tighter">TIMER</span>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">DEPLOYMENT_WINDOW_CLOSING</h3>
                  <p className="text-white font-black uppercase tracking-widest text-sm italic">
                    {deadline.toLocaleDateString()} // {deadline.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-4xl font-black text-purple-500 italic tracking-tighter">
                  {Math.floor((deadline - now) / (1000 * 60 * 60))}H {Math.floor(((deadline - now) % (1000 * 60 * 60)) / (1000 * 60))}M
                </div>
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">UNTIL_WINDOW_TERMINATION</p>
              </div>
            </div>
          </div>
        )}

        {isPastDeadline && (
          <div className="mb-12 glass-dark border border-red-500/20 rounded-[2rem] p-8 text-center">
            <h2 className="text-2xl font-black text-red-500 italic tracking-tighter uppercase">PROTOCOL_EXPIRED</h2>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-2">DEPLOYMENT WINDOW HAS BEEN TERMINATED BY COMMAND</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main content */}
          <div className="lg:col-span-8">
            <SubmissionForm
              submission={submission}
              onSubmit={handleSubmit}
              disabled={isPastDeadline || loading}
            />
          </div>

          {/* Sidebar HUD */}
          <div className="lg:col-span-4 space-y-8">
            {/* Mission Recap */}
            <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">CHALLENGE_SYNC</h3>
                <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest italic animate-pulse">VERIFIED</span>
              </div>
              <h4 className="text-white font-black uppercase tracking-tight italic mb-3 group-hover:text-purple-400 transition-colors">
                {team.problem_statement.title}
              </h4>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-tight">
                Final deploy must resonate with the initial AI signal parameters to achieve maximum synchronization.
              </p>
            </div>

            {/* Scoring HUD */}
            <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">SCORING_VECTORS</h3>
              <div className="space-y-6">
                {[
                  { label: 'SIGNAL_SYNERGY', value: '25%' },
                  { label: 'LOG_CONSISTENCY', value: '20%' },
                  { label: 'TECHNICAL_RESONANCE', value: '35%' },
                  { label: 'SOCIAL_AMPLIFICATION', value: '20%' }
                ].map((item) => (
                  <div key={item.label} className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black">
                      <span className="text-gray-600 uppercase tracking-widest">{item.label}</span>
                      <span className="text-purple-400">{item.value}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: item.value }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hall of Fame Link */}
            <Link href="/doppelganger/leaderboard">
              <button className="w-full py-6 glass-dark border border-white/5 text-gray-400 rounded-[2rem] font-black text-xs tracking-[0.2em] uppercase hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-3 group">
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                VIEW_HALL_OF_FAME
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
