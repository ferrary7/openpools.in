'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useDoppelgangerStore } from '@/store/doppelgangerStore'
import { MemberCard, ProblemStatement, ProgressTracker } from '@/components/doppelganger'

export default function TeamDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const teamId = params.teamId

  const [inviteEmail, setInviteEmail] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)

  const {
    team,
    members,
    logs,
    loadingTeam,
    loadingMembers,
    error,
    fetchTeam,
    inviteMember,
    removeMember,
    generateProblem,
    loading,
    clearError,
    startPolling,
    stopPolling
  } = useDoppelgangerStore()

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      if (teamId) {
        await fetchTeam(teamId)
        startPolling(teamId)
      }
      setInitialLoading(false)
    }
    init()

    return () => stopPolling()
  }, [teamId, fetchTeam, startPolling, stopPolling])

  const action = searchParams.get('action')
  useEffect(() => {
    if (action === 'doppelganger' && team?.doppelganger_status === 'invited') {
      // Show doppelganger accept UI
    }
  }, [action, team])

  const handleInviteMember = async (e) => {
    e.preventDefault()
    clearError()
    const result = await inviteMember(teamId, inviteEmail)
    if (result) {
      setInviteEmail('')
      setShowInviteForm(false)
    }
  }

  const handleGenerateProblem = async () => {
    await generateProblem(teamId)
  }

  const handleRemoveMember = async (memberId) => {
    const member = members.find(m => m.id === memberId)
    const isPending = member?.invite_status === 'pending'
    const name = member?.user?.full_name || member?.email || 'this member'

    const message = isPending
      ? `Cancel invite for ${name}?`
      : `Remove ${name} from the team?`

    if (confirm(message)) {
      clearError()
      await removeMember(teamId, memberId)
    }
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

  const acceptedMembers = members.filter(m => m.invite_status === 'accepted' && m.role !== 'captain')
  const pendingMembers = members.filter(m => m.invite_status === 'pending')
  const hasProblem = !!team.problem_statement

  const acceptedMemberCount = acceptedMembers.length + 1
  const teamMemberCount = acceptedMemberCount + pendingMembers.length
  const minTeamSize = team.event?.min_team_size || 2
  const maxTeamSize = team.event?.max_team_size || 4

  const meetsMinimum = acceptedMemberCount >= minTeamSize
  const canGenerateProblem = meetsMinimum && team.is_verified && !hasProblem
  const canInviteMore = teamMemberCount < maxTeamSize

  return (
    <div className="min-h-screen py-12 pb-24 animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <Link href="/doppelganger" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to event
        </Link>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center justify-between">
            <span className="text-sm font-medium">{error}</span>
            <button onClick={clearError} className="p-1 hover:bg-red-500/20 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Team Header */}
        <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-xl font-bold">
                {team.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-gray-500">{team.event?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{team.name}</h1>
                  {team.is_verified && (
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-md text-[9px] font-bold uppercase tracking-wider">
                      Verified
                    </span>
                  )}
                  {team.is_locked && (
                    <span className="px-2 py-0.5 bg-white/5 text-gray-400 rounded-md text-[9px] font-bold uppercase tracking-wider">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            </div>

            {hasProblem && (
              <div className="flex gap-3 w-full md:w-auto">
                <Link href={`/doppelganger/team/${teamId}/sprint`} className="flex-1 md:flex-initial">
                  <button className="w-full px-5 py-3 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-400 transition-all">
                    Log Sprints
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="lg:col-span-8 space-y-6">
            <ProblemStatement
              problem={team.problem_statement}
              canGenerate={canGenerateProblem}
              onGenerate={handleGenerateProblem}
              loading={loading}
            />

            {hasProblem && team.event && (
              <ProgressTracker
                logs={logs}
                requiredLogs={team.event.required_logs || 5}
                sprintStart={team.event.sprint_start}
                sprintEnd={team.event.sprint_end}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Team Members */}
            <div className="glass-dark rounded-[2.5rem] p-6 border border-white/5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Team Members</h2>
                <span className="text-xs text-gray-600">{teamMemberCount}/{maxTeamSize}</span>
              </div>

              <div className="space-y-2">
                <MemberCard
                  member={{
                    user: team.creator,
                    invite_status: 'accepted',
                    is_verified: true
                  }}
                  isCaptain={true}
                />

                {acceptedMembers.map(member => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    canRemove={currentUserId === team.created_by && !team.is_locked}
                    onRemove={handleRemoveMember}
                  />
                ))}

                {pendingMembers.map(member => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    canRemove={currentUserId === team.created_by && !team.is_locked}
                    onRemove={handleRemoveMember}
                  />
                ))}
              </div>

              {/* Invite form */}
              {canInviteMore && !team.is_locked && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  {showInviteForm ? (
                    <form onSubmit={handleInviteMember} className="space-y-3">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="teammate@email.com"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-gray-700"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={loadingMembers}
                          className="flex-1 py-3 bg-primary-500 text-white rounded-xl text-xs font-semibold hover:bg-primary-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loadingMembers ? (
                            <>
                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            'Send Invite'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowInviteForm(false)}
                          className="px-4 py-3 bg-white/5 text-gray-400 rounded-xl text-xs hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowInviteForm(true)}
                      className="w-full py-3.5 border border-dashed border-white/10 text-gray-500 rounded-xl text-xs font-medium hover:border-primary-500/30 hover:text-primary-400 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Invite Member
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Team Status */}
            <div className="glass-dark rounded-[2.5rem] p-6 border border-white/5">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Status</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Members</span>
                  <span className="text-sm font-semibold text-white">{acceptedMemberCount}/{maxTeamSize}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Minimum</span>
                  <span className={`flex items-center gap-1.5 text-sm font-medium ${meetsMinimum ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${meetsMinimum ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    {meetsMinimum ? 'Met' : `Need ${minTeamSize - acceptedMemberCount} more`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Verification</span>
                  <span className={`text-sm font-medium ${team.is_verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {team.is_verified ? 'Complete' : 'Pending'}
                  </span>
                </div>
              </div>

              {!canGenerateProblem && !hasProblem && (
                <div className="mt-5 p-4 bg-amber-500/5 rounded-xl border border-amber-500/15">
                  <p className="text-amber-400 text-xs leading-relaxed">
                    {!meetsMinimum
                      ? `Invite at least ${minTeamSize - acceptedMemberCount} more member${minTeamSize - acceptedMemberCount > 1 ? 's' : ''} to continue.`
                      : !team.is_verified
                        ? 'All members need to complete their skill profiles.'
                        : 'Ready to generate your challenge.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
