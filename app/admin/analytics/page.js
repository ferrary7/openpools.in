'use client'

import { useState, useEffect } from 'react'

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/analytics')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to fetch analytics')
        return
      }
      setAnalytics(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Loading analytics...</div>
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>
  if (!analytics) return <div className="p-6 text-center text-gray-500">No data available</div>

  const MetricCard = ({ label, value, icon, subtext }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-2">Platform-wide metrics and activity analysis</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* User Metrics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">User Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Total Users"
            value={analytics.users.total}
            icon="👥"
            subtext={`${analytics.users.withResume} with resume`}
          />
          <MetricCard
            label="Active Users (30d)"
            value={analytics.users.active30d}
            icon="🟢"
            subtext={`${analytics.users.total > 0 ? Math.round(analytics.users.active30d / analytics.users.total * 100) : 0}% of total`}
          />
          <MetricCard
            label="Profile Completion"
            value={`${analytics.users.avgProfileCompletion}%`}
            icon="✅"
            subtext={`${analytics.users.completeProfiles} complete profiles`}
          />
        </div>
      </div>

      {/* Engagement Metrics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Engagement Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Matches Created"
            value={analytics.engagement.totalMatches}
            icon="🔗"
            subtext={`Avg: ${analytics.engagement.avgMatchesPerUser} per user`}
          />
          <MetricCard
            label="Active Conversations"
            value={analytics.engagement.activeChats}
            icon="💬"
            subtext={`${analytics.engagement.totalMessages} total messages`}
          />
          <MetricCard
            label="Journal Entries"
            value={analytics.engagement.journalEntries}
            icon="📔"
            subtext={`${analytics.engagement.avgEntriesPerUser} avg per user`}
          />
          <MetricCard
            label="Showcase Items"
            value={analytics.content.showcaseItems}
            icon="📡"
            subtext={`${analytics.content.visibleShowcaseItems} visible`}
          />
        </div>
      </div>

      {/* Content Metrics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Content & Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Total Keywords"
            value={analytics.content.totalKeywords}
            icon="🔑"
            subtext={`Avg: ${analytics.content.avgKeywordsPerUser} per user`}
          />
          <MetricCard
            label="Top Companies"
            value={analytics.activity.topCompanies?.length || 0}
            icon="🏢"
            subtext={`${analytics.activity.topCompanies?.[0]?.company || 'N/A'}`}
          />
          <MetricCard
            label="AI Insights Generated"
            value={analytics.content.aiInsights}
            icon="🤖"
            subtext={`${analytics.content.aiInsightsThisMonth} this month`}
          />
        </div>
      </div>

      {/* Collaboration Metrics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Collaboration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Collaboration Requests"
            value={analytics.collaboration.totalRequests}
            icon="🤝"
            subtext={`${analytics.collaboration.accepted} accepted`}
          />
          <MetricCard
            label="Notifications"
            value={analytics.collaboration.notifications}
            icon="⭐"
            subtext={`${analytics.collaboration.unreadNotifications} unread`}
          />
          <MetricCard
            label="Featured Profiles"
            value={analytics.content.uniqueShowcaseUsers}
            icon="🌟"
          />
        </div>
      </div>

      {/* Platform Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Top Companies</h3>
            <ul className="space-y-2">
              {analytics.activity.topCompanies && analytics.activity.topCompanies.length > 0 ? (
                analytics.activity.topCompanies.map((company, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{company.company}</span>
                    <span className="font-semibold text-gray-900">{company.count}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 text-sm">No data</li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Top Keywords</h3>
            <ul className="space-y-2">
              {analytics.content.topKeywords && analytics.content.topKeywords.length > 0 ? (
                analytics.content.topKeywords.map((keyword, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{keyword.keyword}</span>
                    <span className="font-semibold text-gray-900">{keyword.count}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 text-sm">No data</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <p className="text-gray-600">Last 30 days:</p>
            <p className="font-semibold text-gray-900">{analytics.activity.newUsersMonth} new users</p>
            <p className="text-xs text-gray-500">Signup rate: {analytics.activity.signupRate}%</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">Last 7 days:</p>
            <p className="font-semibold text-gray-900">{analytics.activity.newUsersWeek} new users</p>
            <p className="text-xs text-gray-500">Daily average: {analytics.activity.dailyAvg}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
