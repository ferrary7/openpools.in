'use client'

import { useState, useEffect, useRef } from 'react'

export default function DNAHero({ profile, keywordProfile, isOwnDNA = true }) {
  const [mounted, setMounted] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [keywordOffset, setKeywordOffset] = useState(0)
  const canvasRef = useRef(null)

  // Personalized text based on ownership
  const titleText = isOwnDNA ? 'Your Professional DNA' : `${profile?.full_name || 'Professional'}'s DNA`
  const descriptionText = isOwnDNA
    ? 'A unique genetic blueprint of your skills, expertise, and professional identity.'
    : `A unique genetic blueprint of ${profile?.full_name?.split(' ')[0] || 'their'}'s skills, expertise, and professional identity.`
  const scrollText = isOwnDNA ? 'Explore Your DNA' : `Explore ${profile?.full_name?.split(' ')[0] || 'Their'}'s DNA`

  useEffect(() => {
    setMounted(true)
    // Continuous rotation and keyword flow
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360)
      setKeywordOffset(prev => prev + 0.3) // Keywords flow speed
    }, 30)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !mounted) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    // Responsive canvas size
    const isMobile = window.innerWidth < 768
    const canvasWidth = isMobile ? 280 : 400
    const canvasHeight = isMobile ? 420 : 600

    // Set canvas size
    canvas.width = canvasWidth * dpr
    canvas.height = canvasHeight * dpr
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`
    ctx.scale(dpr, dpr)

    drawDNAHelix(ctx, rotation, keywordProfile?.keywords || [], keywordOffset, canvasWidth, canvasHeight)
  }, [rotation, keywordOffset, mounted, keywordProfile])

  const drawDNAHelix = (ctx, angle, keywords, keywordFlowOffset, width = 400, height = 600) => {
    ctx.clearRect(0, 0, width, height)

    const centerX = width / 2
    const helixHeight = height
    const amplitude = width < 300 ? 55 : 80 // Width of the helix - smaller on mobile
    const frequency = 0.02 // How tight the spiral is
    const steps = 100

    if (keywords.length === 0) return

    // Draw two strands of the DNA helix
    for (let strand = 0; strand < 2; strand++) {
      const strandOffset = strand * Math.PI

      for (let i = 0; i < steps; i++) {
        const y = (i / steps) * helixHeight
        const spiralAngle = i * frequency * Math.PI * 2 + (angle * Math.PI / 180) + strandOffset
        const x = centerX + Math.sin(spiralAngle) * amplitude
        const z = Math.cos(spiralAngle) // For depth effect

        // Size based on depth (closer = bigger)
        const size = 3 + z * 1.5
        const opacity = 0.4 + z * 0.3

        // Gradient colors - hot pink to purple
        const hue = strand === 0 ? 330 : 280 // Pink vs Purple
        const saturation = 80
        const lightness = 50 + z * 10

        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()

        // Add glow effect
        if (i % 5 === 0) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15)
          gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity * 0.6})`)
          gradient.addColorStop(1, 'transparent')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(x, y, 15, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // Draw connecting lines (base pairs)
    for (let i = 0; i < steps; i += 3) {
      const y = (i / steps) * helixHeight
      const angle1 = i * frequency * Math.PI * 2 + (angle * Math.PI / 180)
      const angle2 = angle1 + Math.PI

      const x1 = centerX + Math.sin(angle1) * amplitude
      const x2 = centerX + Math.sin(angle2) * amplitude
      const z = Math.cos(angle1)

      const opacity = 0.15 + z * 0.15

      ctx.strokeStyle = `rgba(232, 68, 153, ${opacity})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x1, y)
      ctx.lineTo(x2, y)
      ctx.stroke()
    }

    // Draw smoothly flowing keywords
    if (keywords.length > 0) {
      const keywordSpacing = 60 // Spacing between keywords in pixels
      const numVisibleKeywords = Math.ceil(helixHeight / keywordSpacing) + 2

      for (let k = 0; k < numVisibleKeywords; k++) {
        // Calculate smooth Y position for this keyword
        const baseY = (k * keywordSpacing - (keywordFlowOffset % keywordSpacing))
        const y = baseY

        // Skip if outside bounds (with margin for fade)
        if (y < -100 || y > helixHeight + 100) continue

        // Calculate which keyword to show (cycling through the array)
        const keywordIndex = Math.floor((keywordFlowOffset + k * keywordSpacing) / keywordSpacing) % keywords.length
        const keywordObj = keywords[keywordIndex]

        // Calculate position along helix for this Y
        const normalizedY = y / helixHeight
        const helixAngle = normalizedY * frequency * Math.PI * 2 * steps + (angle * Math.PI / 180)
        const x1 = centerX + Math.sin(helixAngle) * amplitude
        const x2 = centerX + Math.sin(helixAngle + Math.PI) * amplitude
        const textX = (x1 + x2) / 2
        const z = Math.cos(helixAngle)

        // Calculate fade in/out based on position
        let edgeFade = 1
        if (y < 80) {
          edgeFade = Math.max(0, y / 80) // Fade in from top
        } else if (y > helixHeight - 80) {
          edgeFade = Math.max(0, (helixHeight - y) / 80) // Fade out at bottom
        }

        if (edgeFade > 0.05) {
          const textOpacity = (0.5 + z * 0.3) * edgeFade

          // Extract keyword text from object
          const keywordText = typeof keywordObj === 'string'
            ? keywordObj
            : keywordObj.keyword || keywordObj.name || ''

          if (keywordText) {
            ctx.font = 'bold 11px Inter, system-ui, sans-serif'
            ctx.fillStyle = `rgba(255, 200, 230, ${textOpacity})`
            ctx.textAlign = 'center'
            ctx.fillText(keywordText, textX, y + 4)
          }
        }
      }
    }
  }

  // Calculate DNA code from profile
  const dnaCode = profile
    ? `DNA-${profile.id.slice(0, 3).toUpperCase()}-${keywordProfile?.total_keywords || 0}K`
    : 'DNA-XXX-0K'

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1E1E1E]">
      {/* Certificate Title - Only visible in download */}
      <div className="absolute top-8 left-0 right-0 opacity-0 dna-card-title">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-400 uppercase tracking-widest">Professional DNA Certificate</h2>
        </div>
      </div>

      {/* Subtle glow effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {mounted && [...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary-500/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Text Content */}
          <div className={`text-left transition-all duration-1000 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            {/* Profile Picture */}
            <div className="mb-6 md:mb-8 flex items-center gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden border-2 md:border-4 border-primary-500 shadow-2xl shadow-primary-500/50 ring-2 md:ring-4 ring-primary-500/20 flex-shrink-0">
                {profile?.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center text-white text-xl md:text-3xl font-bold">
                    {profile?.full_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs md:text-sm font-mono text-primary-400 mb-1">{dnaCode}</div>
                <h1 className="text-2xl md:text-4xl font-bold text-white truncate">{profile?.full_name || 'Your Name'}</h1>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              <div className="inline-block">
                <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500 bg-clip-text text-transparent animate-gradient-x mb-2 leading-tight">
                  {titleText}
                </h2>
              </div>

              <p className="text-base md:text-xl text-gray-300 leading-relaxed max-w-lg">
                {descriptionText}
              </p>

              {profile?.job_title && (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <span className="text-sm md:text-lg">{profile.job_title} {profile.company && `at ${profile.company}`}</span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-white/10">
                <div className="text-xl md:text-3xl font-bold text-primary-400">{keywordProfile?.total_keywords || 0}</div>
                <div className="text-xs text-gray-400 mt-1">DNA Markers</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-white/10">
                <div className="text-xl md:text-3xl font-bold text-purple-400">
                  {profile?.created_at ? Math.floor((new Date() - new Date(profile.created_at)) / (1000 * 60 * 60 * 24)) : 0}
                </div>
                <div className="text-xs text-gray-400 mt-1">Days Active</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-white/10">
                <div className="text-xl md:text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                  {keywordProfile?.keywords ? Math.floor(keywordProfile.keywords.length / 10) * 10 + 10 : 90}%
                </div>
                <div className="text-xs text-gray-400 mt-1">Uniqueness</div>
              </div>
            </div>

            {/* Top Skills - Always visible */}
            {keywordProfile?.keywords && keywordProfile.keywords.length > 0 && (
              <div className="mb-4 md:mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 md:mb-3">Verified Skills & Expertise</h3>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {keywordProfile.keywords.slice(0, 8).map((keyword, index) => {
                    const keywordText = typeof keyword === 'string'
                      ? keyword
                      : keyword.keyword || keyword.name || ''
                    return keywordText ? (
                      <span
                        key={index}
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/40 rounded-full text-xs md:text-sm font-medium text-primary-300"
                      >
                        {keywordText}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Extended Skills - Only visible in certificate download */}
            {keywordProfile?.keywords && keywordProfile.keywords.length > 8 && (
              <div className="mb-4 md:mb-6 opacity-0 dna-card-extended-skills">
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {keywordProfile.keywords.slice(8, 18).map((keyword, index) => {
                    const keywordText = typeof keyword === 'string'
                      ? keyword
                      : keyword.keyword || keyword.name || ''
                    return keywordText ? (
                      <span
                        key={index}
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/40 rounded-full text-xs md:text-sm font-medium text-primary-300"
                      >
                        {keywordText}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Share Button or Create Yours */}
            <div className="flex justify-start">
              {isOwnDNA ? (
                <button
                  onClick={() => {
                    document.getElementById('dna-share-section')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="group flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="text-sm font-medium">Share My DNA</span>
                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              ) : (
                <a
                  href="/dna"
                  className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium">Create Yours</span>
                </a>
              )}
            </div>
          </div>

          {/* Right: DNA Helix Animation */}
          <div className={`flex justify-center md:justify-end transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'} mt-8 md:mt-0`}>
            <div className="relative">
              {/* Glow effect behind canvas */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 opacity-20 blur-3xl rounded-full"></div>

              {/* DNA Helix Canvas */}
              <canvas
                ref={canvasRef}
                className="relative z-10"
                style={{ filter: 'drop-shadow(0 0 20px rgba(232, 68, 153, 0.3))' }}
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hidden md:flex absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <span className="text-sm">{scrollText}</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Verification Footer - visible in download */}
        <div className="absolute bottom-6 left-0 right-0 opacity-0 dna-card-verification">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">
                    Verified by OpenPools AI • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>openpools.in/dna/{profile?.id?.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 0.3; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 0.5; }
          90% { opacity: 0.3; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s linear infinite;
        }
        .animate-float {
          animation: float linear infinite;
        }

        /* Fix gradient text for image download */
        section.downloading-dna-card .bg-gradient-to-r.from-primary-500.via-purple-500.to-primary-500.bg-clip-text.text-transparent {
          background: none !important;
          -webkit-background-clip: unset !important;
          background-clip: unset !important;
          color: #E84499 !important;
          -webkit-text-fill-color: unset !important;
        }
        section.downloading-dna-card .bg-gradient-to-r.from-primary-400.to-purple-400.bg-clip-text.text-transparent {
          background: none !important;
          -webkit-background-clip: unset !important;
          background-clip: unset !important;
          color: #E84499 !important;
          -webkit-text-fill-color: unset !important;
        }

        /* Hide elements that shouldn't appear in downloaded card */
        section.downloading-dna-card .animate-bounce {
          display: none !important;
        }
        /* Hide the glow effect behind helix */
        section.downloading-dna-card .absolute.inset-0.bg-gradient-to-r {
          display: none !important;
        }
        /* Hide share button in downloaded card */
        section.downloading-dna-card button,
        section.downloading-dna-card a[href="/dna"] {
          display: none !important;
        }

        /* Show verification footer only in downloaded card */
        section.downloading-dna-card .dna-card-verification {
          opacity: 1 !important;
        }

        /* Show extended skills only in downloaded card */
        section.downloading-dna-card .dna-card-extended-skills {
          opacity: 1 !important;
        }

        /* Show certificate title only in downloaded card */
        section.downloading-dna-card .dna-card-title {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  )
}
