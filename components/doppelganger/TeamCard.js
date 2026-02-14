'use client'

import Link from 'next/link'

export default function TeamCard({ team, showActions = true }) {
  if (!team) return null

  // Count accepted members excluding captain (captain is counted separately as +1)
  const memberCount = (team.members?.filter(m => m.invite_status === 'accepted' && m.role !== 'captain').length || 0) + 1
  const hasProblem = !!team.problem_statement

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{team.name}</h3>
            <p className="text-slate-500 text-sm">
              Created by {team.creator?.full_name || 'Unknown'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {team.is_verified && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
            {team.is_locked && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Locked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{memberCount}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {team.logs?.length || 0}/5
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Logs</div>
          </div>
        </div>

        {/* Problem statement preview */}
        {hasProblem && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-100">
            <p className="text-xs text-purple-600 uppercase tracking-wider mb-1">Problem Statement</p>
            <p className="text-slate-800 font-semibold">{team.problem_statement.title}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <Link href={`/doppelganger/team/${encodeURIComponent(team.name)}`}>
            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
              View Team Dashboard
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}
