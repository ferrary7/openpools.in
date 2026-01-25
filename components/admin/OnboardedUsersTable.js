'use client'

import { useState, useEffect } from 'react'

export default function OnboardedUsersTable() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [viewingKeywords, setViewingKeywords] = useState(null)
  const [keywords, setKeywords] = useState([])
  const [keywordsLoading, setKeywordsLoading] = useState(false)

  // Search state
  const [search, setSearch] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage])

  useEffect(() => {
    if (!search) {
      setFilteredUsers(users)
    } else {
      const s = search.toLowerCase()
      setFilteredUsers(
        users.filter(
          (u) =>
            (u.full_name && u.full_name.toLowerCase().includes(s)) ||
            (u.email && u.email.toLowerCase().includes(s)) ||
            (u.company && u.company.toLowerCase().includes(s)) ||
            (u.location && u.location.toLowerCase().includes(s))
        )
      )
    }
  }, [search, users])

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/admin/onboarded-users?page=${page}&limit=20`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
        return
      }
      const data = await res.json()
      setUsers(data.users || [])
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchKeywords = async (userId) => {
    try {
      setKeywordsLoading(true)
      const res = await fetch(`/api/admin/users/${userId}/keywords`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      const data = await res.json()
      setKeywords(data.keywords || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setKeywordsLoading(false)
    }
  }

  const handleViewKeywords = async (user) => {
    setViewingKeywords(user)
    await fetchKeywords(user.id)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      job_title: user.job_title || '',
      company: user.company || '',
      location: user.location || '',
      bio: user.bio || '',
    })
  }

  const handleSaveEdit = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
        return
      }

      setEditingUser(null)
      setFormData({})
      await fetchUsers(currentPage)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (userId) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
        return
      }

      setDeleteConfirm(null)
      await fetchUsers(currentPage)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>


  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Onboarded Users</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredUsers.length} of {pagination.total} users
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, company, location..."
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-64"
          />
          <button
            onClick={() => fetchUsers(currentPage)}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mt-2 sm:mt-0 sm:ml-2"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-w-full">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No onboarded users found</div>
        ) : (
          <>
            <table className="w-full min-w-[600px] text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 whitespace-nowrap">Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 whitespace-nowrap">Email</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 whitespace-nowrap">Job Title</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 whitespace-nowrap">Company</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 whitespace-nowrap">Location</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 whitespace-nowrap">Joined</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{user.full_name || '—'}</td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{user.email}</td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{user.job_title || '—'}</td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{user.company || '—'}</td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{user.location || '—'}</td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-3 py-2 space-x-2">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleViewKeywords(user)}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-xs font-medium"
                        >
                          🔑 Keywords
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-medium"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs font-medium"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total users)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Keywords Modal */}
      {viewingKeywords && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Keywords for {viewingKeywords.full_name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{viewingKeywords.email}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {keywordsLoading ? (
                <div className="text-center text-gray-500">Loading keywords...</div>
              ) : keywords.length === 0 ? (
                <div className="text-center text-gray-500">No keywords found for this user</div>
              ) : (
                <div className="space-y-2">
                  {keywords.map((kw, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{kw.keyword}</p>
                        <p className="text-xs text-gray-600">Source: {kw.source || 'Unknown'}</p>
                      </div>
                      <div className="ml-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          Weight: {kw.weight || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setViewingKeywords(null)
                  setKeywords([])
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit User</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setEditingUser(null)
                  setFormData({})
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-red-600 mb-2">Delete User</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone and will remove them from the entire application.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
