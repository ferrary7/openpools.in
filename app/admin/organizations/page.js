'use client'

import { useState, useEffect } from 'react'

export default function OrganizationsManagementPage() {
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState([])
  const [whitelistedUsers, setWhitelistedUsers] = useState([])
  const [stats, setStats] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [orgSearchQuery, setOrgSearchQuery] = useState('')

  // Form state for granting permission
  const [formData, setFormData] = useState({
    emails: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/organizations')
      const data = await response.json()
      if (response.ok) {
        setOrganizations(data.organizations || [])
        setWhitelistedUsers(data.whitelistedUsers || [])
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `Successfully whitelisted ${data.updated} user(s)`,
          details: data
        })
        setFormData({ emails: '' })
        fetchData()
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to whitelist users',
          details: data
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error: ' + error.message
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRevokePermission = async (userId, email) => {
    if (!confirm(`Revoke org creation permission for ${email}?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        fetchData()
      } else {
        const data = await response.json()
        alert('Error: ' + (data.error || 'Failed to revoke permission'))
      }
    } catch (error) {
      alert('Network error: ' + error.message)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const getOwner = (org) => {
    const owner = org.organization_members?.find(m => m.role === 'owner')
    return owner?.profiles?.full_name || owner?.profiles?.email || 'Unknown'
  }

  const filteredUsers = whitelistedUsers.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredOrgs = organizations.filter(org =>
    org.name?.toLowerCase().includes(orgSearchQuery.toLowerCase()) ||
    org.slug?.toLowerCase().includes(orgSearchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600 mt-1">Manage B2B organization dashboards and permissions</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
          <span className="text-xl">🏢</span>
          <span className="font-semibold">{stats.activeOrgs || 0} Active Orgs</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Organizations</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalOrgs || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active Organizations</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeOrgs || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalMembers || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Whitelisted Users</p>
          <p className="text-2xl font-bold text-amber-600">{stats.whitelistedUsers || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Whitelist Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">+</span>
            Grant Org Creation Permission
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Addresses <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.emails}
                onChange={(e) => setFormData({ ...formData, emails: e.target.value })}
                placeholder="Enter emails separated by commas or new lines&#10;e.g., user1@company.com, user2@company.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                These users will be able to create new organizations
              </p>
            </div>

            {formData.emails && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-2">Preview:</p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">
                    {formData.emails.split(/[,\n]/).filter(e => e.trim()).length}
                  </span> user(s) will be whitelisted to create organizations
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !formData.emails.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <span>🏢</span>
                  Grant Permission
                </>
              )}
            </button>
          </form>

          {result && (
            <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="font-medium">{result.message}</p>
              {result.details?.notFound?.length > 0 && (
                <div className="mt-2 text-sm">
                  <p className="font-medium">Emails not found:</p>
                  <p className="text-xs mt-1">{result.details.notFound.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Whitelisted Users List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">🔑</span>
            Whitelisted Users ({whitelistedUsers.length})
          </h2>

          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? 'No matching users found' : 'No whitelisted users yet'}
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-lg border bg-green-50 border-green-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.full_name || 'No name'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Added: {formatDate(user.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRevokePermission(user.id, user.email)}
                      className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Organizations List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">🏢</span>
            All Organizations ({organizations.length})
          </h2>
          <input
            type="text"
            value={orgSearchQuery}
            onChange={(e) => setOrgSearchQuery(e.target.value)}
            placeholder="Search organizations..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-64"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {orgSearchQuery ? 'No matching organizations found' : 'No organizations created yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Organization</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Members</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{org.name}</p>
                        <p className="text-sm text-gray-500">/{org.slug}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {getOwner(org)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {org.organization_members?.length || 0} members
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        org.subscription_tier === 'enterprise'
                          ? 'bg-amber-100 text-amber-700'
                          : org.subscription_tier === 'pro'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {org.subscription_tier || 'free'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        org.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {org.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(org.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`/org/${org.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
