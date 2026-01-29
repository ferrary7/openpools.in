'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

function StatCard({ icon, label, value, subtext, href }) {
  const content = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="mt-1 text-sm text-gray-500">{subtext}</p>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

function QuickAction({ icon, title, description, href }) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </Link>
  )
}

function RecentSearch({ search }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium text-gray-900 truncate max-w-xs">
          {search.name || search.query_text?.substring(0, 50) || 'Untitled Search'}
        </p>
        <p className="text-sm text-gray-500">
          {search.results_count} results
        </p>
      </div>
      <span className="text-sm text-gray-400">
        {new Date(search.created_at).toLocaleDateString()}
      </span>
    </div>
  )
}

export default function OrgDashboardPage() {
  const { slug } = useParams()
  const [stats, setStats] = useState(null)
  const [recentSearches, setRecentSearches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [slug])

  const fetchDashboardData = async () => {
    try {
      // Fetch org data (includes stats)
      const orgResponse = await fetch(`/api/org/${slug}`)
      const orgData = await orgResponse.json()

      if (orgResponse.ok && orgData.organization) {
        setStats(orgData.organization.stats)
      }

      // Fetch recent searches
      const searchResponse = await fetch(`/api/org/${slug}/search?limit=5`)
      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        setRecentSearches(searchData.searches || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome to your Organization Dashboard</h1>
        <p className="mt-2 text-blue-100">
          Search for candidates, manage your talent pool, and find the perfect match for your job openings.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="👥"
          label="Total Candidates"
          value={stats?.candidates || 0}
          subtext="In your talent pool"
          href={`/org/${slug}/candidates`}
        />
        <StatCard
          icon="💼"
          label="Active Jobs"
          value={stats?.activeJobs || 0}
          subtext="Open positions"
        />
        <StatCard
          icon="🔍"
          label="Total Searches"
          value={stats?.totalSearches || 0}
          subtext="All time"
        />
        <StatCard
          icon="🤝"
          label="Team Members"
          value={stats?.members || 0}
          subtext="In this organization"
          href={`/org/${slug}/team`}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            icon="🔍"
            title="Search Candidates"
            description="Paste a job description and find matching candidates"
            href={`/org/${slug}/search`}
          />
          <QuickAction
            icon="📤"
            title="Upload Resumes"
            description="Add new candidates to your talent pool"
            href={`/org/${slug}/candidates`}
          />
          <QuickAction
            icon="👥"
            title="Invite Team"
            description="Add recruiters and hiring managers"
            href={`/org/${slug}/team`}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Searches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Searches</h2>
            <Link href={`/org/${slug}/search`} className="text-sm text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>
          {recentSearches.length > 0 ? (
            <div>
              {recentSearches.map((search) => (
                <RecentSearch key={search.id} search={search} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-gray-500">No searches yet</p>
              <Link
                href={`/org/${slug}/search`}
                className="mt-2 inline-block text-blue-600 hover:text-blue-700 font-medium"
              >
                Run your first search →
              </Link>
            </div>
          )}
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                stats?.candidates > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {stats?.candidates > 0 ? '✓' : '1'}
              </div>
              <div>
                <p className={`font-medium ${stats?.candidates > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  Upload candidate resumes
                </p>
                <p className="text-sm text-gray-500">
                  Build your talent pool by uploading resumes
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                stats?.totalSearches > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {stats?.totalSearches > 0 ? '✓' : '2'}
              </div>
              <div>
                <p className={`font-medium ${stats?.totalSearches > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  Run a candidate search
                </p>
                <p className="text-sm text-gray-500">
                  Paste a job description to find matching candidates
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                stats?.members > 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {stats?.members > 1 ? '✓' : '3'}
              </div>
              <div>
                <p className={`font-medium ${stats?.members > 1 ? 'text-green-600' : 'text-gray-900'}`}>
                  Invite your team
                </p>
                <p className="text-sm text-gray-500">
                  Add recruiters and hiring managers to collaborate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
