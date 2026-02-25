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
    clearError,
    startPolling,
    stopPolling
  } = useDoppelgangerStore()

  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId).finally(() => setInitialLoading(false))
      startPolling(teamId)
    }

    return () => stopPolling()
  }, [teamId, fetchTeam, startPolling, stopPolling])

  const handleSubmitLog = async (checkpointNumber, title, content) => {
    const result = await submitLog(teamId, checkpointNumber, title, content)
    return !!result
  }

  if (initialLoading || (loadingTeam && !team)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-xl font-bold text-white mb-3">Team not found</h2>
          <Link href="/doppelganger" className="text-primary-400 text-sm font-medium hover:text-primary-300 transition-colors">
            Back to event
          </Link>
        </div>
      </div>
    )
  }

  const eventStatus = team.event?.status
  const isSprintActive = eventStatus === 'active'
  const sprintNotStarted = eventStatus === 'registration' || eventStatus === 'draft'
  const activeCheckpoint = team.event?.active_checkpoint

  const now = new Date()
  const sprintStart = new Date(team.event?.sprint_start)
  const sprintEnd = new Date(team.event?.sprint_end)

  const completedCheckpoints = logs.map(l => l.checkpoint_number)
  const hasSubmittedActiveCheckpoint = activeCheckpoint ? completedCheckpoints.includes(activeCheckpoint) : false
  const hasSubmittedFinalLog = completedCheckpoints.includes(5)

  const missedCheckpoints = activeCheckpoint
    ? Array.from({ length: activeCheckpoint - 1 }, (_, i) => i + 1).filter(n => !completedCheckpoints.includes(n))
    : []

  const canSubmitLog = isSprintActive && activeCheckpoint && !hasSubmittedActiveCheckpoint

  return (
    <div className="min-h-screen py-12 md:py-20 animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <Link href={`/doppelganger/team/${teamId}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to dashboard
            </Link>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">Sprint</h1>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-400">{team.name}</span>
              <span className="text-gray-700">·</span>
              <span className="text-gray-500">{team.event?.name}</span>
            </div>
          </div>

          {isSprintActive && (
            <div className="glass-dark rounded-2xl px-6 py-4 border border-white/5 flex items-center gap-6">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Time Left</p>
                <p className="text-2xl font-bold text-white">
                  {Math.max(0, Math.floor((sprintEnd - now) / (1000 * 60 * 60)))}h {Math.floor(((sprintEnd - now) % (1000 * 60 * 60)) / (1000 * 60))}m
                </p>
              </div>
              <div className="w-px h-10 bg-white/5"></div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-emerald-400">Live</span>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center justify-between">
            <span className="text-sm font-medium">{error}</span>
            <button onClick={clearError} className="p-1 hover:bg-red-500/20 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Sprint not started */}
        {sprintNotStarted && (
          <div className="mb-10 glass-dark rounded-[2.5rem] p-10 border border-amber-500/15 text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-500/20">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Sprint hasn't started yet</h2>
            <p className="text-sm text-gray-500">
              Begins on {sprintStart.toLocaleDateString()} at {sprintStart.toLocaleTimeString()}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main */}
          <div className="lg:col-span-8 space-y-6">
            {/* Log form */}
            {canSubmitLog && (
              <div className="space-y-4">
                {missedCheckpoints.length > 0 && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/15 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-400">Missed checkpoints</p>
                      <p className="text-xs text-amber-400/70 mt-0.5">
                        You missed checkpoint{missedCheckpoints.length > 1 ? 's' : ''} {missedCheckpoints.join(', ')}. Submit checkpoint {activeCheckpoint} now.
                      </p>
                    </div>
                  </div>
                )}
                <LogForm
                  checkpointNumber={activeCheckpoint}
                  onSubmit={handleSubmitLog}
                  disabled={loadingLogs}
                />
              </div>
            )}

            {/* Submitted logs */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Activity Log</h2>

              {logs.length === 0 ? (
                <div className="glass-dark rounded-[2.5rem] p-12 border border-white/5 text-center">
                  {isSprintActive && !activeCheckpoint ? (
                    <>
                      <svg className="w-8 h-8 text-amber-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-500">Waiting for the next checkpoint to open</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">No logs submitted yet</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log, i) => (
                    <div key={log.id} className="glass-dark rounded-[2rem] p-6 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-xs font-bold text-primary-400">
                            {log.checkpoint_number}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-white">{log.title}</h3>
                            <p className="text-[10px] text-gray-600">{new Date(log.submitted_at).toLocaleString()}</p>
                          </div>
                        </div>
                        {log.is_late && (
                          <span className="text-[10px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-md">Late</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{log.content}</p>
                    </div>
                  ))}

                  {isSprintActive && !canSubmitLog && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      {hasSubmittedFinalLog ? (
                        <>
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs text-emerald-400 font-medium">All logs submitted — ready for final submission</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 text-gray-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-bold text-white">
                            {hasSubmittedActiveCheckpoint && activeCheckpoint
                              ? `Checkpoint ${activeCheckpoint} submitted — waiting for next`
                              : 'Waiting for next checkpoint'}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Problem statement */}
            {team.problem_statement && (
              <div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-4">Challenge Details</h2>
                <ProblemStatement problem={team.problem_statement} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <ProgressTracker
              logs={logs}
              requiredLogs={team.event?.required_logs || 5}
              sprintStart={team.event?.sprint_start}
              sprintEnd={team.event?.sprint_end}
            />

            <Link href={`/doppelganger/team/${teamId}/submit`}>
              <button className="w-full py-4 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Submit Project
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
