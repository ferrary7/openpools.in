'use client'

import { useEffect, useRef } from 'react'

export default function DNACertificate({ profile, keywordProfile }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    // Make it much taller like DNAHero
    const canvasWidth = 350
    const canvasHeight = 700

    canvas.width = canvasWidth * dpr
    canvas.height = canvasHeight * dpr
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`
    ctx.scale(dpr, dpr)

    drawStaticDNAHelix(ctx, canvasWidth, canvasHeight, helixKeywords)
  }, [keywordProfile])

  const drawStaticDNAHelix = (ctx, width, height, keywords) => {
    ctx.clearRect(0, 0, width, height)

    const centerX = width / 2
    const amplitude = 60
    const frequency = 0.02
    const steps = 120

    // Draw two strands first
    for (let strand = 0; strand < 2; strand++) {
      const strandOffset = strand * Math.PI

      for (let i = 0; i < steps; i++) {
        const y = (i / steps) * height
        const spiralAngle = i * frequency * Math.PI * 2 + strandOffset
        const x = centerX + Math.sin(spiralAngle) * amplitude
        const z = Math.cos(spiralAngle)

        const size = 3 + z * 1.5
        const opacity = 0.4 + z * 0.3

        const hue = strand === 0 ? 330 : 280
        const saturation = 80
        const lightness = 50 + z * 10

        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()

        // Glow effect
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

    // Draw connecting lines
    for (let i = 0; i < steps; i += 3) {
      const y = (i / steps) * height
      const angle1 = i * frequency * Math.PI * 2
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

    // Draw keywords on top
    if (keywords.length > 0) {
      const keywordSpacing = 35
      const numKeywords = Math.min(keywords.length, 20)

      for (let k = 0; k < numKeywords; k++) {
        const y = 30 + k * keywordSpacing
        if (y > height - 30) break

        const keywordObj = keywords[k]
        const keywordText = typeof keywordObj === 'string'
          ? keywordObj
          : keywordObj.keyword || keywordObj.name || ''

        if (keywordText) {
          const normalizedY = y / height
          const helixAngle = normalizedY * frequency * Math.PI * 2 * steps
          const z = Math.cos(helixAngle)

          ctx.font = 'bold 11px Inter, system-ui, sans-serif'
          ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + z * 0.3})`
          ctx.textAlign = 'center'
          ctx.fillText(keywordText, centerX, y + 4)
        }
      }
    }
  }

  const dnaCode = profile
    ? `DNA-${profile.id.slice(0, 3).toUpperCase()}-${keywordProfile?.total_keywords || 0}K`
    : 'DNA-XXX-0K'

  const keywords = keywordProfile?.keywords || []

  // Split keywords: some in helix, others in badges
  const helixKeywords = keywords.slice(0, 20).map(k =>
    typeof k === 'string' ? k : (k.keyword || k.name || '')
  ).filter(Boolean)

  const badgeKeywords = keywords.slice(20, 45).map(k =>
    typeof k === 'string' ? k : (k.keyword || k.name || '')
  ).filter(Boolean)

  // Generate personalized certificate text based on skills
  const generateCertificateText = () => {
    const firstName = profile?.full_name?.split(' ')[0] || 'This individual'
    const topSkills = helixKeywords.slice(0, 3)

    const skillsText = topSkills.length >= 3
      ? `${topSkills[0]}, ${topSkills[1]}, and ${topSkills[2]}`
      : topSkills.length === 2
      ? `${topSkills[0]} and ${topSkills[1]}`
      : topSkills[0] || 'multiple technical domains'

    return `${firstName} demonstrates verified expertise across critical professional domains including ${skillsText}. Their comprehensive skill profile has been authenticated through AI-powered analysis, confirming a depth of knowledge and practical capabilities that distinguish them as a highly qualified professional in their field.`
  }

  return (
    <div className="w-[1200px] h-[1700px] bg-[#1E1E1E] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Certificate Content Container */}
      <div className="relative z-10 p-16 flex flex-col justify-between h-full">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-400 uppercase tracking-[0.3em] mb-2">
            Professional DNA Certificate
          </h1>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent mx-auto"></div>
        </div>

        {/* Main Content Grid: Profile + DNA Helix */}
        <div className="grid grid-cols-2 gap-12 mb-8">

          {/* Left Column: Profile Information */}
          <div className="flex flex-col space-y-5">
            {/* Profile Picture */}
            <div className="w-36 h-36 rounded-full border-4 border-primary-500 shadow-2xl shadow-primary-500/50 ring-4 ring-primary-500/20 overflow-hidden flex-shrink-0">
              {profile?.profile_picture_url ? (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${profile.profile_picture_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                  {profile?.full_name?.charAt(0) || '?'}
                </div>
              )}
            </div>

            {/* Name and Title */}
            <div>
              <h2 className="text-4xl font-bold text-white mb-2 leading-tight">{profile?.full_name || 'Your Name'}</h2>
              {profile?.job_title && (
                <p className="text-lg text-gray-300">
                  {profile.job_title}{profile.company && ` at ${profile.company}`}
                </p>
              )}
            </div>

            {/* DNA Code Badge */}
            <div>
              <div className="inline-flex px-6 py-2.5 bg-primary-500/10 border border-primary-500/30 rounded-full">
                <span className="text-base font-mono text-primary-400 tracking-wider font-bold">
                  {dnaCode}
                </span>
              </div>
            </div>

            {/* Certificate Statement */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <p className="text-sm text-gray-300 leading-relaxed">
                {generateCertificateText()}
              </p>
            </div>
          </div>

          {/* Right Column: DNA Helix */}
          <div className="flex flex-col items-center">
            <div className="mb-3">
              <h3 className="text-lg font-bold text-gray-300 uppercase tracking-wide text-center">
                Professional DNA Signals
              </h3>
            </div>
            <canvas
              ref={canvasRef}
              style={{ filter: 'drop-shadow(0 0 20px rgba(232, 68, 153, 0.3))' }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 text-center">
            <div className="text-4xl font-bold text-primary-400 mb-1">{keywordProfile?.total_keywords || 0}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Verified Skills</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 text-center">
            <div className="text-4xl font-bold text-purple-400 mb-1">
              {profile?.created_at ? Math.floor((new Date() - new Date(profile.created_at)) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Days Active</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 text-center">
            <div className="text-4xl font-bold mb-1" style={{ color: '#E84499' }}>
              {keywordProfile?.keywords ? Math.floor(keywordProfile.keywords.length / 10) * 10 + 10 : 90}%
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Uniqueness</div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-gray-300 uppercase tracking-wide text-center mb-4">
            Additional Verified Skills & Expertise
          </h3>
          <div className="flex flex-wrap justify-center gap-2.5">
            {badgeKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/40 rounded-full text-sm font-medium text-primary-300 inline-flex items-center justify-center"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Verification Footer - Always at bottom */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-base text-gray-400">Verified by</span>
              </div>
              <img src="/logo.svg" alt="OpenPools" className="h-6" style={{ maxHeight: '24px' }} />
              <span className="text-base text-gray-500">•</span>
              <span className="text-base text-gray-400">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="text-sm text-gray-500 font-mono">
              openpools.in/dna/{profile?.username || profile?.id?.slice(0, 8)}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
