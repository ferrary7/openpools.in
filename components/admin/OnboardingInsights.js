'use client'

import { useState, useEffect } from 'react'

export default function OnboardingInsights() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchInsights()
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchInsights, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/onboarding-insights')
      if (!res.ok) throw new Error('Failed to fetch insights')
      const data = await res.json()
      setInsights(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !insights) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  const { insights: onboardingInsights, target } = insights || {}

  return (
    <div className="space-y-6">
      {/* Onboarding Insights Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Onboarding Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <p className="text-gray-700 text-sm font-medium">Today</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{onboardingInsights?.today || 0}</p>
            <p className="text-xs text-gray-600 mt-2">onboarded today</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <p className="text-gray-700 text-sm font-medium">This Week</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">{onboardingInsights?.thisWeek || 0}</p>
            <p className="text-xs text-gray-600 mt-2">onboarded this week</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <p className="text-gray-700 text-sm font-medium">This Month</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{onboardingInsights?.thisMonth || 0}</p>
            <p className="text-xs text-gray-600 mt-2">onboarded this month</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <p className="text-gray-700 text-sm font-medium">Total</p>
            <p className="text-4xl font-bold text-orange-600 mt-2">{onboardingInsights?.total || 0}</p>
            <p className="text-xs text-gray-600 mt-2">all-time onboardings</p>
          </div>
        </div>
      </div>

      {/* Onboarding Target Tracker */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Onboarding Target</h3>
            <p className="text-sm text-gray-600 mt-1">Goal: {target?.goal?.toLocaleString()} by {new Date(target?.targetDate).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{target?.current?.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{target?.remaining?.toLocaleString()} to go</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-gray-900">{target?.progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${target?.progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Target Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Days Remaining</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{target?.daysRemaining || 0}</p>
            <p className="text-xs text-gray-500 mt-1">until {new Date(target?.targetDate).toLocaleDateString()}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Daily Rate Needed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{target?.dailyRateNeeded || 0}</p>
            <p className="text-xs text-gray-500 mt-1">onboardings per day</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Status</p>
            <div className="mt-1 flex items-center gap-2">
              {target?.progressPercent >= 100 ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="font-bold text-green-600">Target Achieved!</span>
                </>
              ) : target?.progressPercent >= 75 ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="font-bold text-blue-600">On Track</span>
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
                  <span className="font-bold text-orange-600">Needs Attention</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
