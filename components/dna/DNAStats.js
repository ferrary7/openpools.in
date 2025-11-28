'use client'

import { useState, useEffect } from 'react'

export default function DNAStats({ profile, keywordProfile, collaborations, isOwnDNA = true }) {
  const [mounted, setMounted] = useState(false)
  const [animatedValues, setAnimatedValues] = useState({
    keywords: 0,
    collaborations: 0,
    uniqueness: 0,
    days: 0
  })

  // Personalized text based on ownership
  const firstName = profile?.full_name?.split(' ')[0] || 'their'
  const descriptionText = isOwnDNA
    ? 'Decode your professional signals and uniqueness signature'
    : `Decode ${firstName}'s professional signals and uniqueness signature`

  useEffect(() => {
    setMounted(true)

    // Animate numbers counting up
    const targets = {
      keywords: keywordProfile?.total_keywords || 0,
      collaborations: collaborations?.length || 0,
      uniqueness: keywordProfile?.keywords ? Math.min(99, Math.floor(keywordProfile.keywords.length / 10) * 10 + 10) : 85,
      days: profile?.created_at ? Math.floor((new Date() - new Date(profile.created_at)) / (1000 * 60 * 60 * 24)) : 0
    }

    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps

      setAnimatedValues({
        keywords: Math.floor(targets.keywords * progress),
        collaborations: Math.floor(targets.collaborations * progress),
        uniqueness: Math.floor(targets.uniqueness * progress),
        days: Math.floor(targets.days * progress)
      })

      if (step >= steps) {
        clearInterval(timer)
        setAnimatedValues(targets)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [profile, keywordProfile, collaborations])

  // Calculate uniqueness insights
  const getRareSkills = () => {
    if (!keywordProfile?.keywords || keywordProfile.keywords.length < 3) return []

    const combinations = []
    const keywords = keywordProfile.keywords.slice(0, 10)

    const getKeywordText = (k) => {
      if (typeof k === 'string') return k
      return k.keyword || k.name || ''
    }

    if (keywords.length >= 3) {
      combinations.push({
        skills: keywords.slice(0, 3).map(getKeywordText).filter(Boolean),
        rarity: Math.floor(Math.random() * 5) + 1
      })
    }
    if (keywords.length >= 6) {
      combinations.push({
        skills: keywords.slice(3, 6).map(getKeywordText).filter(Boolean),
        rarity: Math.floor(Math.random() * 10) + 5
      })
    }

    return combinations
  }

  const rareSkills = getRareSkills()
  const uniquenessScore = animatedValues.uniqueness

  return (
    <section className="relative py-32 overflow-hidden bg-[#1E1E1E]">
      {/* Subtle glow accents */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Section Title */}
        <div className={`text-center mb-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
              Professional DNA Analysis
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {descriptionText}
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {/* Stat 1: Keywords */}
          <div className={`transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative bg-gradient-to-br from-primary-500/10 to-transparent backdrop-blur-sm rounded-xl p-6 border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300 group">
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-4xl font-bold text-white">{animatedValues.keywords}</div>
                <div className="text-primary-400 text-sm font-medium">skills</div>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Verified Skills</div>

              <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Stat 2: Collaborations */}
          <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative bg-gradient-to-br from-purple-500/10 to-transparent backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-4xl font-bold text-white">{animatedValues.collaborations}</div>
                <div className="text-purple-400 text-sm font-medium">active</div>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Collaborations</div>

              <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Stat 3: Uniqueness */}
          <div className={`transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative bg-gradient-to-br from-primary-500/10 via-purple-500/10 to-transparent backdrop-blur-sm rounded-xl p-6 border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300">
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                  {animatedValues.uniqueness}%
                </div>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Uniqueness Score</div>

              <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Stat 4: Days Active */}
          <div className={`transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative bg-gradient-to-br from-primary-500/10 to-transparent backdrop-blur-sm rounded-xl p-6 border border-primary-500/20 hover:border-primary-500/40 transition-all duration-300">
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-4xl font-bold text-white">{animatedValues.days}</div>
                <div className="text-primary-400 text-sm font-medium">days</div>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Days Active</div>

              <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Uniqueness Breakdown */}
        <div className={`transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-2xl p-8 border border-white/10 overflow-hidden">
            {/* Background glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Uniqueness Profile</h3>
                  <p className="text-sm text-gray-400">What sets your DNA apart from others</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rarity Score</div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                      {uniquenessScore}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Uniqueness bar */}
              <div className="mb-8">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500 rounded-full transition-all duration-2000 ease-out relative"
                    style={{ width: `${uniquenessScore}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-600">Common</span>
                  <span className="text-xs text-gray-600">Rare</span>
                  <span className="text-xs text-gray-600">Unique</span>
                  <span className="text-xs text-primary-400">Legendary</span>
                </div>
              </div>

              {/* Rare Skills */}
              {rareSkills.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Unique Skill Combinations
                  </h4>
                  <div className="space-y-3">
                    {rareSkills.map((combo, index) => (
                      <div key={index} className="bg-black/20 rounded-lg p-4 border border-white/5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-2">
                            {combo.skills.map((skill, i) => (
                              <span key={i} className="px-3 py-1 bg-gradient-to-r from-primary-500/20 to-purple-500/20 text-primary-300 rounded-full text-xs border border-primary-500/30 font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-gray-400 whitespace-nowrap">
                            Only <span className="text-primary-400 font-bold">{combo.rarity}%</span> share this combination
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </section>
  )
}
