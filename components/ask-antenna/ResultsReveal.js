'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ResultsReveal({ matches, onRestart }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    setTimeout(() => setRevealed(true), 300)
  }, [])

  if (matches.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No signals found</h2>
              <p className="text-gray-600 mb-8">
                No profiles matched your specific criteria. Try broadening your search or using different keywords.
              </p>
              <button
                onClick={onRestart}
                className="w-full px-6 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all"
              >
                Try a new search
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`transition-all duration-700 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Header Section */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 sm:-mt-12 mb-6 sm:mb-8 overflow-hidden">
        <div className="bg-gradient-to-br from-[#1E1E1E] via-[#2a2a2a] to-[#1E1E1E] px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          {/* Decorative elements - hidden on mobile */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none hidden sm:block">
            <div className="absolute top-10 left-10 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
          </div>

          {/* Floating keyword decorations */}
          <div className="absolute top-6 right-8 hidden sm:flex gap-2 opacity-30">
            <span className="px-2 py-1 text-xs bg-primary-500/30 text-primary-300 rounded-full">Match</span>
            <span className="px-2 py-1 text-xs bg-primary-500/30 text-primary-300 rounded-full">Found</span>
          </div>

          <div className="relative max-w-3xl mx-auto text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-xl sm:shadow-2xl shadow-green-500/30 mb-4 sm:mb-6">
              <svg className="w-7 h-7 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">
              Found {matches.length} {matches.length === 1 ? 'Match' : 'Matches'}
            </h1>
            <p className="text-gray-400 text-sm sm:text-lg max-w-md mx-auto">
              People who match your search criteria
            </p>

            {/* Stats bar */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-5 sm:mt-8">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary-400">{matches.length}</div>
                <div className="text-[10px] sm:text-xs text-gray-500">Results</div>
              </div>
              <div className="w-px h-6 sm:h-8 bg-gray-700" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-400">{matches[0]?.score || 0}%</div>
                <div className="text-[10px] sm:text-xs text-gray-500">Top Match</div>
              </div>
              <div className="w-px h-6 sm:h-8 bg-gray-700" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">{matches.reduce((sum, m) => sum + (m.matchedFilters?.length || 0), 0)}</div>
                <div className="text-[10px] sm:text-xs text-gray-500">Criteria</div>
              </div>
            </div>
          </div>
        </div>

        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-4 sm:h-8 bg-gray-50" style={{ borderRadius: '100% 100% 0 0' }} />
      </div>

      {/* Results Content */}
      <div className="max-w-3xl mx-auto">
        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Top Matches</h2>
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New search
          </button>
        </div>

        {/* Matches List */}
        <div className="flex flex-col gap-5 mb-10">
          {matches.map((match, index) => (
            <MatchCard key={match.id} match={match} rank={index + 1} delay={index * 100} />
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Want to see more?</h3>
              <p className="text-sm text-gray-500">View all your matches or start a new search</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/matches"
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
              >
                View all matches
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MatchCard({ match, rank, delay }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), delay)
  }, [delay])

  const getRankStyle = (rank) => {
    if (rank === 1) return {
      bg: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600',
      shadow: 'shadow-yellow-400/40',
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
    }
    if (rank === 2) return {
      bg: 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500',
      shadow: 'shadow-gray-400/40',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    }
    if (rank === 3) return {
      bg: 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600',
      shadow: 'shadow-orange-400/40',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    }
    return {
      bg: 'bg-gradient-to-br from-gray-500 to-gray-600',
      shadow: 'shadow-gray-500/20',
      icon: <span className="text-sm font-bold text-white">#{rank}</span>
    }
  }

  const rankStyle = getRankStyle(rank)

  return (
    <Link href={`/user/${match.username || match.id}`}>
      <div
        className={`group relative bg-white rounded-2xl border-2 border-gray-100 hover:border-primary-200 transition-all cursor-pointer overflow-hidden ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        } ${rank === 1 ? 'shadow-xl shadow-primary-500/10' : 'hover:shadow-xl hover:shadow-gray-200'}`}
        style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {/* Top match highlight bar */}
        {rank === 1 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />
        )}

        <div className="p-4 sm:p-6">
          {/* Mobile: Stack layout, Desktop: Row layout */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Top row on mobile: Rank + Name + Score */}
            <div className="flex items-start gap-3 sm:gap-4 sm:flex-1">
              {/* Rank Badge */}
              <div className="flex-shrink-0">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg ${rankStyle.bg} ${rankStyle.shadow}`}>
                  {rankStyle.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                      {match.full_name || 'Anonymous'}
                    </h3>
                    {match.job_title && (
                      <p className="text-sm text-gray-600 truncate">{match.job_title}</p>
                    )}
                    {match.location && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-xs text-gray-500 truncate">{match.location}</p>
                      </div>
                    )}
                  </div>

                  {/* Match Score */}
                  <div className="flex-shrink-0">
                    <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl ${
                      rank === 1
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200'
                    }`}>
                      <span className={`text-base sm:text-lg font-bold ${rank === 1 ? 'text-white' : 'text-primary-600'}`}>{match.score}%</span>
                    </div>
                  </div>
                </div>

                {/* Bio - Hidden on mobile for cleaner look */}
                {match.bio && (
                  <p className="hidden sm:block text-sm text-gray-600 line-clamp-2 mt-3">{match.bio}</p>
                )}
              </div>
            </div>

            {/* Keywords & Matched Filters */}
            <div className="sm:hidden border-t border-gray-100 pt-3 -mx-4 px-4">
              {/* Keywords on mobile */}
              {match.keywords && match.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {match.keywords.slice(0, 4).map((kw, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {kw}
                    </span>
                  ))}
                  {match.keywords.length > 4 && (
                    <span className="px-2 py-0.5 text-xs text-gray-500">+{match.keywords.length - 4}</span>
                  )}
                </div>
              )}

              {/* Matched Filters on mobile */}
              {match.matchedFilters && match.matchedFilters.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {match.matchedFilters.slice(0, 3).map((filter, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded">
                      {filter}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop: Keywords section */}
            <div className="hidden sm:block flex-1 min-w-0 pl-16">
              {/* Keywords */}
              {match.keywords && match.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {match.keywords.slice(0, 5).map((kw, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg">
                      {kw}
                    </span>
                  ))}
                  {match.keywords.length > 5 && (
                    <span className="px-2.5 py-1 text-xs font-medium text-gray-500">
                      +{match.keywords.length - 5}
                    </span>
                  )}
                </div>
              )}

              {/* Matched Filters */}
              {match.matchedFilters && match.matchedFilters.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-gray-500">Matched:</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {match.matchedFilters.map((filter, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-lg">
                        {filter}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hover Arrow - Desktop only */}
            <div className="hidden sm:flex flex-shrink-0 self-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
