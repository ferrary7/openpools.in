'use client'

import Link from 'next/link'

export default function EventCard({ event, userTeam, isLoggedIn = true, isBentoView = false, steps = [] }) {
  if (!event) return null

  const now = new Date()
  const sprintStart = new Date(event.sprint_start)
  const sprintEnd = new Date(event.sprint_end)

  const isRegistrationOpen = event.status === 'registration'
  const hasTeam = !!userTeam

  const getStatusInfo = () => {
    if (event.status === 'completed') {
      return { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' }
    }
    if (event.status === 'judging') {
      return { label: 'Reviewing', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-500' }
    }
    if (event.status === 'active') {
      return { label: 'Live Now', color: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-500 animate-pulse' }
    }
    if (event.status === 'registration') {
      return { label: 'Registering', color: 'bg-primary-500/10 text-primary-400 border-primary-500/20', dot: 'bg-primary-500' }
    }
    return { label: 'Upcoming', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', dot: 'bg-gray-400' }
  }

  const status = getStatusInfo()

  const getTimeRemaining = () => {
    let targetDate
    let label

    if (event.status === 'active') {
      targetDate = sprintEnd
      label = 'Ends'
    } else if (event.status === 'registration') {
      targetDate = sprintStart
      label = 'Starts'
    } else {
      return null
    }

    const diff = targetDate - now
    if (diff <= 0) return null

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return { label, value: days, unit: days === 1 ? 'DAY' : 'DAYS', sub: `${hours % 24}H` }
    }
    return { label, value: hours, unit: hours === 1 ? 'HR' : 'HRS', sub: `${minutes}M` }
  }

  const countdown = getTimeRemaining()

  return (
    <div className={`flex flex-col gap-4 animate-fadeInUp ${isBentoView ? '' : 'max-w-4xl mx-auto'}`}>
      <div className="glass-dark rounded-[2.5rem] border-white/5 shadow-2xl overflow-hidden group">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Main Info Section */}
          <div className="lg:col-span-8 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-white/5">
            <div className="flex justify-between items-start mb-10">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${status.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot} shadow-[0_0_8px_currentColor]`}></span>
                {status.label}
              </span>

              {countdown && (
                <div className="text-right">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">{countdown.label} IN</span>
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-3xl font-black text-white leading-none">{countdown.value}</span>
                    <span className="text-xs font-bold text-gray-500">{countdown.unit}</span>
                  </div>
                </div>
              )}
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-none">{event.name}</h2>
            <p className="text-gray-400 text-base leading-relaxed max-w-xl font-light mb-12">
              {event.description}
            </p>

            {/* Action Buttons Integrated */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              {event.status === 'judging' ? (
                <>
                  {hasTeam && (
                    <Link href={`/doppelganger/team/${encodeURIComponent(userTeam.name)}`} className="flex-1">
                      <button className="w-full py-5 bg-white/5 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-white/5 hover:bg-white/10 transition-all active:scale-[0.98]">
                        Your Submission
                      </button>
                    </Link>
                  )}
                  <Link href="/doppelganger/leaderboard" className="flex-1">
                    <button className="w-full py-5 bg-amber-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-400 transition-all active:scale-[0.98]">
                      Leaderboard
                    </button>
                  </Link>
                </>
              ) : hasTeam ? (
                <Link href={`/doppelganger/team/${encodeURIComponent(userTeam.name)}`} className="flex-1">
                  <button className="w-full py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-[0.98]">
                    Team Dashboard: {userTeam.name}
                  </button>
                </Link>
              ) : isRegistrationOpen ? (
                isLoggedIn ? (
                  <Link href="/doppelganger/team/create" className="flex-1">
                    <button className="w-full py-5 bg-primary-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-400 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(232,68,153,0.3)]">
                      Enter The Sprint
                    </button>
                  </Link>
                ) : (
                  <Link href="/login?redirect=/doppelganger" className="flex-1">
                    <button className="w-full py-5 bg-primary-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-400 transition-all active:scale-[0.98]">
                      Sign In to Enter
                    </button>
                  </Link>
                )
              ) : (
                <button disabled className="flex-1 py-5 bg-white/5 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-white/5 cursor-not-allowed">
                  Registration Locked
                </button>
              )}
            </div>
          </div>

          {/* Steps Side Column (Sprint Flow) */}
          <div className="lg:col-span-4 bg-white/5 p-8 md:p-12">
            <h3 className="text-xl font-black text-white mb-8 tracking-tight uppercase">Sprint Flow</h3>
            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex gap-4 group">
                  <span className="text-[10px] font-black text-primary-600 mt-1">0{step.num}</span>
                  <div>
                    <h4 className="text-xs font-bold text-gray-200 group-hover:text-primary-400 transition-colors uppercase tracking-tight">{step.title}</h4>
                    <p className="text-[10px] text-gray-500 leading-tight mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {!hasTeam && !isRegistrationOpen && (
              <div className="mt-12 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Next Sprint Soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
