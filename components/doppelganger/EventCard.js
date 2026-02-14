'use client'

import Link from 'next/link'

export default function EventCard({ event, userTeam, isLoggedIn = true }) {
  if (!event) return null

  const now = new Date()
  const sprintStart = new Date(event.sprint_start)
  const sprintEnd = new Date(event.sprint_end)

  // Use event status from admin as primary source of truth
  const isRegistrationOpen = event.status === 'registration'
  const hasTeam = !!userTeam

  const getStatusInfo = () => {
    if (event.status === 'completed') {
      return { label: 'MISSION COMPLETE', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
    }
    if (event.status === 'judging') {
      return { label: 'JUDGING IN PROGRESS', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
    }
    if (event.status === 'active') {
      return { label: 'LIVE SPRINT', color: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' }
    }
    if (event.status === 'registration') {
      return { label: 'REGISTRATION OPEN', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
    }
    return { label: 'COMING SOON', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
  }

  const status = getStatusInfo()

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeRemaining = () => {
    let targetDate
    let label

    if (event.status === 'active') {
      targetDate = sprintEnd
      label = 'SPRINT ENDS IN'
    } else if (event.status === 'registration') {
      targetDate = sprintStart
      label = 'SPRINT STARTS IN'
    } else {
      return null
    }

    const diff = targetDate - now
    if (diff <= 0) return null

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return { label, time: `${days}D ${hours % 24}H` }
    }
    return { label, time: `${hours}H ${minutes}M` }
  }

  const countdown = getTimeRemaining()

  return (
    <div className="glass-dark rounded-[3rem] p-1 border border-white/10 group transition-all duration-700 hover:border-white/20">
      <div className="bg-[#050505]/60 rounded-[2.8rem] p-8 md:p-12 relative overflow-hidden h-full">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-purple-500/10 transition-all duration-700"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-1 uppercase italic">{event.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                  <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{event.min_team_size}-{event.max_team_size} OPERATORS REQUIRED</p>
                </div>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] border ${status.color}`}>
              {status.label}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-lg leading-relaxed mb-12 max-w-3xl font-medium">
            {event.description}
          </p>

          {/* Intel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-dark rounded-3xl p-6 border border-white/5 group/card hover:bg-white/[0.03] transition-all">
              <p className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-4">Registration Window</p>
              <div className="flex items-baseline gap-2">
                <span className="text-white font-bold text-sm tracking-tight">{formatDate(event.registration_start)}</span>
                <span className="text-gray-600 text-xs font-black">→</span>
                <span className="text-white font-bold text-sm tracking-tight">{formatDate(event.registration_end)}</span>
              </div>
            </div>

            <div className="glass-dark rounded-3xl p-6 border border-white/5 hover:bg-white/[0.03] transition-all">
              <p className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-4">Combat Duration</p>
              <div className="flex items-baseline gap-2">
                <span className="text-white font-bold text-sm tracking-tight">{formatDate(event.sprint_start)}</span>
                <span className="text-gray-600 text-xs font-black">→</span>
                <span className="text-white font-bold text-sm tracking-tight">{formatDate(event.sprint_end)}</span>
              </div>
            </div>

            {countdown ? (
              <div className="glass-dark rounded-3xl p-6 border border-purple-500/20 bg-purple-500/[0.03] hover:bg-purple-500/[0.08] transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 blur-2xl rounded-full"></div>
                <p className="text-purple-400 text-[10px] font-black tracking-widest uppercase mb-4 relative z-10">{countdown.label}</p>
                <p className="text-3xl font-black text-white tracking-widest relative z-10 italic">{countdown.time}</p>
              </div>
            ) : (
              <div className="glass-dark rounded-3xl p-6 border border-white/5 flex items-center justify-center opacity-50 grayscale">
                <span className="text-gray-600 text-[10px] font-black tracking-[0.3em] uppercase italic">System Standby</span>
              </div>
            )}
          </div>

          {/* Judging Banner */}
          {event.status === 'judging' && (
            <div className="mb-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-amber-400 font-black text-sm uppercase tracking-wider">Judging In Progress</h3>
                  <p className="text-amber-400/70 text-xs mt-1">Submissions are being evaluated. Results will be announced soon.</p>
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="flex flex-col sm:flex-row gap-4">
            {event.status === 'judging' ? (
              <>
                {hasTeam && (
                  <Link href={`/doppelganger/team/${encodeURIComponent(userTeam.name)}`} className="flex-1 group/btn">
                    <button className="w-full py-6 bg-white/5 text-white rounded-2xl font-black text-xl tracking-tighter uppercase italic border border-white/10 hover:bg-white/10 transition-all">
                      VIEW YOUR SUBMISSION
                    </button>
                  </Link>
                )}
                <Link href="/doppelganger/leaderboard" className="flex-1 group/btn">
                  <button className="w-full py-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-black text-xl tracking-tighter uppercase italic shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    VIEW LEADERBOARD
                  </button>
                </Link>
              </>
            ) : hasTeam ? (
              <Link href={`/doppelganger/team/${encodeURIComponent(userTeam.name)}`} className="flex-1 group/btn">
                <button className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-black text-xl tracking-tighter uppercase italic shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  ENTER COMMAND CENTER: {userTeam.name}
                </button>
              </Link>
            ) : isRegistrationOpen ? (
              isLoggedIn ? (
                <Link href="/doppelganger/team/create" className="flex-1 group/btn">
                  <button className="w-full py-6 bg-white text-black rounded-2xl font-black text-xl tracking-tighter uppercase italic hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-white/5">
                    INITIALIZE SQUAD
                  </button>
                </Link>
              ) : (
                <Link href="/login?redirect=/doppelganger" className="flex-1 group/btn">
                  <button className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-black text-xl tracking-tighter uppercase italic shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    SIGN IN TO PARTICIPATE
                  </button>
                </Link>
              )
            ) : (
              <button disabled className="w-full py-6 bg-white/[0.03] text-gray-600 rounded-2xl font-black text-xl tracking-tighter uppercase italic border border-white/5 cursor-not-allowed">
                REGISTRATION OFFLINE
              </button>
            )}

            {/* Secondary CTA - hide during judging since leaderboard is primary */}
            {event.status !== 'judging' && (
              <Link href="/doppelganger/leaderboard" className="sm:w-auto">
                <button className="h-full px-8 py-6 glass-dark text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-white/5 transition-all border border-white/10 group-hover:border-white/20">
                  INTEL
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>)
}
