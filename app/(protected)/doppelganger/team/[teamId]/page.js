'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
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

  const {
    team,
    members,
    logs,
    loadingTeam,
    error,
    fetchTeam,
    inviteMember,
    generateProblem,
    loading,
    clearError
  } = useDoppelgangerStore()

  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId).finally(() => setInitialLoading(false))
    }
  }, [teamId, fetchTeam])

  // Handle doppelganger action from URL
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

  if (initialLoading || (loadingTeam && !team)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">SYNCHRONIZING SQUAD...</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tighter">Squad Not Found</h2>
          <Link href="/doppelganger" className="text-purple-400 font-black hover:text-white transition-colors uppercase tracking-widest text-xs">
            Return to Event
          </Link>
        </div>
      </div>
    )
  }

  // Filter out captain from members list since we display them separately
  const acceptedMembers = members.filter(m => m.invite_status === 'accepted' && m.role !== 'captain')
  const pendingMembers = members.filter(m => m.invite_status === 'pending')
  const hasProblem = !!team.problem_statement

  // Team size: captain (1) + accepted members (excluding captain)
  const acceptedMemberCount = acceptedMembers.length + 1 // +1 for captain
  const teamMemberCount = acceptedMemberCount + pendingMembers.length
  const minTeamSize = team.event?.min_team_size || 2
  const maxTeamSize = team.event?.max_team_size || 4

  // Can generate problem if: minimum members met AND all accepted members have keywords (team is verified)
  const meetsMinimum = acceptedMemberCount >= minTeamSize
  const canGenerateProblem = meetsMinimum && team.is_verified && !hasProblem
  const canInviteMore = teamMemberCount < maxTeamSize

  return (
    <div className="min-h-screen py-12 pb-24 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link href="/doppelganger" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-10 transition-colors group">
          <div className="p-2 glass-dark rounded-xl border border-white/5 group-hover:border-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="font-black text-[10px] tracking-[0.2em] uppercase">ABORT TO HANGAR</span>
        </Link>

        {/* Error display */}
        {error && (
          <div className="mb-10 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 flex items-center justify-between animate-fadeIn">
            <span className="font-bold text-sm tracking-tight">{error}</span>
            <button onClick={clearError} className="p-2 hover:bg-red-500/20 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Team header */}
        <div className="glass-dark rounded-[3rem] p-8 md:p-12 border border-white/5 mb-10 group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-purple-500/10 transition-all duration-1000"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/20 group-hover:scale-105 transition-transform duration-500">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-black tracking-[0.3em] uppercase mb-1">{team.event?.name}</p>
                <div className="flex flex-wrap items-center gap-4">
                  <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">{team.name}</h1>
                  <div className="flex gap-2">
                    {team.is_verified && (
                      <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-green-500/20 flex items-center gap-1">
                        VERIFIED
                      </span>
                    )}
                    {team.is_locked && (
                      <span className="px-3 py-1 bg-white/5 text-gray-400 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/5">
                        LOCKED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              {hasProblem && (
                <>
                  <Link href={`/doppelganger/team/${teamId}/sprint`} className="flex-1 md:flex-initial">
                    <button className="w-full px-6 py-4 glass-dark text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-white/5 transition-all border border-white/10 group/btn">
                      SPRINT VIEW
                    </button>
                  </Link>
                  <Link href={`/doppelganger/team/${teamId}/submit`} className="flex-1 md:flex-initial">
                    <button className="w-full px-8 py-4 bg-white text-black rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5">
                      DEPLOY
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Problem Statement */}
            <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <ProblemStatement
                problem={team.problem_statement}
                canGenerate={canGenerateProblem}
                onGenerate={handleGenerateProblem}
                loading={loading}
              />
            </div>

            {/* Progress Tracker (if problem exists) */}
            {hasProblem && team.event && (
              <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <ProgressTracker
                  logs={logs}
                  requiredLogs={team.event.required_logs || 5}
                  sprintStart={team.event.sprint_start}
                  sprintEnd={team.event.sprint_end}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Team Members */}
            <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">OPERATORS</h2>
                <span className="text-[10px] font-black text-gray-600 bg-white/5 px-2 py-1 rounded-md">{teamMemberCount}/{maxTeamSize}</span>
              </div>

              <div className="space-y-4">
                {/* Captain */}
                <MemberCard
                  member={{
                    user: team.creator,
                    invite_status: 'accepted',
                    is_verified: true
                  }}
                  isCaptain={true}
                />

                {/* Other members */}
                {acceptedMembers.map(member => (
                  <MemberCard key={member.id} member={member} />
                ))}

                {/* Pending invites */}
                {pendingMembers.map(member => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>

              {/* Invite form */}
              {canInviteMore && !team.is_locked && (
                <div className="mt-8 pt-6 border-t border-white/5">
                  {showInviteForm ? (
                    <form onSubmit={handleInviteMember} className="space-y-4">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="teammate@email.com"
                        className="w-full px-5 py-4 bg-[#0A0A0A] border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-white"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-4 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-500 transition-all"
                        >
                          ENLIST
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowInviteForm(false)}
                          className="px-6 py-4 glass-dark text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                        >
                          ESC
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowInviteForm(true)}
                      className="w-full py-5 border-2 border-dashed border-white/5 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:border-purple-500/30 hover:text-white transition-all flex items-center justify-center gap-3 group/btn"
                    >
                      <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      ENLIST OPERATOR
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Team Status Console */}
            <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8">SYSTEM STATUS</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between group cursor-default">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">Enlisted</span>
                  <span className="font-black text-white italic tracking-tighter text-xl tabular-nums">{acceptedMemberCount}/{maxTeamSize}</span>
                </div>

                <div className="flex items-center justify-between group cursor-default">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">Min Required</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${meetsMinimum ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></div>
                    <span className={`font-black text-xs uppercase tracking-widest ${meetsMinimum ? 'text-white' : 'text-amber-500'}`}>
                      {meetsMinimum ? 'GO' : `NEED ${minTeamSize - acceptedMemberCount} MORE`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between group cursor-default">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">Verification</span>
                  <span className={`font-black text-[10px] uppercase tracking-widest ${team.is_verified ? 'text-green-500' : 'text-amber-500'}`}>
                    {team.is_verified ? 'DATA CLEAR' : 'PENDING BIOMETRICS'}
                  </span>
                </div>
              </div>

              {!canGenerateProblem && !hasProblem && (
                <div className="mt-8 p-6 bg-amber-500/5 rounded-[1.5rem] border border-amber-500/20">
                  <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                    {!meetsMinimum
                      ? `INSUFFICIENT OPERATORS. ENLIST AT LEAST ${minTeamSize - acceptedMemberCount} MORE.`
                      : !team.is_verified
                        ? 'SIGNAL INTERFERENCE. ALL OPERATORS MUST UPLOAD SKILL DATA.'
                        : 'SYSTEMS READY.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>)
}
