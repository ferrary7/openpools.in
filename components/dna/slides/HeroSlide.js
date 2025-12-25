'use client'

import DNAHelixCanvas from '../DNAHelixCanvas'

export default function HeroSlide({ isVisible, profile, keywordProfile, totalMarkers, dnaCode, daysActive }) {
  return (
    <div id="slide-hero" className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-primary-500/5 to-[#0A0A0A]"></div>

      <div className={`relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-16 items-center transition-all duration-1500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}>
        {/* Left: Text */}
        <div className="space-y-6 md:space-y-8 text-center md:text-left">
          <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-primary-500">
              {profile?.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center text-white text-xs md:text-sm font-bold">
                  {profile?.full_name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] md:text-xs font-mono text-primary-400">{dnaCode}</span>
              <span className="text-xs md:text-sm font-semibold text-white truncate max-w-[150px] md:max-w-none">{profile?.full_name}</span>
            </div>
          </div>

          <div>
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-white leading-none mb-3 md:mb-4 tracking-tight">
              Professional<br/>
              <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                DNA
              </span>
            </h1>
            <p className="text-base md:text-xl text-gray-400">
              {totalMarkers} unique skills mapped across {daysActive} days
            </p>
          </div>

          {profile?.job_title && (
            <div className="flex items-center gap-2 text-gray-400 justify-center md:justify-start">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-sm md:text-base">{profile.job_title} {profile.company && `at ${profile.company}`}</span>
            </div>
          )}
        </div>

        {/* Right: DNA Helix */}
        <div className={`flex justify-center transition-all duration-1500 delay-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}>
          <DNAHelixCanvas keywords={keywordProfile?.keywords || []} />
        </div>
      </div>
    </div>
  )
}
