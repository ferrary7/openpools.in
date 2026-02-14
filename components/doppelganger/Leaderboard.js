'use client'

import Link from 'next/link'

export default function Leaderboard({ teams, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!teams?.length) {
    return (
      <div className="text-center py-24 glass-dark rounded-[3rem] border border-white/5">
        <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
          <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">No Active Signals</h3>
        <p className="text-gray-500 font-medium tracking-tight">Deployment data stream is currently empty.</p>
      </div>
    )
  }

  const getRankStyles = (rank) => {
    if (rank === 1) return { glow: 'shadow-[0_0_30px_-5px_rgba(251,191,36,0.3)]', border: 'border-yellow-500/30', text: 'text-yellow-500', icon: '👑' }
    if (rank === 2) return { glow: 'shadow-[0_0_30px_-5px_rgba(148,163,184,0.3)]', border: 'border-slate-400/30', text: 'text-slate-400', icon: '🥈' }
    if (rank === 3) return { glow: 'shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]', border: 'border-orange-500/30', text: 'text-orange-500', icon: '🥉' }
    return { glow: '', border: 'border-white/5', text: 'text-gray-500', icon: null }
  }

  return (
    <div className="space-y-4">
      {teams.map((team, index) => {
        const rank = index + 1
        const styles = getRankStyles(rank)

        return (
          <div
            key={team.id}
            className={`glass-dark rounded-[2rem] border ${styles.border} ${styles.glow} p-6 md:p-8 hover:bg-white/[0.04] transition-all duration-500 group animate-fadeInUp`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              {/* Rank & Identity */}
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl italic tracking-tighter ${rank <= 3
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-gray-500 border border-white/5'
                  }`}>
                  {rank.toString().padStart(2, '0')}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{team.name}</h3>
                    {styles.icon && <span className="text-xl">{styles.icon}</span>}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-black tracking-widest uppercase">
                    <span className="text-purple-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                      {team.memberCount} OPERATORS
                    </span>
                    {team.hasSubmission && (
                      <span className="text-green-500">SUBMITTED</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Problem Signal */}
              <div className="flex-1 min-w-0 md:border-l md:border-white/5 md:pl-8">
                <p className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-1">Assigned Mission</p>
                <h4 className="text-gray-300 font-bold text-sm truncate uppercase tracking-tight">
                  {team.problemTitle || 'SYNCHRONIZING...'}
                </h4>
              </div>

              {/* Scoring Console */}
              <div className="flex items-center gap-8 md:border-l md:border-white/5 md:pl-8">
                <div className="text-right">
                  <p className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-1">Final Score</p>
                  <div className={`text-4xl font-black italic tracking-tighter ${rank <= 3 ? 'text-white' : 'text-purple-500'}`}>
                    {team.scores.final != null ? team.scores.final.toFixed(1) : '--.-'}
                  </div>
                </div>

                <div className="hidden lg:grid grid-cols-2 gap-x-6 gap-y-2 border-l border-white/5 pl-8">
                  {[
                    { l: 'SYN', v: team.scores.synergy },
                    { l: 'CON', v: team.scores.consistency },
                    { l: 'TEC', v: team.scores.technical },
                    { l: 'SOC', v: team.scores.social }
                  ].map(s => (
                    <div key={s.l} className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-gray-600 tracking-tighter">{s.l}</span>
                      <span className="text-[10px] font-black text-white tabular-nums">{s.v != null ? s.v.toFixed(0) : '--'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions & Prototype */}
            {team.hasSubmission && (
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {team.prototypeUrl && (
                    <a
                      href={team.prototypeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-black text-purple-400 hover:text-white uppercase tracking-[0.2em] flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Access Prototype
                    </a>
                  )}
                  {team.socialUrl && (
                    <a
                      href={team.socialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-black text-pink-400 hover:text-white uppercase tracking-[0.2em] flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Combat Log
                    </a>
                  )}
                </div>

                {team.doppelganger && (
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">TWIN SIGNAL</span>
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 flex items-center gap-2">
                      <span className="text-xs">🪞</span>
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">{team.doppelganger.full_name}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>)
}
