'use client'

export default function ProblemStatement({ problem, canGenerate, onGenerate, loading }) {
  if (!problem) {
    return (
      <div className="glass-dark rounded-[2.5rem] p-10 md:p-14 border border-white/5 text-center">
        <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary-500/20">
          <svg className="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Generate Your Challenge</h2>
        <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm leading-relaxed">
          Once your team is verified, AI will craft a unique problem statement based on your combined skills.
        </p>

        <button
          onClick={onGenerate}
          disabled={!canGenerate || loading}
          className={`px-8 py-4 rounded-2xl font-semibold text-sm transition-all ${canGenerate && !loading
              ? 'bg-primary-500 text-white hover:bg-primary-400 active:scale-[0.98]'
              : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
            }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Generating...
            </span>
          ) : (
            'Generate Challenge'
          )}
        </button>
      </div>
    )
  }

  const sections = [
    {
      id: 'problem',
      title: 'Core Objective',
      content: problem.problem,
      accent: 'primary'
    },
    {
      id: 'challenge',
      title: 'Key Challenge',
      content: problem.challenge,
      accent: 'violet'
    },
    {
      id: 'criteria',
      title: 'Success Criteria',
      content: Array.isArray(problem.success_criteria) ? problem.success_criteria.join('\n- ') : problem.success_criteria,
      accent: 'blue'
    },
    {
      id: 'bonus',
      title: 'Bonus',
      content: problem.bonus_challenge || problem.bonus_challenges,
      accent: 'amber'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Title card */}
      <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">AI-Generated Challenge</span>
        </div>
        <h3 className="text-2xl font-bold text-white">{problem.title}</h3>
      </div>

      {/* Sections grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div
            key={section.id}
            className="glass-dark rounded-[2rem] p-6 border border-white/5 hover:border-white/10 transition-all duration-300"
          >
            <h3 className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-3">
              {section.title}
            </h3>
            <div className="text-gray-300 text-sm leading-relaxed">
              {section.content?.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-2' : ''}>
                  {line.startsWith('-') ? (
                    <span className="flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-white/20 shrink-0"></span>
                      {line.substring(1).trim()}
                    </span>
                  ) : line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {problem.keywords_used?.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 px-2 pt-2">
          <span className="text-[10px] font-medium text-gray-600 mr-1">Skills used:</span>
          {problem.keywords_used.map((kw, i) => (
            <span key={i} className="px-2.5 py-1 bg-white/5 text-gray-400 rounded-lg text-[10px] font-medium border border-white/5">
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
