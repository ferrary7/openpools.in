'use client'

import Link from 'next/link'
import { useState } from 'react'
import PremiumBadge from '@/components/ui/PremiumBadge'

export default function MatchCard({ match }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getMatchQuality = (score) => {
    if (score >= 75) return { label: 'Excellent Match', color: 'text-green-700', bg: 'bg-green-50' }
    if (score >= 60) return { label: 'Great Match', color: 'text-blue-700', bg: 'bg-blue-50' }
    if (score >= 45) return { label: 'Good Match', color: 'text-yellow-700', bg: 'bg-yellow-50' }
    if (score >= 30) return { label: 'Moderate Match', color: 'text-orange-700', bg: 'bg-orange-50' }
    return { label: 'Low Match', color: 'text-slate-500', bg: 'bg-slate-50' }
  }

  const quality = getMatchQuality(match.compatibility)
  const hasBreakdown = match.scoreBreakdown && typeof match.scoreBreakdown === 'object'
  const isPremiumActive = match.isPremium && (!match.premiumExpiresAt || new Date(match.premiumExpiresAt) > new Date())

  return (
    <div className={`group relative flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden ${isPremiumActive
      ? 'bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 border-2 border-amber-200 shadow-amber-100/50 rounded-2xl'
      : 'bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-primary-500/20'
      }`}>

      {/* Tightened Card Padding */}
      <div className="p-6 md:p-8 flex-1 relative z-10">
        {isPremiumActive && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
        )}

        {/* Card Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 min-w-0 pr-10">
            <Link href={`/user/${match.username || match.userId}`}>
              <h3 className={`text-2xl font-bold tracking-tight leading-tight transition-colors truncate ${isPremiumActive ? 'text-amber-900 group-hover:text-amber-600' : 'text-slate-900 group-hover:text-primary-600'
                }`}>
                {match.fullName}
              </h3>
            </Link>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {match.username && (
                <span className={`text-sm font-semibold ${isPremiumActive ? 'text-amber-600/70' : 'text-slate-400'}`}>
                  @{match.username}
                </span>
              )}
              {isPremiumActive && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm">
                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {match.premiumSource || 'Premium'}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-extrabold leading-none mb-3 tracking-tighter tabular-nums flex items-baseline justify-end ${isPremiumActive ? 'text-amber-600' : 'text-slate-900'
              }`}>
              <span className={isPremiumActive ? '' : 'text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-pink-600'}>
                {match.compatibility.toFixed(1)}
              </span>
              <span className="text-lg opacity-30 ml-0.5">%</span>
            </div>
            <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border ${isPremiumActive
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : `${quality.bg} ${quality.color} border-current border-opacity-10`
              }`}>
              {quality.label}
            </div>
          </div>
        </div>

        {/* Signals Section */}
        <div className="mb-8">
          <h4 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3 ${isPremiumActive ? 'text-amber-500' : 'text-slate-400'
            }`}>
            Common Keywords ({match.totalCommon})
            <div className={`flex-1 h-0.5 rounded-full ${isPremiumActive ? 'bg-amber-100' : 'bg-slate-50'}`}></div>
          </h4>
          <div className="flex flex-wrap gap-2">
            {match.commonKeywords.slice(0, 10).map((kw, index) => (
              <span
                key={index}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isPremiumActive
                  ? 'bg-white border-2 border-amber-100 text-amber-700 hover:border-amber-400 hover:bg-amber-50'
                  : 'bg-primary-50 border border-primary-100/50 text-primary-700 hover:bg-white hover:border-primary-400'
                  }`}
              >
                {kw.keyword}
              </span>
            ))}
            {match.commonKeywords.length > 10 && (
              <span className={`px-2 py-1 text-xs font-black uppercase tracking-widest ${isPremiumActive ? 'text-amber-400' : 'text-slate-300'
                }`}>
                +{match.commonKeywords.length - 10}
              </span>
            )}
          </div>
        </div>

        {/* Resonance Bar */}
        <div className="pt-2">
          <div className={`h-2 w-full rounded-full overflow-hidden p-0.5 border ${isPremiumActive ? 'bg-amber-100 border-amber-200' : 'bg-slate-100 border-slate-50'
            }`}>
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isPremiumActive
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-gradient-to-r from-primary-500 to-pink-600 shadow-[0_0_8px_rgba(232,68,153,0.3)]'
                }`}
              style={{ width: `${Math.min(match.compatibility, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action Hub */}
      <div className={`px-8 py-5 flex items-center justify-between gap-6 border-t transition-colors ${isPremiumActive ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50/30 border-slate-100'
        }`}>
        {hasBreakdown ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all group/btn ${isPremiumActive ? 'text-amber-600 hover:text-amber-900' : 'text-primary-600 hover:text-primary-800'
              }`}
          >
            <span>Why you match</span>
            <svg className={`w-4 h-4 transition-transform duration-500 ${isExpanded ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ) : <div />}

        <Link href={`/user/${match.username || match.userId}`}>
          <div className={`flex items-center gap-1.5 text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all group/link cursor-pointer ${isPremiumActive ? 'text-amber-700 hover:text-amber-900' : 'text-primary-600 hover:text-primary-700'
            }`}>
            <span>View Profile</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Breakdown Expansion */}
      <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[600px] opacity-100 pt-2 pb-8' : 'max-h-0 opacity-0'}`}>
        <div className="px-8 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(match.scoreBreakdown).map(([key, value], idx) => {
              if (value === 0) return null
              const labels = {
                keyword: 'Common Keywords Score',
                diversity: 'Complementary Skills',
                completeness: 'Profile Completeness',
                location: 'Location Match',
                collaboration: 'Collaboration Style'
              }
              if (!labels[key]) return null

              return (
                <div key={idx} className={`flex items-center justify-between p-3 border rounded-xl shadow-sm transition-all ${isPremiumActive ? 'bg-amber-50/50 border-amber-100 hover:border-amber-300' : 'bg-white border-slate-100 hover:border-primary-100'
                  }`}>
                  <span className={`text-sm font-bold flex items-center gap-3 ${isPremiumActive ? 'text-amber-800' : 'text-slate-700'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isPremiumActive ? 'bg-amber-500' : 'bg-primary-500'} opacity-40`}></div>
                    {labels[key]}
                  </span>
                  <span className={`text-base font-bold tabular-nums ${isPremiumActive ? 'text-amber-600' : 'text-primary-600'}`}>{value.toFixed(1)}</span>
                </div>
              )
            })}
          </div>
          <div className="pt-4 flex justify-center">
            <span className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.4em] italic opacity-50">Signal Integrity Verified</span>
          </div>
        </div>
      </div>
    </div>
  )
}
