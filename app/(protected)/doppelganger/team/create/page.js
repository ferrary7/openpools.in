'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDoppelgangerStore } from '@/store/doppelgangerStore'

export default function CreateTeamPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const { event, team, loading, createTeam, fetchEvent } = useDoppelgangerStore()

  useEffect(() => {
    fetchEvent().then((evt) => {
      // Redirect if no active event
      if (!evt) {
        router.push('/dashboard')
      }
    })
  }, [fetchEvent, router])

  useEffect(() => {
    if (team) {
      router.push(`/doppelganger/team/${encodeURIComponent(team.name)}`)
    }
  }, [team, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (name.trim().length < 2) {
      setError('Signal identity must be at least 2 characters')
      return
    }

    const newTeam = await createTeam(name.trim(), event?.id)
    if (newTeam) {
      router.push(`/doppelganger/team/${encodeURIComponent(newTeam.name)}`)
    }
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">INITIALIZING SQUAD TERMINAL...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-24 animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link href="/doppelganger" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-10 transition-colors group">
          <div className="p-2 glass-dark rounded-xl border border-white/5 group-hover:border-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="font-black text-[10px] tracking-[0.2em] uppercase">ABORT TO HANGAR</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="glass-dark rounded-[3rem] border border-white/5 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full group-hover:bg-purple-500/10 transition-all duration-1000"></div>

              <div className="px-8 py-10 md:px-12 md:py-16 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-10 shadow-2xl shadow-purple-500/20">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-2">ENLIST <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">SQUAD</span></h1>
                <p className="text-gray-500 font-bold text-[10px] tracking-[0.2em] uppercase mb-12">{event.name}</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest animate-shake">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">
                      SQUAD SIGNAL IDENTITY
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="CALLSIGN_ALPHA"
                      className="w-full px-6 py-5 bg-[#0A0A0A] border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xl font-black tracking-widest uppercase placeholder:text-gray-800 italic"
                      autoFocus
                    />
                    <p className="text-[10px] text-gray-600 mt-4 font-bold tracking-tight">
                      Final callsign for the Hall of Fame. Make it resonant.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || name.trim().length < 2}
                    className="w-full py-6 bg-white text-black rounded-2xl font-black text-sm tracking-[0.2em] uppercase hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 group/btn shadow-2xl shadow-white/5"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        INITIATING...
                      </>
                    ) : (
                      <>
                        COMMENCE SQUAD FORMATION
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Tactical Briefing HUD */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                  <span className="text-xl">📋</span>
                </div>
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">TACTICAL BRIEFING</h2>
              </div>

              <div className="space-y-8">
                {[
                  { step: '01', title: 'COMMANDER ASSIGNMENT', desc: 'You will be designated as the Team Captain with full deployment authority.' },
                  { step: '02', title: 'OPERATOR ENLISTMENT', desc: `Invite ${event.min_team_size - 1} to ${event.max_team_size - 1} additional operators via secure email channels.` },
                  { step: '03', title: 'TWIN SIGNAL SEARCH', desc: 'Sync with your Doppelganger to achieve maximum skill resonance.' },
                  { step: '04', title: 'MISSION GENERATION', desc: 'AI will synthesize a custom problem statement once the squad is verified.' }
                ].map((item) => (
                  <div key={item.step} className="flex gap-6 group hover:translate-x-2 transition-transform duration-300">
                    <div className="text-sm font-black text-purple-500 italic shrink-0 mt-1 opacity-50 group-hover:opacity-100 transition-opacity">{item.step}</div>
                    <div>
                      <h4 className="text-[10px] font-black text-white hover:text-purple-400 transition-colors uppercase tracking-widest mb-1">{item.title}</h4>
                      <p className="text-[10px] text-gray-500 font-bold leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">SYSTEM_READY</span>
                </div>
                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tight leading-relaxed">
                  Awaiting Squad Callsign for final registration into the {event.name} stream.
                </p>
              </div>
            </div>

            <div className="px-8 flex items-center gap-4 opacity-30 italic">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">DO NOT ABORT DURING FORMATION</span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-800 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
