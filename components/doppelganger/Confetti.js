'use client'

import { useEffect, useState } from 'react'

export default function Confetti({ duration = 5000 }) {
  const [particles, setParticles] = useState([])
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    const colors = ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#ffffff']
    const newParticles = []

    // Two burst origins — left-center and right-center
    const origins = [
      { x: 25, y: 60 },
      { x: 75, y: 60 }
    ]

    for (let i = 0; i < 150; i++) {
      const origin = origins[i % origins.length]
      const angle = -90 + (Math.random() - 0.5) * 140 // spread upward in a cone
      const velocity = 600 + Math.random() * 500
      const rad = (angle * Math.PI) / 180

      newParticles.push({
        id: i,
        originX: origin.x + (Math.random() - 0.5) * 10,
        originY: origin.y + (Math.random() - 0.5) * 5,
        vx: Math.cos(rad) * velocity,
        vy: Math.sin(rad) * velocity,
        delay: Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        spin: (Math.random() - 0.5) * 1080,
        type: Math.random() > 0.5 ? 'rect' : 'circle'
      })
    }

    setParticles(newParticles)

    const timer = setTimeout(() => {
      setIsActive(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  if (!isActive || particles.length === 0) return null

  return (
    <>
      <style>
        {particles.map(p => `
          @keyframes confetti-${p.id} {
            0% {
              transform: translate(0, 0) rotate(${p.rotation}deg);
              opacity: 1;
            }
            20% {
              transform: translate(${p.vx * 0.2}px, ${p.vy * 0.2}px) rotate(${p.rotation + p.spin * 0.2}deg);
              opacity: 1;
            }
            60% {
              opacity: 1;
            }
            100% {
              transform: translate(${p.vx * 0.35}px, ${p.vy * 0.2 + 800}px) rotate(${p.rotation + p.spin}deg);
              opacity: 0;
            }
          }
        `).join('')}
      </style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          overflow: 'hidden'
        }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.originX}%`,
              top: `${p.originY}%`,
              animation: `confetti-${p.id} 2.5s cubic-bezier(0.15, 0.8, 0.3, 1) forwards`,
              animationDelay: `${p.delay}s`,
              opacity: 0,
            }}
          >
            <div
              style={{
                width: p.size,
                height: p.type === 'rect' ? p.size * 0.6 : p.size,
                backgroundColor: p.color,
                borderRadius: p.type === 'circle' ? '50%' : '2px',
              }}
            />
          </div>
        ))}
      </div>
    </>
  )
}
