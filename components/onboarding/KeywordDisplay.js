'use client'

export default function KeywordDisplay({ keywords, loading }) {
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

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Your Professional Signals ({keywords.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw, index) => {
          const keyword = typeof kw === 'string' ? kw : kw.keyword
          const weight = typeof kw === 'object' ? kw.weight : 1.0
          const opacity = Math.max(0.5, weight)

          return (
            <span
              key={index}
              className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
              style={{ opacity }}
            >
              {keyword}
            </span>
          )
        })}
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Signals are weighted based on their source and importance
      </p>
    </div>
  )
}
