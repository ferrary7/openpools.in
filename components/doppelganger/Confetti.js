'use client'

import { useEffect, useState } from 'react'

export default function Confetti({ duration = 5000 }) {
  const [particles, setParticles] = useState([])
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    // Generate confetti particles
    const colors = ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#ffffff']
    const newParticles = []

    for (let i = 0; i < 150; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
        fallDuration: 3 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        drift: (Math.random() - 0.5) * 100,
        type: Math.random() > 0.5 ? 'rect' : 'circle'
      })
    }

    setParticles(newParticles)

    // Stop confetti after duration
    const timer = setTimeout(() => {
      setIsActive(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  if (!isActive || particles.length === 0) return null

  return (
    <>
      <style>
        {`
          @keyframes confetti-fall {
            0% {
              transform: translateY(-20px) translateX(0px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) translateX(var(--drift)) rotate(720deg);
              opacity: 0;
            }
          }
        `}
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
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: 0,
              '--drift': `${particle.drift}px`,
              animation: `confetti-fall ${particle.fallDuration}s ease-out forwards`,
              animationDelay: `${particle.delay}s`,
            }}
          >
            <div
              style={{
                width: particle.size,
                height: particle.type === 'rect' ? particle.size * 0.6 : particle.size,
                backgroundColor: particle.color,
                borderRadius: particle.type === 'circle' ? '50%' : '2px',
                transform: `rotate(${particle.rotation}deg)`,
              }}
            />
          </div>
        ))}
      </div>
    </>
  )
}
