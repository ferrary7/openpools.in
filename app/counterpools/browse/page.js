'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Playfair_Display, Inter } from 'next/font/google'
import { titleToSlug } from '@/lib/slug-utils'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const DOMAINS = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Environment',
  'Social Impact',
  'Agriculture',
  'Other',
]

const DIFFICULTY = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

export default function ProblemsDiscovery() {
  const [filterDomain, setFilterDomain] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch problems from API
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (filterDomain) params.append('domain', filterDomain)
        if (filterDifficulty) params.append('difficulty', filterDifficulty)
        params.append('sort', sortBy === 'teams' ? 'most_teams' : sortBy === 'difficulty' ? 'most_challenging' : 'newest')

        const response = await fetch(`/api/counterpools/problems?${params.toString()}`)
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch problems')
        }

        setProblems(data.data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching problems:', err)
        setError(err.message)
        setProblems([])
      } finally {
        setLoading(false)
      }
    }

    fetchProblems()
  }, [filterDomain, filterDifficulty, sortBy])

  return (
    <div className={`min-h-screen bg-black text-white ${inter.className} overflow-x-hidden selection:bg-[#d84a1b] selection:text-white`}>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
        <div className="bg-black/50 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <Link href="/counterpools" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#d84a1b] transition-colors flex items-center gap-2">
              <span className="text-lg leading-none">&larr;</span> <span className="hidden md:inline">Return</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/">
                <img src="/logo.svg" alt="openpools.in" className="h-3 md:h-7 opacity-90 hover:opacity-100 transition-opacity" />
              </Link>
              <span className="text-white/30 text-lg font-light hidden sm:inline">/</span>
              <div className={`${playfairDisplay.className} text-xs md:text-xl font-bold italic tracking-tight`}>
                counterpools<span className="text-[#d84a1b]">.</span>
              </div>
            </div>
            <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
              Browse // 02
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[40vh] min-h-[350px] flex flex-col items-center justify-center overflow-hidden py-24 px-6 md:px-12 mt-12">
        <div className="absolute inset-0 bg-[#d84a1b]"></div>
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 80px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 80px)`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/40 to-black"></div>

        <div className="relative z-10 text-center">
          <h1 className={`${playfairDisplay.className} text-5xl md:text-7xl lg:text-8xl italic leading-[0.9] tracking-tighter text-white drop-shadow-2xl`}>
            the arena.
          </h1>
          <p className={`${inter.className} mt-6 text-sm md:text-base font-medium uppercase tracking-[0.3em] leading-relaxed text-white/80 max-w-2xl`}>
            {loading ? 'loading challenges...' : `${problems.length} problems awaiting solutions • choose your challenge`}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="relative z-10 w-full bg-black border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Sector Filter */}
            <div>
              <label className="block text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2 sm:mb-3">Sector</label>
              <select
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
                className="w-full bg-transparent border-b border-white/20 pb-2 sm:pb-3 text-sm sm:text-base md:text-lg text-white appearance-none focus:outline-none focus:border-[#d84a1b] focus:bg-white/5 transition-all duration-300 rounded-none cursor-pointer font-medium hover:bg-white/[0.01]"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d84a1b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '12px' }}
              >
                <option value="">all sectors</option>
                {DOMAINS.map((d) => (
                  <option key={d} value={d} className="bg-black text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2 sm:mb-3">Difficulty</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full bg-transparent border-b border-white/20 pb-2 sm:pb-3 text-sm sm:text-base md:text-lg text-white appearance-none focus:outline-none focus:border-[#d84a1b] focus:bg-white/5 transition-all duration-300 rounded-none cursor-pointer font-medium hover:bg-white/[0.01]"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d84a1b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '12px' }}
              >
                <option value="">all levels</option>
                {DIFFICULTY.map((d) => (
                  <option key={d} value={d} className="bg-black text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2 sm:mb-3">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent border-b border-white/20 pb-2 sm:pb-3 text-sm sm:text-base md:text-lg text-white appearance-none focus:outline-none focus:border-[#d84a1b] focus:bg-white/5 transition-all duration-300 rounded-none cursor-pointer font-medium hover:bg-white/[0.01]"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d84a1b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '12px' }}
              >
                <option value="newest">newest</option>
                <option value="teams">most teams</option>
                <option value="difficulty">most challenging</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Problems Grid */}
      <div className="relative z-10 w-full bg-black">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-white/50 text-lg">loading challenges...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 text-lg">Failed to load problems: {error}</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/50 text-lg">no problems match your filters. try a different selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {problems.map((problem, idx) => (
                <Link key={problem.id} href={`/counterpools/problems/${titleToSlug(problem.problem_title)}`}>
                  <div className="group relative border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.05] hover:border-[#d84a1b] transition-all duration-300 cursor-pointer overflow-hidden">
                    {/* Background accent */}
                    <div className="absolute -right-20 -top-20 text-8xl opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                      {String(idx + 1).padStart(2, '0')}
                    </div>

                    <div className="relative z-10">
                      {/* Meta Info */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                        <div className="flex gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d84a1b] bg-white/[0.05] px-3 py-1 rounded">
                            {problem.domain}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded ${
                            problem.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                            problem.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                            problem.difficulty === 'Advanced' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {problem.links && <span className="text-xs font-medium text-blue-400 flex items-center gap-1"><span>📎</span> {problem.links.split('\n').filter(l => l.trim()).length}</span>}
                          <span className="text-xs font-medium text-white/40">{problem.teams_interested || 0} teams</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className={`${playfairDisplay.className} text-2xl md:text-3xl italic lowercase font-medium text-white mb-4 group-hover:text-[#d84a1b] transition-colors leading-tight`}>
                        {problem.problem_title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-white/60 mb-6 leading-relaxed line-clamp-3">
                        {problem.description}
                      </p>

                      {/* Keywords */}
                      {problem.keywords && (
                        <div className="mb-6 pb-4 border-b border-white/10">
                          <div className="flex flex-wrap gap-2">
                            {problem.keywords.split(',').map((keyword, idx) => (
                              <span key={idx} className="text-[10px] font-medium uppercase tracking-[0.15em] text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                                {keyword.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expert Info */}
                      <div className="flex items-center justify-between pt-6 border-t border-white/10">
                        <span className="text-xs font-medium text-white/50">by {problem.full_name}</span>
                        <span className="text-lg group-hover:translate-x-2 transition-transform duration-300">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Global CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        select option {
          background-color: #1a1a1a;
          color: white;
          padding: 12px;
        }
        select option:hover {
          background-color: #d84a1b;
          color: black;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}} />
    </div>
  )
}
