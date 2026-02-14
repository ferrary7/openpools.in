'use client'

import { formatDistanceToNow } from 'date-fns'

export default function ProgressTracker({ logs = [], requiredLogs = 5, sprintStart, sprintEnd }) {
  const completedLogs = logs.length
  const progressPercent = Math.min((completedLogs / requiredLogs) * 100, 100)

  const now = new Date()
  const end = new Date(sprintEnd)
  const isExpired = now > end
  const timeLeft = isExpired ? 'SPRINT EXPIRED' : formatDistanceToNow(end, { addSuffix: true }).toUpperCase()

  // Progress status colors
  const getStatusColor = () => {
    if (progressPercent >= 100) return 'from-green-500 to-emerald-500'
    if (progressPercent >= 50) return 'from-purple-500 to-pink-500'
    return 'from-blue-500 to-indigo-500'
  }

  return (
    <div className="glass-dark rounded-[2.5rem] p-6 md:p-8 border border-white/5 relative overflow-hidden group">
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            TACTICAL TIMELINE
          </h2>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">REMAINING UPTIME</p>
            <div className={`text-base font-black italic tracking-tighter ${isExpired ? 'text-red-500' : 'text-white'}`}>
              {timeLeft}
            </div>
          </div>
        </div>

        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
          {completedLogs} / {requiredLogs} LOGS REGISTERED
        </p>
      </div>

      {/* Progress Bar HUD */}
      <div className="relative mb-14">
        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
          <div
            className={`h-full bg-gradient-to-r ${getStatusColor()} rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]`}
            style={{ width: `${progressPercent}%` }}
          >
            <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse_2s_linear_infinite]"></div>
          </div>
        </div>

        {/* Markers - Hidden on mobile if too many */}
        <div className="absolute top-8 left-0 w-full flex justify-between px-1">
          {[...Array(requiredLogs + 1)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-0.5 h-2 ${i <= completedLogs ? 'bg-white/40' : 'bg-white/10'}`}></div>
              <span className={`text-[8px] font-black mt-2 ${i <= completedLogs ? 'text-gray-400' : 'text-gray-600'}`}>0{i}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Checkpoints - Vertical for narrow, grid for wide */}
      <div className="flex flex-col gap-3 mt-8">
        {[...Array(requiredLogs)].map((_, i) => {
          const log = logs[i]
          const isLocked = i > completedLogs
          const isActive = i === completedLogs

          return (
            <div
              key={i}
              className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${log
                  ? 'glass-dark border-green-500/20 bg-green-500/5'
                  : isActive
                    ? 'glass-dark border-purple-500/30 bg-purple-500/5 animate-pulse'
                    : 'bg-white/5 border-white/5 opacity-40'
                }`}
            >
              <div className="flex flex-col">
                <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${log ? 'text-green-500' : 'text-gray-500'}`}>
                  LOG_0{i + 1}
                </span>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                  {log ? 'ENCRYPTED' : isLocked ? 'LOCKED' : 'READY'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {log && <span className="text-xs">✅</span>}
                {isActive && <span className="text-[8px] font-black text-purple-400 animate-pulse">ACTIVE</span>}
                <div className={`h-8 w-1 rounded-full ${log ? 'bg-green-500' : 'bg-white/10'}`}></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
