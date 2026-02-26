'use client'

import { useState, useEffect } from 'react'

function useCountUp(target, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime = null
    let animationFrame
    let timeout

    timeout = setTimeout(() => {
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
        setCount(Math.floor(eased * target))
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        } else {
          setCount(target)
        }
      }
      animationFrame = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(animationFrame)
    }
  }, [target, duration, delay])

  return count
}

export default function PrizeCards() {
  const first  = useCountUp(10000, 1200, 0)
  const second = useCountUp(7000,  1000, 150)
  const third  = useCountUp(3000,  800,  300)

  const fmt = (n) => n.toLocaleString('en-IN')

  return (
    <div>
      <div className="flex justify-between items-baseline mb-4">
        <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Prize Pool</h4>
        <span className="text-sm font-black text-primary-500">₹20,000 total</span>
      </div>

      <div className="space-y-2">

        {/* 1st */}
        <div className="relative overflow-hidden rounded-2xl border border-primary-500/40 bg-primary-500/[0.06] p-5 cursor-default group">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-primary-500/15 to-transparent transition-transform duration-700 ease-in-out" />
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">01</span>
            <span className="text-4xl font-black text-white tracking-tight drop-shadow-[0_0_25px_rgba(232,68,153,0.7)]">
              ₹{fmt(first)}
            </span>
          </div>
        </div>

        {/* 2nd */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 cursor-default group">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 ease-in-out" />
          <div className="relative flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">02</span>
            <span className="text-3xl font-black text-white/60 tracking-tight">
              ₹{fmt(second)}
            </span>
          </div>
        </div>

        {/* 3rd */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-4 cursor-default group">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-700 ease-in-out" />
          <div className="relative flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">03</span>
            <span className="text-2xl font-black text-white/40 tracking-tight">
              ₹{fmt(third)}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
