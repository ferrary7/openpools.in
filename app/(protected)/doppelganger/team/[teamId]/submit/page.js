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

  const handleSubmit = async (data) => {
    await submitProject(teamId, data)
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

  if (!team.problem_statement) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/10">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Challenge required</h1>
          <p className="text-sm text-gray-500 mb-8">
            Generate your challenge before submitting a project.
          </p>
          <Link href={`/doppelganger/team/${teamId}`}>
            <button className="px-6 py-3 bg-white/5 text-white rounded-xl text-sm font-medium border border-white/10 hover:bg-white/10 transition-all">
              Go to Dashboard
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const eventStatus = team.event?.status
  const isPastDeadline = eventStatus === 'judging' || eventStatus === 'completed'

  const now = new Date()
  const deadline = new Date(team.event?.submission_deadline)

  return (
    <div className="min-h-screen py-12 md:py-20 animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10">
          <Link href={`/doppelganger/team/${teamId}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </Link>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">Submit</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">{team.name}</span>
            <span className="text-gray-700">·</span>
            <span className="text-gray-500">Final project submission</span>
          </div>
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

        {/* Deadline info */}
        {!isPastDeadline && (
          <div className="mb-8 glass-dark rounded-2xl p-6 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500">Deadline</p>
                <p className="text-sm font-medium text-white">
                  {deadline.toLocaleDateString()} at {deadline.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary-400">
                {Math.max(0, Math.floor((deadline - now) / (1000 * 60 * 60)))}h {Math.floor(((deadline - now) % (1000 * 60 * 60)) / (1000 * 60))}m
              </span>
              <p className="text-[10px] text-gray-600">remaining</p>
            </div>
          </div>
        )}

        {isPastDeadline && !submission && (
          <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <h2 className="text-sm font-semibold text-red-400">Submission deadline has passed</h2>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <SubmissionForm
              submission={submission}
              onSubmit={handleSubmit}
              disabled={isPastDeadline || loading}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Challenge recap */}
            <div className="glass-dark rounded-[2.5rem] p-6 border border-white/5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Your Challenge</h3>
              <h4 className="text-sm font-semibold text-white mb-2">
                {team.problem_statement.title}
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your submission should address the challenge generated for your team.
              </p>
            </div>

            {/* Scoring */}
            <div className="glass-dark rounded-[2.5rem] p-6 border border-white/5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Scoring</h3>
              <div className="space-y-4">
                {[
                  { label: 'Signal Synergy', value: '25%' },
                  { label: 'Consistency', value: '20%' },
                  { label: 'Technical Execution', value: '35%' },
                  { label: 'Social Proof', value: '20%' }
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <span className="text-xs font-semibold text-primary-400">{item.value}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: item.value }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/doppelganger/leaderboard">
              <button className="w-full py-3.5 bg-white/5 text-gray-400 rounded-xl text-sm font-medium border border-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172" />
                </svg>
                Leaderboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
