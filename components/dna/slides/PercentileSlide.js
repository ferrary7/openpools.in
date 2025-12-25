'use client'

import { getPossessiveName, conjugateVerb } from '../utils/pronouns'

export default function PercentileSlide({
  isVisible,
  isOwnDNA,
  profile,
  metrics,
  totalMarkers,
  currentSlide,
  onNavigate,
  onSlideChange
}) {
  const slides = [
    // Slide 1: Main percentile
    {
      title: `${getPossessiveName(isOwnDNA, profile?.full_name)} more skilled than`,
      content: (
        <div className="relative inline-block">
          <div className="text-[120px] md:text-[180px] lg:text-[280px] font-black leading-none tracking-tighter">
            <span className="bg-gradient-to-b from-white via-white to-gray-600 bg-clip-text text-transparent">
              {metrics.percentile}
            </span>
            <span className="text-[80px] md:text-[120px] lg:text-[180px] bg-gradient-to-b from-primary-400 to-purple-600 bg-clip-text text-transparent">
              %
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent blur-3xl -z-10"></div>
        </div>
      ),
      subtitle: "of professionals on OpenPools",
      detail: `Based on ${totalMarkers} skills across ${metrics.daysActive} days`
    },
    // Slide 2: Rarest Skill
    metrics.rarestSkills && metrics.rarestSkills.length > 0 && {
      title: `${getPossessiveName(isOwnDNA, profile?.full_name)} rarest skill`,
      content: (
        <div className="text-center px-4">
          <div className="text-4xl md:text-6xl lg:text-8xl font-black text-white mb-6 md:mb-8 break-words">
            {metrics.rarestSkills[0].skill}
          </div>
          <div className="inline-flex flex-col md:flex-row items-center gap-3 md:gap-4 px-4 md:px-8 py-4 md:py-6 rounded-2xl bg-gradient-to-r from-primary-500/20 to-purple-500/20 backdrop-blur-xl border border-primary-500/30">
            <div className="text-center">
              <div className="text-xs md:text-sm text-gray-400 mb-1">Rarity</div>
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-b from-primary-400 to-purple-600 bg-clip-text text-transparent">
                {metrics.rarestSkills[0].percentage}%
              </div>
            </div>
            <div className="hidden md:block w-px h-16 bg-white/20"></div>
            <div className="text-center">
              <div className="text-xs md:text-sm text-gray-400 mb-1">Professionals with this</div>
              <div className="text-3xl md:text-4xl font-bold text-white">
                {metrics.rarestSkills[0].count}
              </div>
            </div>
          </div>
        </div>
      ),
      subtitle: "Exclusive expertise",
      detail: `Only ${metrics.rarestSkills[0].percentage}% of professionals have this skill`
    }
  ].filter(Boolean)

  // Ensure currentSlide doesn't exceed bounds
  const validatedSlide = Math.min(currentSlide || 0, Math.max(0, slides.length - 1))
  const slide = slides[validatedSlide]

  return (
    <div id="slide-percentile" className="min-h-screen flex items-center justify-center px-4 md:px-8 relative overflow-hidden">
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

      <div className={`relative z-10 text-center transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`} id={`slide-percentile-${currentSlide}`} key={currentSlide}>
        {slide && (
          <>
            <p className="text-gray-400 text-base md:text-xl mb-6 md:mb-8 px-4">
              {slide.title}
            </p>

            {slide.content}

            <p className="text-gray-400 text-lg md:text-2xl mt-6 md:mt-8 max-w-lg mx-auto px-4">
              {slide.subtitle}
            </p>

            <div className="mt-8 md:mt-12 inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-700 delay-300 mx-4">
              <span className="text-xs md:text-sm text-gray-400">{slide.detail}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
