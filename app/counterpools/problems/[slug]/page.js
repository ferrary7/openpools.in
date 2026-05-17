'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Playfair_Display, Inter } from 'next/font/google'
import { findProblemBySlug } from '@/lib/slug-utils'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function ProblemDetail() {
  const params = useParams()
  const slug = params.slug
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return

    const fetchProblem = async () => {
      try {
        setLoading(true)
        const found = await findProblemBySlug(slug)
        if (found) {
          setProblem(found)
        } else {
          setError('Problem not found')
        }
      } catch (err) {
        console.error('Error fetching problem:', err)
        setError('Error loading problem details')
      } finally {
        setLoading(false)
      }
    }

    fetchProblem()
  }, [slug])

  if (loading) {
    return (
      <div className={`min-h-screen bg-black text-white ${inter.className} flex items-center justify-center`}>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .spinner {
            animation: spin 1s linear infinite;
          }
        `}</style>
        <svg className="spinner w-12 h-12 text-[#d84a1b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-20"></circle>
          <path strokeLinecap="round" strokeLinecap="round" strokeWidth="2" d="M12 2a10 10 0 0110 10" className="stroke-[#d84a1b]"></path>
        </svg>
      </div>
    )
  }

  if (error || !problem) {
    return (
      <div className={`min-h-screen bg-black text-white ${inter.className} flex flex-col items-center justify-center gap-8 px-6`}>
        <div className="text-center">
          <h1 className={`${playfairDisplay.className} text-5xl italic mb-4 text-white`}>not found</h1>
          <p className="text-white/50 text-lg">{error || 'Problem not found'}</p>
        </div>
        <Link href="/counterpools/browse">
          <button className="text-[10px] font-bold uppercase tracking-[0.2em] bg-[#d84a1b] hover:bg-[#e04500] text-white px-8 py-3 transition-colors">
            Back to Browse
          </button>
        </Link>
      </div>
    )
  }

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    open: 'bg-[#d84a1b]/20 text-[#d84a1b]',
    verified: 'bg-[#d84a1b]/20 text-[#d84a1b]',
    in_progress: 'bg-blue-500/20 text-blue-400',
    solved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
  }

  return (
    <div className={`min-h-screen bg-black text-white ${inter.className} overflow-x-hidden selection:bg-[#d84a1b] selection:text-white`}>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
        <div className="bg-black/50 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <Link href="/counterpools/browse" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#d84a1b] transition-colors flex items-center gap-2">
              <span className="text-lg leading-none">&larr;</span> <span className="hidden md:inline">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/">
                <img src="/logo.svg" alt="openpools.in" className="h-3 md:h-7 opacity-90 hover:opacity-100 transition-opacity" />
              </Link>
              <span className="text-white/30 text-lg font-light hidden sm:inline">/</span>
              <div className={`${playfairDisplay.className} text-xs md:text-xl font-bold italic tracking-tight`}>
                counterpools<span className="text-[#d84a1b]">.\</span>
              </div>
            </div>
            <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
              Detail // 03
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

        <div className="relative z-10 text-center max-w-4xl">
          <h1 className={`${playfairDisplay.className} text-4xl sm:text-5xl md:text-6xl lg:text-7xl italic leading-[0.9] tracking-tighter text-white drop-shadow-2xl px-4 lowercase`}>
            {problem.problem_title}
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 w-full bg-black border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 space-y-12">
          {/* Status Badge */}
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded inline-block ${statusColors[problem.status] || 'bg-white/10 text-white/50'}`}>
              {problem.status}
            </span>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/10 py-12">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">Sector</div>
              <div className="text-xl font-semibold text-white">{problem.domain}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">Difficulty</div>
              <div className="text-xl font-semibold text-[#d84a1b]">{problem.difficulty}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">Teams Interested</div>
              <div className="text-xl font-semibold text-blue-400">{problem.teams_interested > 0 ? problem.teams_interested : 'awaiting'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">Posted</div>
              <div className="text-lg text-white">{new Date(problem.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            </div>
          </div>

          {/* Expert Card */}
          <div className="border border-white/10 bg-white/[0.02] p-8 hover:border-[#d84a1b] transition-colors">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">Posted By</div>
            <div className="text-2xl font-semibold text-white mb-4">{problem.full_name}</div>
            {problem.linkedin_url && (
              <a
                href={problem.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d84a1b] hover:text-[#e04500] transition-colors inline-flex items-center gap-2"
              >
                View LinkedIn <span>→</span>
              </a>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className={`${playfairDisplay.className} text-3xl italic text-white mb-6 lowercase`}>The Challenge</h2>
            <p className="text-base leading-relaxed text-white/70 whitespace-pre-wrap">
              {problem.description}
            </p>
          </div>

          {/* Expected Outcome */}
          {problem.expected_outcome && (
            <div>
              <h2 className={`${playfairDisplay.className} text-3xl italic text-white mb-6 lowercase`}>Expected Outcome</h2>
              <p className="text-base leading-relaxed text-white/70 whitespace-pre-wrap">
                {problem.expected_outcome}
              </p>
            </div>
          )}

          {/* Relevant Links */}
          {problem.links && (
            <div>
              <h2 className={`${playfairDisplay.className} text-3xl italic text-white mb-6 lowercase`}>Resources & References</h2>
              <div className="space-y-3">
                {problem.links.split('\n').map((link, idx) => (
                  link.trim() && (
                    <a
                      key={idx}
                      href={link.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-[#d84a1b] hover:text-[#e04500] transition-colors group"
                    >
                      <span className="text-2xl">→</span>
                      <span className="text-base break-all group-hover:underline">{link.trim()}</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {problem.keywords && (
            <div>
              <h2 className={`${playfairDisplay.className} text-3xl italic text-white mb-6 lowercase`}> Signals</h2>
              <div className="flex flex-wrap gap-3">
                {problem.keywords.split(',').map((keyword, idx) => (
                  <span key={idx} className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-400 bg-blue-500/20 px-4 py-2 rounded border border-blue-500/30">
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center pt-8 border-t border-white/10 mt-16">
            <div className="py-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-6">Ready to make an impact?</p>
              <Link href="/counterpools/browse">
                <button className="group relative text-[10px] font-bold uppercase tracking-[0.2em] bg-[#d84a1b] text-white px-10 sm:px-16 py-4 sm:py-5 transition-all duration-300 hover:bg-[#e04500] hover:shadow-2xl hover:shadow-[#d84a1b]/50 inline-block">
                  <span className="relative flex items-center justify-center gap-2">
                    Browse More Challenges
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
