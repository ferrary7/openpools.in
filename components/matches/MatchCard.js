'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function MatchCard({ match }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getMatchQuality = (score) => {
    if (score >= 75) return { label: 'Excellent Match', color: 'bg-green-100 text-green-800' }
    if (score >= 60) return { label: 'Great Match', color: 'bg-blue-100 text-blue-800' }
    if (score >= 45) return { label: 'Good Match', color: 'bg-yellow-100 text-yellow-800' }
    if (score >= 30) return { label: 'Moderate Match', color: 'bg-orange-100 text-orange-800' }
    return { label: 'Low Match', color: 'bg-gray-100 text-gray-800' }
  }

  const quality = getMatchQuality(match.compatibility)
  const hasBreakdown = match.scoreBreakdown && typeof match.scoreBreakdown === 'object'

  return (
    <div className="card hover:shadow-lg transition-all duration-200">
      <Link href={`/user/${match.username || match.userId}`}>
        <div className="hover:scale-[1.02] cursor-pointer transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                {match.fullName}
              </h3>
              <p className="text-sm text-gray-500">{match.email}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">
                {match.compatibility.toFixed(1)}%
              </div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${quality.color}`}>
                {quality.label}
              </span>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Common Keywords ({match.totalCommon})
            </div>
            <div className="flex flex-wrap gap-1">
              {match.commonKeywords.slice(0, 10).map((kw, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs"
                >
                  {kw.keyword}
                </span>
              ))}
              {match.commonKeywords.length > 10 && (
                <span className="px-2 py-1 text-gray-500 text-xs">
                  +{match.commonKeywords.length - 10} more
                </span>
              )}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${Math.min(match.compatibility, 100)}%` }}
            ></div>
          </div>
        </div>
      </Link>

      {/* Actions Row */}
      <div className="flex items-center justify-between gap-3 mt-4">
        {/* Why You Match Button */}
        {hasBreakdown && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span>Why you match</span>
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}

        {/* View Profile Button */}
        <Link href={`/user/${match.username || match.userId}`}>
          <div className="flex items-center justify-end gap-2 text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors cursor-pointer group">
            <span>View Profile</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Breakdown Dropdown */}
      {hasBreakdown && isExpanded && (
        <div className="mt-3 p-3 bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg border border-primary-100">
          <div className="grid grid-cols-1 gap-2 text-sm">
            {match.scoreBreakdown.keyword > 0 && (
              <div className="flex items-center justify-between p-2 bg-white bg-opacity-60 rounded">
                <span className="text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.5 1.5H4.75A2.75 2.75 0 002 4.25v11.5A2.75 2.75 0 004.75 18.5h10.5A2.75 2.75 0 0018 15.75V8M10.5 1.5v5h-7m7-5h4.75" />
                  </svg>
                  Common Keywords
                </span>
                <span className="font-semibold text-primary-600">{match.scoreBreakdown.keyword.toFixed(1)}</span>
              </div>
            )}
            {match.scoreBreakdown.diversity > 0 && (
              <div className="flex items-center justify-between p-2 bg-white bg-opacity-60 rounded">
                <span className="text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-2a4 4 0 00-8 0v2h8z" />
                  </svg>
                  Complementary Skills
                </span>
                <span className="font-semibold text-blue-600">+{match.scoreBreakdown.diversity.toFixed(1)}</span>
              </div>
            )}
            {match.scoreBreakdown.completeness > 0 && (
              <div className="flex items-center justify-between p-2 bg-white bg-opacity-60 rounded">
                <span className="text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-2.77 3.066 3.066 0 00-3.58 3.03A3.066 3.066 0 006.267 3.455zm9.8 2.696a3.066 3.066 0 10.682 4.16 3.066 3.066 0 00-.682-4.16zm7.352 5.205a3.066 3.066 0 11-4.392-4.392 9.068 9.068 0 015.441 7.676 1.536 1.536 0 01-1.049-3.284zM9.367 12a3.066 3.066 0 101.953-2.868A3.066 3.066 0 009.367 12zm7.074 5a3.066 3.066 0 11-6.132 0 3.066 3.066 0 016.132 0zm-14.192-1a3.066 3.066 0 100 6.132 3.066 3.066 0 000-6.132z" clipRule="evenodd" />
                  </svg>
                  Profile Completeness
                </span>
                <span className="font-semibold text-green-600">{match.scoreBreakdown.completeness.toFixed(1)}</span>
              </div>
            )}
            {match.scoreBreakdown.location > 0 && (
              <div className="flex items-center justify-between p-2 bg-white bg-opacity-60 rounded">
                <span className="text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Location Match
                </span>
                <span className="font-semibold text-orange-600">{match.scoreBreakdown.location.toFixed(1)}</span>
              </div>
            )}
            {match.scoreBreakdown.collaboration > 0 && (
              <div className="flex items-center justify-between p-2 bg-white bg-opacity-60 rounded">
                <span className="text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 9V7a1 1 0 011-1h8a1 1 0 011 1v2M5 9a2 2 0 002 2h6a2 2 0 002-2M5 9a2 2 0 012-2h6a2 2 0 012 2m-3 2h3v2a1 1 0 01-1 1h-1a1 1 0 01-1-1v-2zm-6 0h3v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z" />
                  </svg>
                  Collaboration Style
                </span>
                <span className="font-semibold text-purple-600">{match.scoreBreakdown.collaboration.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
