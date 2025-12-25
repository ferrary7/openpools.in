'use client'

/**
 * Reusable wrapper component for slides with navigation controls
 * Eliminates code duplication for navigation arrows, indicators, and layout
 */
export default function SlideWrapper({
  slides,
  currentSlide,
  isVisible,
  sectionId,
  onNavigate,
  onSlideChange,
  gradientColor = 'primary' // 'primary' or 'purple'
}) {
  if (!slides || slides.length === 0) return null

  const slide = slides[currentSlide]

  const gradientClass = {
    primary: 'bg-primary-500/10',
    purple: 'bg-purple-500/10'
  }[gradientColor]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 md:px-8 relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] ${gradientClass} rounded-full blur-3xl`}></div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => onNavigate(-1, slides.length)}
            className="absolute left-2 md:left-4 lg:left-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
            aria-label="Previous slide"
          >
            <span className="text-white text-xl md:text-2xl">←</span>
          </button>
          <button
            onClick={() => onNavigate(1, slides.length)}
            className="absolute right-2 md:right-4 lg:right-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
            aria-label="Next slide"
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
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Slide content */}
      {slide && (
        <div className={`relative z-10 text-center transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`} key={currentSlide}>
          {slide.title && (
            <p className="text-gray-400 text-base md:text-xl mb-6 md:mb-8 px-4">
              {slide.title}
            </p>
          )}

          {slide.content}

          {slide.subtitle && (
            <p className="text-gray-400 text-sm md:text-lg mt-6 md:mt-8 max-w-2xl mx-auto px-4">
              {slide.subtitle}
            </p>
          )}

          {slide.detail && (
            <div className="mt-8 md:mt-12 inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-700 delay-300 mx-4">
              <span className="text-xs md:text-sm text-gray-400">{slide.detail}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
