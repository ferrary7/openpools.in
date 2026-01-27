'use client'

import { useState, useEffect } from 'react'

export default function PremiumManagementPage() {
  const [loading, setLoading] = useState(true)
  const [premiumUsers, setPremiumUsers] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    emails: '',
    source: 'coding_gita',
    months: 5,
    notes: ''
  })

  // Common source suggestions for quick selection
  const sourceSuggestions = [
    'coding_gita',
    'paid',
    'promo',
    'partner',
    'beta'
  ]

  useEffect(() => {
    fetchPremiumUsers()
  }, [])

  const fetchPremiumUsers = async () => {
    try {
      const response = await fetch('/api/admin/premium')
      const data = await response.json()
      if (response.ok) {
        setPremiumUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching premium users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `Successfully updated ${data.updated} profiles`,
          details: data
        })
        // Reset form
        setFormData({
          emails: '',
          source: 'coding_gita',
          months: 5,
          notes: ''
        })
        // Refresh the list
        fetchPremiumUsers()
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to update profiles',
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

  const handleRevokePremium = async (userId, email) => {
    if (!confirm(`Are you sure you want to revoke premium access for ${email}?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/premium', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        fetchPremiumUsers()
      } else {
        const data = await response.json()
        alert('Error: ' + (data.error || 'Failed to revoke premium'))
      }
    } catch (error) {
      alert('Network error: ' + error.message)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const isExpired = (dateStr) => {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
  }

  const filteredUsers = premiumUsers.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.premium_source?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Premium Management</h1>
          <p className="text-gray-600 mt-1">Manage premium access for users and partners</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg">
          <span className="text-xl">⭐</span>
          <span className="font-semibold">{premiumUsers.filter(u => !isExpired(u.premium_expires_at)).length} Active Premium</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Premium Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">+</span>
            Add Premium Profiles
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Addresses <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.emails}
                onChange={(e) => setFormData({ ...formData, emails: e.target.value })}
                placeholder="Enter emails separated by commas or new lines&#10;e.g., user1@example.com, user2@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste comma-separated or line-separated email addresses
              </p>
            </div>

            {/* Source Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Premium Source <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                placeholder="e.g., coding_gita, partner_name, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                required
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {sourceSuggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setFormData({ ...formData, source: suggestion })}
                    className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                      formData.source === suggestion
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (Months) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={formData.months}
                  onChange={(e) => setFormData({ ...formData, months: parseInt(e.target.value) || 1 })}
                  min={1}
                  max={120}
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  required
                />
                <span className="text-gray-500">months</span>
                <div className="flex gap-2 ml-auto">
                  {[1, 3, 6, 12].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, months: m })}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        formData.months === m
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {m}mo
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g., Batch 2024, Referral from John, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Preview */}
            {formData.emails && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-2">Preview:</p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">
                    {formData.emails.split(/[,\n]/).filter(e => e.trim()).length}
                  </span> email(s) will receive <span className="font-semibold">{formData.months} month(s)</span> of premium via <span className="font-semibold">{formData.source || 'unknown'}</span>
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !formData.emails.trim()}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <span>⭐</span>
                  Grant Premium Access
                </>
              )}
            </button>
          </form>

          {/* Result Message */}
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

        {/* Premium Users List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">👑</span>
              Premium Users ({premiumUsers.length})
            </h2>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or source..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Users List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? 'No matching premium users found' : 'No premium users yet'}
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 rounded-lg border ${
                    isExpired(user.premium_expires_at)
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">
                          {user.full_name || 'No name'}
                        </p>
                        {isExpired(user.premium_expires_at) && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          {user.premium_source || 'Unknown'}
                        </span>
                        <span>
                          Expires: {formatDate(user.premium_expires_at)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokePremium(user.id, user.email)}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active Premium</p>
          <p className="text-2xl font-bold text-amber-600">
            {premiumUsers.filter(u => !isExpired(u.premium_expires_at)).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Expired</p>
          <p className="text-2xl font-bold text-gray-400">
            {premiumUsers.filter(u => isExpired(u.premium_expires_at)).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Coding Gita</p>
          <p className="text-2xl font-bold text-orange-600">
            {premiumUsers.filter(u => u.premium_source === 'coding_gita').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Other Sources</p>
          <p className="text-2xl font-bold text-purple-600">
            {premiumUsers.filter(u => u.premium_source && u.premium_source !== 'coding_gita').length}
          </p>
        </div>
      </div>
    </div>
  )
}
