'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminEmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [hireForm, setHireForm] = useState({
    role: 'employee',
    department: '',
    manager_id: '',
    phone: ''
  })

  // Fetch all current employees on page load
  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/search-users?q=')
      const data = await response.json()
      
      // Filter to show only employees
      const empList = (data.users || []).filter(u => u.role === 'employee' || u.role === 'intern')
      setEmployees(empList)
    } catch (err) {
      console.error('Error fetching employees:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearchQuery(query)
    setError('')

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/search-users?q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error('Failed to search users')
      }

      const data = await response.json()
      // Filter out already hired employees
      const filtered = (data.users || []).filter(u => u.role === 'user')
      setSearchResults(filtered)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = (user) => {
    setSelectedUser(user)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleHireEmployee = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedUser || !hireForm.role) {
      setError('Please select a user and role')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          ...hireForm
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to hire employee')
      }

      // Success - wait a moment for database to sync then refetch
      alert(`Employee hired successfully!`)
      console.log('Hire response:', data)
      
      // Small delay to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Clear form
      setSelectedUser(null)
      setHireForm({ role: 'employee', department: '', manager_id: '', phone: '' })
      
      // Refetch employees list
      await fetchEmployees()
      
      console.log('Employees refetched after hire')
    } catch (err) {
      console.error('Hire error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-2">Hire users and manage employee roles</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hire New Employee Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hire New Employee</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {selectedUser ? (
              <>
                {/* Selected User Info */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">Selected User</p>
                  <p className="font-semibold text-gray-900">{selectedUser.full_name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  {selectedUser.company && <p className="text-sm text-gray-600">{selectedUser.company}</p>}
                  <button
                    onClick={() => {
                      setSelectedUser(null)
                      setSearchQuery('')
                    }}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Change User
                  </button>
                </div>

                {/* Hire Form */}
                <form onSubmit={handleHireEmployee} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={hireForm.role}
                      onChange={(e) => setHireForm({ ...hireForm, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="employee">Employee</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={hireForm.department}
                      onChange={(e) => setHireForm({ ...hireForm, department: e.target.value })}
                      placeholder="e.g. Engineering, Sales"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={hireForm.phone}
                      onChange={(e) => setHireForm({ ...hireForm, phone: e.target.value })}
                      placeholder="Contact number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 transition-colors font-medium"
                  >
                    {loading ? 'Hiring...' : '✓ Hire Employee'}
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* User Search */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Search Users
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {user.job_title && <p className="text-xs text-gray-500">{user.job_title}</p>}
                        </button>
                      ))}
                    </div>
                  )}

                  {searchQuery && searchResults.length === 0 && !loading && (
                    <p className="text-sm text-gray-600">No users found</p>
                  )}

                  {loading && searchQuery && (
                    <p className="text-sm text-gray-600">Searching...</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Current Employees List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Current Employees ({employees.length})</h2>

            {loading && !employees.length ? (
              <p className="text-gray-600">Loading employees...</p>
            ) : employees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Hired Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">{emp.full_name}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">{emp.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            emp.role === 'employee' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">{emp.department || '-'}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {emp.hired_date ? new Date(emp.hired_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            emp.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No employees hired yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
