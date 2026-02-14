'use client'

export default function ProblemStatement({ problem, canGenerate, onGenerate, loading }) {
  if (!problem) {
    return (
      <div className="glass-dark rounded-[2.5rem] p-12 border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-purple-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-purple-500/20 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-10 h-10 text-purple-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase italic tracking-tighter">Mission Vector Required</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium leading-relaxed">
            Squad biometrics confirmed. Awaiting AI signal synthesis to generate your custom mission parameters.
          </p>

          <button
            onClick={onGenerate}
            disabled={!canGenerate || loading}
            className={`px-10 py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all duration-500 ${canGenerate && !loading
                ? 'bg-white text-black hover:scale-105 active:scale-95 shadow-2xl shadow-white/10'
                : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
              }`}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <span className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin"></span>
                SYNTHESIZING...
              </span>
            ) : (
              'INITIATE MISSION TRANSMISSION'
            )}
          </button>
        </div>
      </div>
    )
  }

  const sections = [
    {
      id: 'problem',
      title: 'CORE OBJECTIVE',
      content: problem.problem,
      color: 'text-purple-400',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    {
      id: 'challenge',
      title: 'TACTICAL CHALLENGE',
      content: problem.challenge,
      color: 'text-pink-400',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
    },
    {
      id: 'criteria',
      title: 'SUCCESS PARAMETERS',
      content: Array.isArray(problem.success_criteria) ? problem.success_criteria.join('\n- ') : problem.success_criteria,
      color: 'text-indigo-400',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 'bonus',
      title: 'BONUS INTEL',
      content: problem.bonus_challenge || problem.bonus_challenges,
      color: 'text-orange-400',
      icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <h2 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] italic">AI TRANSMISSION RECEIVED</h2>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
      </div>

      <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5 bg-gradient-to-br from-purple-500/5 to-transparent mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
            <span className="text-xl">📡</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SIGNAL IDENTITY</p>
            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">{problem.title}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div
            key={section.id}
            className="glass-dark rounded-[2rem] p-8 border border-white/5 hover:border-white/10 transition-all duration-500 group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${section.color}`}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={section.icon} />
              </svg>
            </div>

            <h3 className={`text-[10px] font-black tracking-[0.2em] uppercase mb-4 ${section.color} flex items-center gap-2`}>
              <span className="w-1 h-1 rounded-full bg-current"></span>
              {section.title}
            </h3>

            <div className="text-gray-300 text-sm font-medium leading-relaxed">
              {section.content?.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-2' : ''}>
                  {line.startsWith('-') ? (
                    <span className="flex items-start gap-2">
                      <span className={`mt-1.5 w-1 h-1 rounded-full bg-white/20 shrink-0`}></span>
                      {line.substring(1)}
                    </span>
                  ) : line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {problem.keywords_used?.length > 0 && (
        <div className="glass-dark rounded-[1.5rem] p-6 border border-white/5 flex items-center flex-wrap gap-4 mt-8">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">LEVERAGED SIGNALS:</span>
          <div className="flex flex-wrap gap-2">
            {problem.keywords_used.map((kw, i) => (
              <span key={i} className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
