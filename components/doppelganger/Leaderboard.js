'use client'

import Link from 'next/link'

export default function Leaderboard({ teams, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!teams?.length) {
    return (
      <div className="text-center py-24 glass-dark rounded-[2.5rem] border border-white/5">
        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/10">
          <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No teams yet</h3>
        <p className="text-sm text-gray-500">Rankings will appear once teams start participating.</p>
      </div>
    )
  }

  const getRankStyle = (rank) => {
    if (rank === 1) return { bg: 'bg-yellow-500', border: 'border-yellow-500/20', badge: 'bg-yellow-500/10 text-yellow-400' }
    if (rank === 2) return { bg: 'bg-gray-400', border: 'border-gray-400/20', badge: 'bg-gray-400/10 text-gray-300' }
    if (rank === 3) return { bg: 'bg-orange-500', border: 'border-orange-500/20', badge: 'bg-orange-500/10 text-orange-400' }
    return { bg: 'bg-white/10', border: 'border-white/5', badge: 'bg-white/5 text-gray-500' }
  }

  return (
    <div className="space-y-3">
      {teams.map((team, index) => {
        const rank = index + 1
        const style = getRankStyle(rank)

        return (
          <div
            key={team.id}
            className={`glass-dark rounded-2xl border ${style.border} p-5 md:p-6 hover:bg-white/[0.03] transition-all group animate-fadeInUp`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              {/* Rank + Team */}
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 ${style.bg} rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${rank <= 3 ? 'text-white' : ''}`}>
                  {rank}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white truncate">{team.name}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-500">{team.memberCount} members</span>
                    {team.hasSubmission && (
                      <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Submitted
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Challenge */}
              <div className="flex-1 min-w-0 md:border-l md:border-white/5 md:pl-5">
                <p className="text-[10px] text-gray-600 mb-0.5">Challenge</p>
                <p className="text-sm text-gray-400 truncate">
                  {team.problemTitle || 'Pending...'}
                </p>
              </div>

              {/* Score */}
              <div className="flex items-center gap-6 md:border-l md:border-white/5 md:pl-5">
                <div className="text-right">
                  <p className="text-[10px] text-gray-600 mb-0.5">Score</p>
                  <div className={`text-2xl font-bold tabular-nums ${rank <= 3 ? 'text-white' : 'text-primary-400'}`}>
                    {team.scores.final != null ? team.scores.final.toFixed(1) : '--'}
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-4 border-l border-white/5 pl-5">
                  {[
                    { label: 'Synergy', value: team.scores.synergy },
                    { label: 'Consistency', value: team.scores.consistency },
                    { label: 'Technical', value: team.scores.technical },
                    { label: 'Social', value: team.scores.social }
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="text-[9px] text-gray-600 mb-0.5">{s.label}</p>
                      <span className="text-xs font-semibold text-gray-300 tabular-nums">{s.value != null ? s.value.toFixed(0) : '--'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Links */}
            {team.hasSubmission && (
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  {team.prototypeUrl && (
                    <a
                      href={team.prototypeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Prototype
                    </a>
                  )}
                  {team.socialUrl && (
                    <a
                      href={team.socialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Social Post
                    </a>
                  )}
                </div>

                {team.doppelganger && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600">Signal twin:</span>
                    <span className="text-xs font-medium text-gray-400">{team.doppelganger.full_name}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
