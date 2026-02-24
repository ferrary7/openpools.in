'use client'

import { formatDistanceToNow } from 'date-fns'

export default function ProgressTracker({ logs = [], requiredLogs = 5, sprintStart, sprintEnd }) {
  const completedLogs = logs.length
  const progressPercent = Math.min((completedLogs / requiredLogs) * 100, 100)

  const now = new Date()
  const end = new Date(sprintEnd)
  const isExpired = now > end
  const timeLeft = isExpired ? 'Sprint ended' : `Ends ${formatDistanceToNow(end, { addSuffix: true })}`

  return (
    <div className="glass-dark rounded-[2.5rem] p-6 md:p-8 border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress</h2>
        <span className={`text-xs font-medium ${isExpired ? 'text-red-400' : 'text-gray-500'}`}>
          {timeLeft}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-white">{completedLogs}/{requiredLogs} logs</span>
          <span className="text-xs font-medium text-gray-500">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Checkpoint list */}
      <div className="space-y-2 mt-6">
        {[...Array(requiredLogs)].map((_, i) => {
          const checkpointNumber = i + 1
          const log = logs.find(l => l.checkpoint_number === checkpointNumber)
          const isMissed = !log && checkpointNumber < Math.max(...logs.map(l => l.checkpoint_number), 0)

          return (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${log
                  ? 'bg-emerald-500/10 border border-emerald-500/15'
                  : isMissed
                    ? 'bg-amber-500/10 border border-amber-500/15'
                    : 'bg-white/[0.02] border border-white/5 opacity-50'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${log
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isMissed
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-white/5 text-gray-600'
                  }`}>
                  {checkpointNumber}
                </div>
                <span className={`text-xs font-medium ${log ? 'text-emerald-400' : isMissed ? 'text-amber-400' : 'text-gray-600'}`}>
                  {log ? 'Submitted' : isMissed ? 'Missed' : 'Pending'}
                </span>
              </div>

              {log && (
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {isMissed && (
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                </svg>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
