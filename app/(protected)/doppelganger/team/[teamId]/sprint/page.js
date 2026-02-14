'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDoppelgangerStore } from '@/store/doppelgangerStore'
import { ProgressTracker, LogForm, ProblemStatement } from '@/components/doppelganger'

export default function SprintPage() {
  const params = useParams()
  const teamId = params.teamId
  const [initialLoading, setInitialLoading] = useState(true)

  const {
    team,
    logs,
    loadingTeam,
    loadingLogs,
    error,
    fetchTeam,
    submitLog,
    clearError
  } = useDoppelgangerStore()

  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId).finally(() => setInitialLoading(false))
    }
  }, [teamId, fetchTeam])

  const handleSubmitLog = async (checkpointNumber, title, content) => {
    const result = await submitLog(teamId, checkpointNumber, title, content)
    return !!result
  }

  if (initialLoading || (loadingTeam && !team)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">SYNCHRONIZING COMMAND CENTER...</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-6">SIGNAL LOST</h2>
          <Link href="/doppelganger" className="text-purple-400 font-bold tracking-widest uppercase text-xs hover:text-purple-300 transition-colors">
            RETURN TO HANGAR
          </Link>
        </div>
      </div>
    )
  }

  // Use admin-controlled status as source of truth
  const eventStatus = team.event?.status
  const isSprintActive = eventStatus === 'active'
  const sprintNotStarted = eventStatus === 'registration' || eventStatus === 'draft'

  // For display purposes only
  const now = new Date()
  const sprintStart = new Date(team.event?.sprint_start)
  const sprintEnd = new Date(team.event?.sprint_end)

  const completedCheckpoints = logs.map(l => l.checkpoint_number)
  const nextCheckpoint = [1, 2, 3, 4, 5].find(n => !completedCheckpoints.includes(n)) || null

  return (
    <div className="min-h-screen py-24 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <Link href={`/doppelganger/team/${teamId}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors group">
              <div className="p-2 glass-dark rounded-xl border border-white/5 group-hover:border-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-black text-[10px] tracking-[0.2em] uppercase">ABORT TO DASHBOARD</span>
            </Link>

            <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase mb-6">
              COMMAND <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">CENTER</span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black text-white uppercase tracking-widest italic">{team.name}</div>
              <div className="w-[1px] h-4 bg-white/10"></div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{team.event?.name}</div>
            </div>
          </div>

          <div className="glass-dark rounded-[2rem] p-6 border border-white/5 flex items-center gap-8">
            {isSprintActive && (
              <>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">SPRINT_UPTIME</p>
                  <div className="text-3xl font-black text-white italic tracking-tighter">
                    {Math.floor((sprintEnd - now) / (1000 * 60 * 60))}H {Math.floor(((sprintEnd - now) % (1000 * 60 * 60)) / (1000 * 60))}M
                  </div>
                </div>
                <div className="w-[1px] h-12 bg-white/5"></div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">SIGNAL_STATUS</p>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-black text-green-500 uppercase tracking-widest italic">ACTIVE_TRANSMISSION</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-12 p-6 glass-dark border border-red-500/20 rounded-[2rem] text-red-500 flex items-center justify-between animate-shake">
            <span className="text-xs font-black uppercase tracking-[0.2em]">ERROR_CAUGHT: {error}</span>
            <button onClick={clearError} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {sprintNotStarted && (
          <div className="mb-12 glass-dark rounded-[2.5rem] p-12 border border-orange-500/20 bg-orange-500/5 text-center">
            <div className="w-20 h-20 bg-orange-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-orange-500/20 animate-pulse">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">AWAITING COMMENCEMENT</h2>
            <p className="text-gray-500 font-medium max-w-md mx-auto italic uppercase text-[10px] tracking-widest">
              The sprint stream begins on {sprintStart.toLocaleDateString()} at {sprintStart.toLocaleTimeString()}. Prepare your environment.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-8">
            {/* Log form as Upload Terminal */}
            {isSprintActive && nextCheckpoint && (
              <div className="animate-fadeInUp">
                <LogForm
                  checkpointNumber={nextCheckpoint}
                  onSubmit={handleSubmitLog}
                  disabled={loadingLogs}
                />
              </div>
            )}

            {/* Submitted Stream */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 px-8">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic">SIGNAL_FEED</h2>
                <div className="h-[1px] flex-1 bg-white/5"></div>
              </div>

              {logs.length === 0 ? (
                <div className="glass-dark rounded-[2.5rem] p-16 border border-white/5 text-center">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-xl opacity-20 italic">🚫</div>
                  <p className="text-gray-600 font-bold uppercase tracking-[0.2em] italic text-[10px]">NO SIGNALS REGISTERED IN CURRENT STREAM</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {logs.map((log, i) => (
                    <div key={log.id} className="glass-dark rounded-[2.5rem] p-8 border border-white/5 hover:border-white/10 transition-all group animate-fadeInUp" style={{ animationDelay: `${0.1 * i}s` }}>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-xs text-purple-400 border border-white/5 group-hover:bg-purple-500/10 group-hover:text-purple-300 transition-colors">
                            0{log.checkpoint_number}
                          </div>
                          <div>
                            <h3 className="font-black text-white italic tracking-tight uppercase group-hover:text-purple-400 transition-colors">{log.title}</h3>
                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">ENCRYPTED_SIGNAL // {new Date(log.submitted_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        {log.is_late && (
                          <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                            <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">DELAYED_SIGNAL</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm font-medium leading-relaxed italic">{log.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mission Parameters HUD */}
            <div className="relative group overflow-hidden rounded-[2.5rem] animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="absolute top-8 left-8 z-20">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] italic">MISSION_PARAMETERS</span>
                </div>
              </div>
              <div className="p-1 glass-dark rounded-[2.5rem] border border-white/5">
                <ProblemStatement problem={team.problem_statement} />
              </div>
            </div>
          </div>

          {/* Tactical Sidebar */}
          <div className="lg:col-span-4 space-y-8 sticky top-24">
            <ProgressTracker
              logs={logs}
              requiredLogs={team.event?.required_logs || 5}
              sprintStart={team.event?.sprint_start}
              sprintEnd={team.event?.sprint_end}
            />

            {/* Final Submission Button */}
            <Link href={`/doppelganger/team/${teamId}/submit`}>
              <button className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-sm tracking-[0.3em] uppercase transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-white/5 flex items-center justify-center gap-3 group">
                <svg className="w-6 h-6 animate-pulse group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                INIT_FINAL_DEPLOY
              </button>
            </Link>

            {/* Tactical Intel */}
            <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">SIGNAL_MONITOR</h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="text-gray-600 uppercase">RELIABILITY_INDEX</span>
                    <span className="text-purple-400">98.4%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-[98.4%] h-full bg-purple-500 animate-[pulse_3s_infinite]"></div>
                  </div>
                </div>

                <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight leading-relaxed italic">
                    Multiple signal points detected. All transmissions are subject to AI-resonance analysis during the final scoring protocol.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
