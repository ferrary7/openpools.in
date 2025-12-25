'use client'

import { getPossessiveName } from '../utils/pronouns'

export default function SkillInsightsSlide({
  isVisible,
  isOwnDNA,
  profile,
  aiInsights,
  aiLoading,
  currentSlide,
  onNavigate,
  onSlideChange
}) {
  const slides = [
    // Slide 1: Johari Window
    {
      title: `${getPossessiveName(isOwnDNA, profile?.full_name)} Professional Johari Window`,
      content: aiLoading ? (
        <div className="text-center">
          <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 rounded-full border-2 border-t-primary-500 animate-spin"></div>
          <p className="text-gray-400 text-sm md:text-base">Mapping skill quadrants...</p>
        </div>
      ) : aiInsights?.johariWindow ? (
        <div className="max-w-5xl mx-auto relative px-4">
          {/* Axis Labels */}
          <div className="mb-6 md:mb-8 flex items-center justify-center">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-[10px] md:text-xs font-semibold text-gray-300 uppercase tracking-wider text-center">Known to Self</div>
              <div className="text-gray-500 hidden md:block">←→</div>
              <div className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Unknown to Self</div>
            </div>
          </div>

          {/* Main Window Container */}
          <div className="relative p-0.5 md:p-1 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary-500/30 via-purple-500/30 to-pink-500/30">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary-500/10 via-purple-500/10 to-pink-500/10 blur-2xl"></div>

            {/* Inner container */}
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-[#0A0A0A]">
              {/* The 4 Quadrants */}
              <div className="grid grid-cols-2 gap-0">
                {/* OPEN ARENA */}
                <div className="relative group overflow-hidden border-r border-b border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/15 to-transparent opacity-100 group-hover:opacity-100 group-hover:from-primary-500/20 transition-all duration-700"></div>
                  <div className="absolute top-0 left-0 w-20 md:w-32 h-20 md:h-32 bg-gradient-to-br from-primary-500/30 to-transparent blur-2xl"></div>

                  <div className="relative p-4 md:p-8 min-h-[200px] md:min-h-[280px]">
                    <div className="flex items-start justify-between mb-4 md:mb-6">
                      <div>
                        <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-lg md:text-2xl">
                            👁️
                          </div>
                          <div className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-white/5 border border-white/10">
                            <span className="text-[10px] md:text-xs font-bold text-primary-400">{(Array.isArray(aiInsights.johariWindow.open) ? aiInsights.johariWindow.open : []).length} skills</span>
                          </div>
                        </div>
                        <h3 className="text-lg md:text-2xl font-black bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-0.5 md:mb-1">Open Arena</h3>
                        <p className="text-[9px] md:text-xs text-gray-500 uppercase tracking-wide">Public Knowledge</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2.5">
                      {(Array.isArray(aiInsights.johariWindow.open) ? aiInsights.johariWindow.open : []).map((skill, i) => (
                        <div key={i} className="flex items-center gap-1.5 md:gap-2 group/skill opacity-0 animate-slideIn" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}>
                          <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-primary-400 group-hover/skill:scale-[2] transition-transform"></div>
                          <span className="text-xs md:text-sm text-gray-300 group-hover/skill:text-white group-hover/skill:translate-x-1 transition-all">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BLIND SPOT */}
                <div className="relative group overflow-hidden border-b border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/15 to-transparent opacity-100 group-hover:opacity-100 group-hover:from-purple-500/20 transition-all duration-700"></div>
                  <div className="absolute top-0 right-0 w-20 md:w-32 h-20 md:h-32 bg-gradient-to-bl from-purple-500/30 to-transparent blur-2xl"></div>

                  <div className="relative p-4 md:p-8 min-h-[200px] md:min-h-[280px]">
                    <div className="flex items-start justify-between mb-4 md:mb-6">
                      <div>
                        <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-lg md:text-2xl">
                            👓
                          </div>
                          <div className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-white/5 border border-white/10">
                            <span className="text-[10px] md:text-xs font-bold text-purple-400">{(Array.isArray(aiInsights.johariWindow.blind) ? aiInsights.johariWindow.blind : []).length} skills</span>
                          </div>
                        </div>
                        <h3 className="text-lg md:text-2xl font-black bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-0.5 md:mb-1">Blind Spot</h3>
                        <p className="text-[9px] md:text-xs text-gray-500 uppercase tracking-wide">Others See This</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2.5">
                      {(Array.isArray(aiInsights.johariWindow.blind) ? aiInsights.johariWindow.blind : []).map((skill, i) => (
                        <div key={i} className="flex items-center gap-1.5 md:gap-2 group/skill opacity-0 animate-slideIn" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}>
                          <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-purple-400 group-hover/skill:scale-[2] transition-transform"></div>
                          <span className="text-xs md:text-sm text-gray-300 group-hover/skill:text-white group-hover/skill:translate-x-1 transition-all">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* HIDDEN FACADE */}
                <div className="relative group overflow-hidden border-r border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/15 to-transparent opacity-100 group-hover:opacity-100 group-hover:from-purple-500/20 transition-all duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-20 md:w-32 h-20 md:h-32 bg-gradient-to-tr from-purple-500/30 to-transparent blur-2xl"></div>

                  <div className="relative p-4 md:p-8 min-h-[200px] md:min-h-[280px]">
                    <div className="flex items-start justify-between mb-4 md:mb-6">
                      <div>
                        <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-lg md:text-2xl">
                            🎭
                          </div>
                          <div className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-white/5 border border-white/10">
                            <span className="text-[10px] md:text-xs font-bold text-purple-400">{(Array.isArray(aiInsights.johariWindow.hidden) ? aiInsights.johariWindow.hidden : []).length} skills</span>
                          </div>
                        </div>
                        <h3 className="text-lg md:text-2xl font-black bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-0.5 md:mb-1">Hidden Facade</h3>
                        <p className="text-[9px] md:text-xs text-gray-500 uppercase tracking-wide">Private Knowledge</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2.5">
                      {(Array.isArray(aiInsights.johariWindow.hidden) ? aiInsights.johariWindow.hidden : []).map((skill, i) => (
                        <div key={i} className="flex items-center gap-1.5 md:gap-2 group/skill opacity-0 animate-slideIn" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}>
                          <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-purple-400 group-hover/skill:scale-[2] transition-transform"></div>
                          <span className="text-xs md:text-sm text-gray-300 group-hover/skill:text-white group-hover/skill:translate-x-1 transition-all">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* UNKNOWN */}
                <div className="relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tl from-pink-500/15 to-transparent opacity-100 group-hover:opacity-100 group-hover:from-pink-500/20 transition-all duration-700"></div>
                  <div className="absolute bottom-0 right-0 w-20 md:w-32 h-20 md:h-32 bg-gradient-to-tl from-pink-500/30 to-transparent blur-2xl"></div>

                  <div className="relative p-4 md:p-8 min-h-[200px] md:min-h-[280px]">
                    <div className="flex items-start justify-between mb-4 md:mb-6">
                      <div>
                        <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-lg md:text-2xl">
                            ✨
                          </div>
                          <div className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-white/5 border border-white/10">
                            <span className="text-[10px] md:text-xs font-bold text-pink-400">{(Array.isArray(aiInsights.johariWindow.unknown) ? aiInsights.johariWindow.unknown : []).length} skills</span>
                          </div>
                        </div>
                        <h3 className="text-lg md:text-2xl font-black bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-0.5 md:mb-1">Unknown</h3>
                        <p className="text-[9px] md:text-xs text-gray-500 uppercase tracking-wide">Undiscovered</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2.5">
                      {(Array.isArray(aiInsights.johariWindow.unknown) ? aiInsights.johariWindow.unknown : []).map((skill, i) => (
                        <div key={i} className="flex items-center gap-1.5 md:gap-2 group/skill opacity-0 animate-slideIn" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}>
                          <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-pink-400 group-hover/skill:scale-[2] transition-transform"></div>
                          <span className="text-xs md:text-sm text-gray-300 group-hover/skill:text-white group-hover/skill:translate-x-1 transition-all">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center intersection indicator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 blur-xl opacity-40 animate-pulse"></div>
            </div>
          </div>

          {/* Bottom axis */}
          <div className="mt-6 md:mt-8 flex items-center justify-center">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-[10px] md:text-xs font-semibold text-gray-300 uppercase tracking-wider text-center">Known to Others</div>
              <div className="text-gray-500 hidden md:block">↕</div>
              <div className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Unknown to Others</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400">
          <div className="text-5xl md:text-6xl mb-4">🪟</div>
          <p className="text-sm md:text-base">Loading skill insights...</p>
        </div>
      ),
      subtitle: "Four dimensions of professional awareness",
      detail: "Understanding what you know, what others see, and what's yet to be discovered"
    },
    // Note: Roadmap and Power Combos slides would go here - keeping them in DNAWrap for now
  ]

  const slide = slides[currentSlide]

  return (
    <div id="slide-skill-insights" className="min-h-screen flex items-center justify-center px-4 md:px-8 relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation arrows - only if multiple slides */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => onNavigate(-1)}
            className="absolute left-2 md:left-4 lg:left-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
          >
            <span className="text-white text-xl md:text-2xl">←</span>
          </button>
          <button
            onClick={() => onNavigate(1)}
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
      }`} id={`slide-skill-insights-${currentSlide}`} key={currentSlide}>
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
      </div>
    </div>
  )
}
