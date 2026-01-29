'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function OrgSearchResults({ results, orgSlug, job, keywords }) {
  const [expandedId, setExpandedId] = useState(null)

  const getMatchColor = (quality) => {
    switch (quality?.color) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200'
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSourceBadge = (source) => {
    if (source === 'org_candidate') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
          Your Candidate
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
        OpenPools
      </span>
    )
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No matches found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your job description or search criteria.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Job Summary */}
      {job && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{job.title || 'Job Search'}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                {job.company && <span>{job.company}</span>}
                {job.location && <span>{job.location}</span>}
                {job.employment_type && <span>{job.employment_type}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{results.length}</div>
              <div className="text-sm text-gray-500">matches</div>
            </div>
          </div>
          {keywords && keywords.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Searching for:</div>
              <div className="flex flex-wrap gap-1">
                {keywords.slice(0, 15).map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600">
                    {kw.keyword}
                  </span>
                ))}
                {keywords.length > 15 && (
                  <span className="px-2 py-0.5 text-xs text-gray-500">
                    +{keywords.length - 15} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={result.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Main Row */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{result.fullName}</h4>
                      {result.isPremium && (
                        <span className="text-yellow-500" title="Premium User">★</span>
                      )}
                      {getSourceBadge(result.source)}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {result.jobTitle || 'No title'}
                      {result.company && ` at ${result.company}`}
                      {result.location && ` • ${result.location}`}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getMatchColor(result.matchQuality)}`}>
                    {result.score.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {result.matchQuality?.label}
                  </div>
                </div>
              </div>

              {/* Common Keywords Preview */}
              {result.commonKeywords && result.commonKeywords.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {result.commonKeywords.slice(0, 5).map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                      {kw.keyword}
                    </span>
                  ))}
                  {result.commonKeywords.length > 5 && (
                    <span className="px-2 py-0.5 text-xs text-gray-500">
                      +{result.commonKeywords.length - 5} more matches
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Expanded Details */}
            {expandedId === result.id && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-6 mt-4">
                  {/* Contact Info */}
                  <div>
                    <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">Contact</h5>
                    <div className="space-y-1 text-sm">
                      {result.email && (
                        <div>
                          <a href={`mailto:${result.email}`} className="text-blue-600 hover:underline">
                            {result.email}
                          </a>
                        </div>
                      )}
                      {result.linkedinUrl && (
                        <div>
                          <a href={result.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                      {result.source === 'org_candidate' && result.resumeUrl && (
                        <div>
                          <a href={result.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View Resume
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  {result.scoreBreakdown && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">Score Breakdown</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Keywords</span>
                          <span className="font-medium">{result.scoreBreakdown.keyword?.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Diversity</span>
                          <span className="font-medium">{result.scoreBreakdown.diversity?.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Profile</span>
                          <span className="font-medium">{result.scoreBreakdown.completeness?.toFixed(1)}</span>
                        </div>
                        {result.scoreBreakdown.premium > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Premium</span>
                            <span className="font-medium text-yellow-600">+{result.scoreBreakdown.premium?.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* All Matching Keywords */}
                {result.commonKeywords && result.commonKeywords.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">
                      All Matching Skills ({result.commonKeywords.length})
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {result.commonKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                          {kw.keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3">
                  {result.source === 'org_candidate' && (
                    <Link
                      href={`/org/${orgSlug}/candidates/${result.id}`}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      View Profile
                    </Link>
                  )}
                  {result.email && (
                    <a
                      href={`mailto:${result.email}`}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-black rounded hover:bg-gray-800"
                    >
                      Contact
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
