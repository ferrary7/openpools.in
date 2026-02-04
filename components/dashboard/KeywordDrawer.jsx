'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function KeywordDrawer({ keywords }) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Show first 15 keywords by default
    const displayedKeywords = isExpanded ? keywords : keywords.slice(0, 15)
    const hasMore = keywords.length > 15

    // Function to get font-weight class based on weight
    const getFontWeightClass = (weight) => {
        if (weight >= 0.8) return 'font-bold'
        if (weight >= 0.6) return 'font-semibold'
        if (weight >= 0.4) return 'font-medium'
        return 'font-normal'
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {displayedKeywords.map((kw, idx) => (
                    <span
                        key={idx}
                        className={`px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm border border-primary-200 ${getFontWeightClass(kw.weight || 0.5)}`}
                    >
                        {kw.keyword || kw}
                    </span>
                ))}
            </div>

            {hasMore && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-2"
                >
                    {isExpanded ? (
                        <>
                            Show Less
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </>
                    ) : (
                        <>
                            Show More Keywords ({keywords.length - 15} more)
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </>
                    )}
                </button>
            )}
        </div>
    )
}
