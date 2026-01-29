'use client'

import { useState, useEffect, useCallback } from 'react'

import DataTable from '@/components/admin/DataTable'
import { useMemo } from 'react'
import PremiumBadge from '@/components/ui/PremiumBadge'

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
  const [exporting, setExporting] = useState(false)

  // Search, sort, filter state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    company: '',
    location: '',
    premium: ''
  })
  const [filterOptions, setFilterOptions] = useState({
    companies: [],
    locations: []
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1) // Reset to first page on search
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch users when dependencies change
  useEffect(() => {
    fetchUsers()
  }, [currentPage, pageSize, debouncedSearch, sortBy, sortOrder, filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        search: debouncedSearch,
        sortBy,
        sortOrder,
        company: filters.company,
        location: filters.location,
        premium: filters.premium
      })

      console.log('[OnboardedUsersTable] Fetching users with params:', Object.fromEntries(params.entries()))
      const res = await fetch(`/api/admin/onboarded-users?${params}`)
      console.log('[OnboardedUsersTable] Response status:', res.status)
      if (!res.ok) {
        const data = await res.json()
        console.error('[OnboardedUsersTable] API error:', data)
        setError(data.error)
        return
      }
      const data = await res.json()
      console.log('[OnboardedUsersTable] API data:', data)
      setUsers(data.users || [])
      setPagination(data.pagination)
      setFilterOptions(data.filterOptions || { companies: [], locations: [] })
    } catch (err) {
      console.error('[OnboardedUsersTable] Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams({
        export: 'true',
        search: debouncedSearch,
        sortBy,
        sortOrder,
        company: filters.company,
        location: filters.location,
        premium: filters.premium
      })

      const res = await fetch(`/api/admin/onboarded-users?${params}`)
      const data = await res.json()

      if (!res.ok) {
        alert('Export failed: ' + data.error)
        return
      }

      // Convert to CSV
      const headers = ['Name', 'Email', 'Job Title', 'Company', 'Location', 'Premium', 'Joined']
      const rows = data.users.map(u => [
        u.full_name || '',
        u.email || '',
        u.job_title || '',
        u.company || '',
        u.location || '',
        u.is_premium ? 'Yes' : 'No',
        formatDate(u.created_at)
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    } catch (err) {
      alert('Export failed: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  const clearFilters = () => {
    setFilters({ company: '', location: '', premium: '' })
    setSearch('')
    setCurrentPage(1)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
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
      await fetchUsers()
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
      await fetchUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-blue-600 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
  }

  const hasActiveFilters = filters.company || filters.location || filters.premium || debouncedSearch

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>

  // DataTable columns definition
  const columns = [
    {
      header: 'DNA',
      id: 'dna',
      cell: info => {
        const username = info.row.original.username;
        const id = info.row.original.id;
        const hasUsername = typeof username === 'string' && username.trim().length > 0;
        const dnaLink = hasUsername ? `/dna/${username}` : `/dna/${id}`;
        return (
          <a
            href={dnaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 text-xs"
          >
            View DNA
          </a>
        );
      },
      enableSorting: false,
    },
    {
      header: 'Name',
      accessorKey: 'full_name',
      cell: info => info.getValue() || '—',
      enableSorting: true,
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: info => info.getValue(),
      enableSorting: true,
    },
    {
      header: 'Job Title',
      accessorKey: 'job_title',
      cell: info => info.getValue() || '—',
      enableSorting: true,
    },
    {
      header: 'Company',
      accessorKey: 'company',
      cell: info => info.getValue() || '—',
      enableSorting: true,
    },
    {
      header: 'Location',
      accessorKey: 'location',
      cell: info => info.getValue() || '—',
      enableSorting: true,
    },
    {
      header: 'Premium',
      accessorKey: 'is_premium',
      cell: info => (
        <PremiumBadge
          isPremium={info.row.original.is_premium}
          premiumSource={info.row.original.premium_source}
          expiresAt={info.row.original.premium_expires_at}
          size="sm"
          showLabel={true}
        />
      ),
      enableSorting: true,
    },
    {
      header: 'Joined',
      accessorKey: 'created_at',
      cell: info => formatDate(info.getValue()),
      enableSorting: true,
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: info => (
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => handleViewKeywords(info.row.original)}
            className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-xs font-medium"
            title="View Keywords"
          >
            🔑
          </button>
          <button
            onClick={() => handleEdit(info.row.original)}
            className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-medium"
            title="Edit User"
          >
            ✏️
          </button>
          <button
            onClick={() => setDeleteConfirm(info.row.original.id)}
            className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs font-medium"
            title="Delete User"
          >
            🗑️
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ]

  // Defensive: always at least 1 page
  const safeTotalPages = Number.isFinite(pagination.totalPages) && pagination.totalPages > 0 ? pagination.totalPages : 1;
  const safePageIndex = Number.isFinite(currentPage) && currentPage > 0 ? currentPage - 1 : 0;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;
  const safeTotalRows = Number.isFinite(pagination.total) && pagination.total >= 0 ? pagination.total : 0;

  const serverSidePagination = useMemo(() => ({
    pageCount: safeTotalPages,
    pageIndex: safePageIndex,
    pageSize: safePageSize,
    totalRows: safeTotalRows,
    onPaginationChange: (updater) => {
      // Support both function and object forms
      let next = updater;
      if (typeof updater === 'function') {
        next = updater({ pageIndex: safePageIndex, pageSize: safePageSize });
        console.log('[OnboardedUsersTable] Pagination change (function):', next);
      } else {
        console.log('[OnboardedUsersTable] Pagination change (object):', next);
      }
      if (!next || !Number.isFinite(next.pageIndex) || !Number.isFinite(next.pageSize)) {
        console.warn('[OnboardedUsersTable] Ignoring pagination change with undefined values:', next);
        return;
      }
      const nextPage = next.pageIndex + 1;
      const nextSize = next.pageSize;
      setCurrentPage(nextPage);
      setPageSize(nextSize);
    },
  }), [safeTotalPages, safePageIndex, safePageSize, safeTotalRows]);

  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        error={error}
        title="All Onboarded Users"
        subtitle={`${safeTotalRows} total users${hasActiveFilters ? ' (filtered)' : ''}`}
        exportFilename="users-export"
        enableColumnFilters={true}
        enableRowSelection={false}
        enableExport={true}
        emptyMessage={hasActiveFilters ? 'No users match your filters' : 'No onboarded users found'}
        serverSidePagination={serverSidePagination}
        serverSideSort={{
          sorting: sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : [],
          onSortingChange: (updater) => {
            const sort = typeof updater === 'function' ? updater([{ id: sortBy, desc: sortOrder === 'desc' }]) : updater;
            if (sort.length > 0) {
              setSortBy(sort[0].id);
              setSortOrder(sort[0].desc ? 'desc' : 'asc');
            }
          },
        }}
        serverSideFilter={{
          globalFilter: debouncedSearch,
          onGlobalFilterChange: (value) => setSearch(value),
        }}
        actions={null}
      />

      {/* View Keywords Modal */}
      {viewingKeywords && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Keywords for {viewingKeywords.full_name || viewingKeywords.email}
              </h3>
              <button
                onClick={() => { setViewingKeywords(null); setKeywords([]); }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {keywordsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                    >
                      {typeof kw === 'string' ? kw : kw.keyword || kw.name || JSON.stringify(kw)}
                      {kw.weight && (
                        <span className="ml-1 text-purple-500 text-xs">({kw.weight})</span>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No keywords found for this user.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button
                onClick={() => { setEditingUser(null); setFormData({}); }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={formData.job_title || ''}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => { setEditingUser(null); setFormData({}); }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-red-600">Delete User</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
