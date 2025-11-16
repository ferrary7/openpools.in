'use client'

export default function MatchCard({ match }) {
  const getMatchQuality = (score) => {
    if (score >= 70) return { label: 'Excellent Match', color: 'bg-green-100 text-green-800' }
    if (score >= 50) return { label: 'Great Match', color: 'bg-blue-100 text-blue-800' }
    if (score >= 30) return { label: 'Good Match', color: 'bg-yellow-100 text-yellow-800' }
    if (score >= 15) return { label: 'Moderate Match', color: 'bg-orange-100 text-orange-800' }
    return { label: 'Low Match', color: 'bg-gray-100 text-gray-800' }
  }

  const quality = getMatchQuality(match.compatibility)

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
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

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full"
          style={{ width: `${match.compatibility}%` }}
        ></div>
      </div>
    </div>
  )
}
