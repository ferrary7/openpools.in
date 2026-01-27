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
  )
}
