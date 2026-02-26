'use client'

import { useState, useEffect, useRef } from 'react'

export default function SupportButton() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Popup card */}
      {open && (
        <div className="mb-1 w-76 w-[300px] rounded-3xl border border-white/10 bg-[#0f0f0f]/95 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] p-6 animate-fadeInUp">

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(232,68,153,0.4)]">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-white">Need help?</p>
              <p className="text-[10px] text-gray-500">We're here for you</p>
            </div>
          </div>

          <div className="h-px w-full bg-white/5 mb-5" />

          {/* Email */}
          <a
            href="mailto:contact@openpools.in"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary-500/30 hover:bg-primary-500/[0.05] transition-all group mb-2"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0 group-hover:bg-primary-500/20 transition-colors">
              <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">Email</p>
              <p className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors truncate">contact@openpools.in</p>
            </div>
            <svg className="w-4 h-4 text-gray-700 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>

          {/* Phone */}
          <a
            href="tel:+916380234974"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">Phone</p>
              <p className="text-sm font-bold text-white group-hover:text-white/80 transition-colors">+91 63802 34974</p>
            </div>
            <svg className="w-4 h-4 text-gray-700 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>

          <p className="text-[10px] text-gray-700 mt-4 text-center tracking-wide">Usually respond within a few minutes</p>
        </div>
      )}

      {/* Trigger button */}
      <div className="flex items-center gap-2 group/btn">
        {/* Label — fades in on hover */}
        <span className="text-[11px] font-semibold text-gray-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 tracking-wide select-none">
          Support
        </span>

        <button
          onClick={() => setOpen(!open)}
          className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            open
              ? 'bg-[#1f1f1f] border border-white/10 rotate-45'
              : 'bg-gradient-to-br from-primary-500/80 to-purple-600/80 border border-primary-500/30 hover:from-primary-500 hover:to-purple-600 hover:shadow-[0_0_20px_rgba(232,68,153,0.3)] hover:scale-105'
          }`}
        >
          {/* Subtle inner ring */}
          {!open && (
            <span className="absolute inset-[3px] rounded-full border border-white/[0.04]" />
          )}

          {open ? (
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          )}
        </button>
      </div>

    </div>
  )
}
