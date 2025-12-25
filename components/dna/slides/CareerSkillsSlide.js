'use client'

import { getPossessiveName } from '../utils/pronouns'

export default function CareerSkillsSlide({
  isVisible,
  isOwnDNA,
  profile,
  topSkills,
  aiInsights,
  aiLoading,
  currentSlide,
  onNavigate,
  onSlideChange
}) {
  const slides = [
    // Slide 1: Jobs that fit you/them best
    {
      title: `Jobs ${profile?.full_name?.split(' ')[0] || getSubjectPronoun(isOwnDNA)} can be a good fit for`,
      content: aiLoading ? (
        <div className="text-center">
          <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 rounded-full border-2 border-t-primary-500 animate-spin"></div>
          <p className="text-gray-400 text-sm md:text-base">Analyzing career matches...</p>
        </div>
      ) : aiInsights?.careerFit ? (
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          {/* Top Featured - Mobile: 2 big cards, Desktop: 2 big cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4 md:gap-4 mb-6 sm:mb-8 md:mb-8">
            {aiInsights.careerFit.slice(0, 2).map((job, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-3xl border-2 border-white/15 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl hover:border-primary-500/60 hover:scale-[1.03] sm:hover:scale-[1.04] md:hover:scale-105 transition-all duration-500 opacity-0 animate-slideIn shadow-2xl shadow-primary-500/10"
                style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'forwards' }}
              >
                {/* Enhanced gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/25 via-purple-500/15 to-pink-500/25 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Animated glow background */}
                <div className="absolute -inset-px bg-gradient-to-br from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

                {/* Rank badge - bigger on mobile */}
                <div className="absolute top-2 sm:top-4 md:top-4 right-2 sm:right-4 md:right-4 w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary-500/50 to-purple-500/50 border-2 border-primary-500/70 flex items-center justify-center shadow-xl shadow-primary-500/30">
                  <span className="text-xs sm:text-sm md:text-base font-black text-primary-100">#{i + 1}</span>
                </div>

                <div className="relative p-4 sm:p-6 md:p-5 lg:p-6">
                  {/* Match percentage - bigger on mobile */}
                  <div className="mb-3 sm:mb-4 md:mb-4">
                    <div className="text-4xl sm:text-6xl md:text-5xl lg:text-6xl font-black bg-gradient-to-br from-primary-300 via-purple-300 to-pink-300 bg-clip-text text-transparent leading-none mb-2 sm:mb-3">
                      {job.match}%
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="flex-1 h-1.5 sm:h-2 md:h-3 bg-white/15 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1500 ease-out shadow-lg shadow-primary-500/50"
                          style={{
                            width: `${job.match}%`,
                            transitionDelay: `${i * 150 + 300}ms`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Role title - bigger on mobile */}
                  <h3 className="text-sm sm:text-lg md:text-lg lg:text-xl font-bold text-white mb-2 sm:mb-3 md:mb-3 leading-tight group-hover:text-primary-200 transition-colors line-clamp-2">
                    {job.role}
                  </h3>

                  {/* Reason - bigger on mobile */}
                  <p className="text-xs sm:text-sm md:text-sm text-gray-300 leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {job.reason}
                  </p>
                </div>

                {/* Corner accent - bigger on mobile */}
                <div className="absolute bottom-0 right-0 w-16 sm:w-24 md:w-28 lg:w-32 h-16 sm:h-24 md:h-28 lg:h-32 bg-gradient-to-tl from-primary-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Icon badge - bigger on mobile */}
                {i === 0 && (
                  <div className="absolute top-2 sm:top-4 md:top-4 left-2 sm:left-4 md:left-4 text-xl sm:text-3xl md:text-4xl animate-bounce">🏆</div>
                )}
                {i === 1 && (
                  <div className="absolute top-2 sm:top-4 md:top-4 left-2 sm:left-4 md:left-4 text-lg sm:text-2xl md:text-3xl">🥈</div>
                )}
              </div>
            ))}
          </div>

          {/* Compact list - Mobile: 3 items (jobs 3-5), Desktop: 3 items (jobs 3-5) */}
          {aiInsights.careerFit.length > 2 && (
            <div className="space-y-2.5 sm:space-y-3 md:space-y-4 max-w-4xl mx-auto">
              {/* Show jobs 3, 4, 5 (slice from index 2) */}
              {aiInsights.careerFit.slice(2, 5).map((job, i) => {
                const actualIndex = i + 2 // Since we're slicing from index 2

                return (
                  <div
                    key={actualIndex}
                    className="group relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-xl hover:border-primary-500/40 hover:scale-[1.01] md:hover:scale-102 transition-all duration-500 opacity-0 animate-slideIn"
                    style={{ animationDelay: `${actualIndex * 150}ms`, animationFillMode: 'forwards' }}
                  >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative p-3 sm:p-4 md:p-5 lg:p-6 flex items-center gap-2.5 sm:gap-3 md:gap-4 lg:gap-6">
                    {/* Rank badge - mobile friendly */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-500/30 to-purple-500/30 border-2 border-primary-500/40 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
                      <span className="text-sm sm:text-base md:text-lg font-black bg-gradient-to-br from-primary-300 to-purple-300 bg-clip-text text-transparent">
                        #{actualIndex + 1}
                      </span>
                    </div>

                    {/* Content - responsive */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-1.5 md:mb-2 group-hover:text-primary-300 transition-colors leading-tight">
                        {job.role}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-400 line-clamp-2">{job.reason}</p>
                    </div>

                    {/* Match percentage - responsive */}
                    <div className="text-right ml-2 sm:ml-3 md:ml-4 flex-shrink-0">
                      <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-br from-primary-400 to-purple-400 bg-clip-text text-transparent leading-none">
                        {job.match}%
                      </div>
                    </div>
                  </div>

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-12 sm:w-16 md:w-20 lg:w-24 h-12 sm:h-16 md:h-20 lg:h-24 bg-gradient-to-bl from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-400">
          <div className="text-5xl md:text-6xl mb-4">🎯</div>
          <p className="text-sm md:text-base">Loading career insights...</p>
        </div>
      ),
      detail: `Based on ${getPossessiveName(isOwnDNA, profile?.full_name).toLowerCase()} unique skill combination`
    },
    // Slide 2: Top 5 Skills
    topSkills.length >= 3 && {
      title: `${getPossessiveName(isOwnDNA, profile?.full_name)} top 5 skills`,
      content: (
        <div className="w-full space-y-4 md:space-y-6 px-4">
          {topSkills.map((skill, index) => {
            const skillName = typeof skill === 'string' ? skill : skill.keyword || skill.name || 'Skill'
            const weight = typeof skill === 'object' && skill.weight ? skill.weight : 1.0
            const percentage = Math.min(100, weight * 100)

            return (
              <div key={index} className="relative group w-full">
                {/* Skill name and percentage */}
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-xl md:text-2xl font-bold text-gray-600">#{index + 1}</span>
                    <span className="text-base md:text-xl font-semibold text-white truncate max-w-[150px] md:max-w-none">{skillName}</span>
                  </div>
                  <span className="text-sm md:text-lg font-mono text-primary-400">{Math.round(percentage)}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-12 md:h-16 bg-white/5 rounded-2xl overflow-hidden relative backdrop-blur-xl border border-white/10">
                  <div
                    className={`h-full rounded-2xl transition-all ease-out ${
                      index === 0
                        ? 'bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500'
                        : 'bg-gradient-to-r from-gray-700 to-gray-600'
                    }`}
                    style={{
                      width: isVisible ? `${percentage}%` : '0%',
                      transitionDuration: '2000ms',
                      transitionDelay: `${index * 150}ms`
                    }}
                  >
                    {/* Shine effect */}
                    {index === 0 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    )}
                  </div>

                  {/* Winner crown */}
                  {index === 0 && isVisible && (
                    <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-3xl md:text-4xl animate-bounce">
                      👑
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ),
      subtitle: "Skill mastery breakdown",
      detail: `${topSkills[0] && (typeof topSkills[0] === 'string' ? topSkills[0] : topSkills[0].keyword)} is ${getPossessiveName(isOwnDNA, profile?.full_name).toLowerCase()} superpower`
    }
  ].filter(Boolean)

  // Ensure currentSlide doesn't exceed bounds
  const validatedSlide = Math.min(currentSlide || 0, Math.max(0, slides.length - 1))
  const slide = slides[validatedSlide]

  return (
    <div id="slide-career-skills" className="min-h-screen flex items-center justify-center px-2 md:px-4 lg:px-8 relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-primary-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => onNavigate(-1, slides.length)}
            className="absolute left-2 md:left-4 lg:left-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
          >
            <span className="text-white text-xl md:text-2xl">←</span>
          </button>
          <button
            onClick={() => onNavigate(1, slides.length)}
            className="absolute right-2 md:right-4 lg:right-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
          >
            <span className="text-white text-xl md:text-2xl">→</span>
          </button>

          {/* Slide indicators */}
          <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onSlideChange(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-8 bg-primary-500' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}

      <div className={`relative z-10 text-center w-full max-w-full md:max-w-[80%] lg:max-w-[56%] mx-auto transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`} id={`slide-career-skills-${currentSlide}`} key={currentSlide}>
        {slide && (
          <>
            <p className="text-gray-400 text-base md:text-xl mb-6 md:mb-8 px-4">
              {slide.title}
            </p>

            {slide.content}

            <p className="text-gray-400 text-sm md:text-lg mt-6 md:mt-8 max-w-2xl mx-auto px-4">
              {slide.subtitle}
            </p>

            <div className="mt-8 md:mt-12 inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mx-4">
              <span className="text-xs md:text-sm text-gray-400">{slide.detail}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
