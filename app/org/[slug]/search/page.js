'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import OrgSearchResults from '@/components/org/OrgSearchResults'

export default function SearchPage() {
  const { slug } = useParams()
  const [jobDescription, setJobDescription] = useState('')
  const [includeOrgCandidates, setIncludeOrgCandidates] = useState(true)
  const [includeOpenPools, setIncludeOpenPools] = useState(true)

  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)
  const [searchResult, setSearchResult] = useState(null)

  // Recent searches
  const [recentSearches, setRecentSearches] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    fetchRecentSearches()
  }, [slug])

  const fetchRecentSearches = async () => {
    try {
      const response = await fetch(`/api/org/${slug}/search?limit=5`)
      if (response.ok) {
        const data = await response.json()
        setRecentSearches(data.searches || [])
      }
    } catch (err) {
      console.error('Error fetching search history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSearch = async () => {
    if (!jobDescription.trim() || jobDescription.length < 50) {
      setError('Please enter a job description (at least 50 characters)')
      return
    }

    if (!includeOrgCandidates && !includeOpenPools) {
      setError('Please select at least one candidate source')
      return
    }

    setSearching(true)
    setError(null)
    setSearchResult(null)

    try {
      const response = await fetch(`/api/org/${slug}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          options: {
            includeOrgCandidates,
            includeOpenPools,
            limit: 50
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setSearchResult(data)
      fetchRecentSearches() // Refresh history
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  const loadSearch = async (search) => {
    setJobDescription(search.query_text)
    if (search.filters) {
      setIncludeOrgCandidates(search.filters.includeOrgCandidates !== false)
      setIncludeOpenPools(search.filters.includeOpenPools !== false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Candidates</h1>
          <p className="text-sm text-gray-500">
            Paste a job description to find matching candidates using AI-powered matching
          </p>
        </div>
        <Link
          href={`/org/${slug}/search/history`}
          className="text-sm text-gray-600 hover:text-black"
        >
          View all searches →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Search Form */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              {/* Job Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  placeholder="Paste your job description here...

Example:
We are looking for a Senior React Developer with 5+ years of experience. The ideal candidate should have:
- Strong proficiency in React, TypeScript, and Node.js
- Experience with cloud services (AWS/GCP)
- Knowledge of CI/CD pipelines
- Excellent problem-solving skills
- Experience with agile methodologies"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {jobDescription.length} characters
                  </span>
                  {jobDescription.length > 0 && jobDescription.length < 50 && (
                    <span className="text-xs text-red-500">
                      Need at least 50 characters
                    </span>
                  )}
                </div>
              </div>

              {/* Search Options */}
              <div className="flex flex-wrap gap-6 py-4 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeOrgCandidates}
                    onChange={(e) => setIncludeOrgCandidates(e.target.checked)}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">Search your candidates</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeOpenPools}
                    onChange={(e) => setIncludeOpenPools(e.target.checked)}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">Search OpenPools talent pool</span>
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Search Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSearch}
                  disabled={searching || !jobDescription.trim() || jobDescription.length < 50 || (!includeOrgCandidates && !includeOpenPools)}
                  className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {searching ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Searching...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Candidates
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {searchResult && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Search Results
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    {searchResult.sources?.orgCandidates || 0} from your candidates
                  </span>
                  <span>•</span>
                  <span>
                    {searchResult.sources?.openPools || 0} from OpenPools
                  </span>
                </div>
              </div>
              <OrgSearchResults
                results={searchResult.results}
                orgSlug={slug}
                job={searchResult.job}
                keywords={searchResult.keywords}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* How it works */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">How it works</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Paste Job Description</p>
                  <p className="text-xs text-gray-500">Enter the requirements for your position</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">AI Extracts Keywords</p>
                  <p className="text-xs text-gray-500">Skills, experience, and requirements identified</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Get Ranked Matches</p>
                  <p className="text-xs text-gray-500">Candidates sorted by compatibility score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Searches */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Searches</h3>
            {loadingHistory ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            ) : recentSearches.length === 0 ? (
              <p className="text-sm text-gray-500">No searches yet</p>
            ) : (
              <div className="space-y-3">
                {recentSearches.map(search => (
                  <button
                    key={search.id}
                    onClick={() => loadSearch(search)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-sm text-gray-900 line-clamp-2">
                      {search.query_text?.substring(0, 100)}...
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{search.results_count} results</span>
                      <span>•</span>
                      <span>{new Date(search.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-900 text-sm mb-2">Tips for better results</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Include specific technical skills</li>
              <li>• Mention years of experience required</li>
              <li>• List both required and nice-to-have skills</li>
              <li>• Include industry or domain keywords</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
