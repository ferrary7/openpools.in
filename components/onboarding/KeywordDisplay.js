'use client'

import { useState } from 'react'

export default function KeywordDisplay({ keywords, loading, editMode = false, onDelete = null, onToggleEdit = null }) {
  const [showAllMobile, setShowAllMobile] = useState(false)
  const MOBILE_LIMIT = 8 // Show only 8 keywords on mobile initially

  // Helper function to check if a keyword is a URL
  const isURL = (text) => {
    if (!text) return false
    const urlPattern = /^(https?:\/\/|www\.)/i
    return urlPattern.test(text) || text.includes('.com') || text.includes('.io') || text.includes('.org') || text.includes('.dev')
  }

  // Helper function to handle keyword click
  const handleKeywordClick = (keyword) => {
    if (editMode) return // Don't open links in edit mode

    if (isURL(keyword)) {
      // Ensure URL has protocol
      let url = keyword
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Extracting keywords with AI...</span>
        </div>
      </div>
    )
  }

  if (!keywords || keywords.length === 0) {
    return null
  }

  // Determine which keywords to show on mobile
  const displayedKeywords = showAllMobile ? keywords : keywords.slice(0, MOBILE_LIMIT)
  const hasMoreKeywords = keywords.length > MOBILE_LIMIT

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Your Professional Signals ({keywords.length})
        </h3>
        {onToggleEdit && (
          <button
            onClick={onToggleEdit}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            aria-label={editMode ? 'Stop editing keywords' : 'Edit keywords'}
            title={editMode ? 'Done' : 'Edit keywords'}
          >
            {editMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {/* Show limited keywords on mobile, all on desktop */}
        <div className="flex flex-wrap gap-2 md:hidden">
          {displayedKeywords.map((kw, index) => {
            const keyword = typeof kw === 'string' ? kw : kw.keyword
            const weight = typeof kw === 'object' ? kw.weight : 1.0
            const opacity = Math.max(0.5, weight)
            const isLink = isURL(keyword)

            return (
              <div
                key={index}
                className={`relative ${editMode ? 'keyword-shake' : ''}`}
              >
                <span
                  onClick={() => handleKeywordClick(keyword)}
                  className={`px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium inline-block ${
                    isLink && !editMode ? 'cursor-pointer hover:bg-primary-200 hover:underline transition-colors' : ''
                  }`}
                  style={{ opacity }}
                  title={isLink && !editMode ? `Open ${keyword}` : ''}
                >
                  {keyword}
                  {isLink && !editMode && (
                    <svg className="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  )}
                </span>
                {editMode && onDelete && (
                  <button
                    onClick={() => onDelete(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                    aria-label={`Delete ${keyword}`}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Show all keywords on desktop */}
        <div className="hidden md:flex md:flex-wrap md:gap-2">
          {keywords.map((kw, index) => {
            const keyword = typeof kw === 'string' ? kw : kw.keyword
            const weight = typeof kw === 'object' ? kw.weight : 1.0
            const opacity = Math.max(0.5, weight)
            const isLink = isURL(keyword)

            return (
              <div
                key={index}
                className={`relative ${editMode ? 'keyword-shake' : ''}`}
              >
                <span
                  onClick={() => handleKeywordClick(keyword)}
                  className={`px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium inline-block ${
                    isLink && !editMode ? 'cursor-pointer hover:bg-primary-200 hover:underline transition-colors' : ''
                  }`}
                  style={{ opacity }}
                  title={isLink && !editMode ? `Open ${keyword}` : ''}
                >
                  {keyword}
                  {isLink && !editMode && (
                    <svg className="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  )}
                </span>
                {editMode && onDelete && (
                  <button
                    onClick={() => onDelete(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                    aria-label={`Delete ${keyword}`}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Show more/less button - only on mobile */}
      {hasMoreKeywords && (
        <div className="md:hidden mt-3">
          <button
            onClick={() => setShowAllMobile(!showAllMobile)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {showAllMobile ? (
              <>Show less</>
            ) : (
              <>Show {keywords.length - MOBILE_LIMIT} more</>
            )}
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Signals are weighted based on their source and importance
      </p>

      <style jsx>{`
        @keyframes jiggle {
          0% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
          100% { transform: rotate(-1deg); }
        }

        .keyword-shake {
          animation: jiggle 0.3s ease-in-out infinite;
          transform-origin: center center;
        }

        .keyword-shake:nth-child(2n) {
          animation-delay: 0.05s;
        }

        .keyword-shake:nth-child(3n) {
          animation-delay: 0.1s;
        }
      `}</style>
    </div>
  )
}
