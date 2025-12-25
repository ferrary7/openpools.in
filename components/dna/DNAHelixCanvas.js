'use client'

import { useState, useEffect, useRef } from 'react'

export default function DNAHelixCanvas({ keywords = [], className = '' }) {
  const [rotation, setRotation] = useState(0)
  const [keywordOffset, setKeywordOffset] = useState(0)
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef(null)

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

    drawDNAHelix(ctx, rotation, keywords, keywordOffset, canvasWidth, canvasHeight)
  }, [rotation, keywordOffset, mounted, keywords])

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

  return (
    <div className={`relative ${className}`}>
      {/* Glow effect behind canvas */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 opacity-20 blur-3xl rounded-full"></div>

      {/* DNA Helix Canvas */}
      <canvas
        ref={canvasRef}
        className="relative z-10"
        style={{ filter: 'drop-shadow(0 0 20px rgba(232, 68, 153, 0.3))' }}
      />
    </div>
  )
}
