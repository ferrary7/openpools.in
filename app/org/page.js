'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/org')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch organizations')
      }

      setOrganizations(data.organizations || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your organization dashboards
              </p>
            </div>
            <Link
              href="/org/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="mr-2">+</span>
              Create Organization
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {organizations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No organizations yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first organization to start using the talent search dashboard.
            </p>
            <Link
              href="/org/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create your first organization
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/org/${org.slug}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      {org.logo_url ? (
                        <img
                          src={org.logo_url}
                          alt={org.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <span className="text-2xl">🏢</span>
                        </div>
                      )}
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {org.name}
                        </h3>
                        <p className="text-sm text-gray-500">/{org.slug}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      org.memberRole === 'owner'
                        ? 'bg-purple-100 text-purple-700'
                        : org.memberRole === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : org.memberRole === 'recruiter'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {org.memberRole}
                    </span>
                  </div>

                  {org.description && (
                    <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                      {org.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    {org.industry && (
                      <span className="flex items-center">
                        <span className="mr-1">🏭</span>
                        {org.industry}
                      </span>
                    )}
                    {org.size && (
                      <span className="flex items-center">
                        <span className="mr-1">👥</span>
                        {org.size}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      org.subscription_tier === 'enterprise'
                        ? 'bg-amber-100 text-amber-700'
                        : org.subscription_tier === 'pro'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {org.subscription_tier || 'free'}
                    </span>
                    <span className="text-blue-600 font-medium text-sm">
                      Open Dashboard →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
