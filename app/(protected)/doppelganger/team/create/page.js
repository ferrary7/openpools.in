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
      setError('Team name must be at least 2 characters')
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
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  const steps = [
    { num: '1', title: 'Create Team', desc: 'You become the team lead with full control.' },
    { num: '2', title: 'Invite Members', desc: `Add ${event.min_team_size - 1} to ${event.max_team_size - 1} teammates via email.` },
    { num: '3', title: 'Get Verified', desc: 'All members need skill profiles to unlock the challenge.' },
    { num: '4', title: 'Generate Challenge', desc: 'AI crafts a problem based on your combined skills.' }
  ]

  return (
    <div className="min-h-screen py-16 md:py-24 animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <Link href="/doppelganger" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-10 transition-colors text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to event
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="glass-dark rounded-[2.5rem] border border-white/5 overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mb-8">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create Your Team</h1>
                <p className="text-sm text-gray-500 mb-10">{event.name}</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter a team name"
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-lg font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/30 transition-all placeholder:text-gray-700"
                      autoFocus
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      This name will appear on the leaderboard.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || name.trim().length < 2}
                    className="w-full py-4 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-400 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Team
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Steps sidebar */}
          <div className="lg:col-span-5">
            <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">How it works</h2>

              <div className="space-y-6">
                {steps.map((item) => (
                  <div key={item.num} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-primary-400 shrink-0">
                      {item.num}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-0.5">{item.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
