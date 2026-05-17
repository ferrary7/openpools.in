'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminCounterpools() {
  const router = useRouter()
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [search, setSearch] = useState('')
  const [actioning, setActioning] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ keywords: '', admin_notes: '' })

  // Fetch problems
  useEffect(() => {
    fetchProblems()
  }, [statusFilter, search])

  const fetchProblems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (search) params.append('search', search)

      const response = await fetch(`/api/admin/counterpools?${params.toString()}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch')
      }

      setProblems(data.data || [])
      setError(null)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id) => {
    setActioning(prev => ({ ...prev, [id]: 'verifying' }))
    try {
      const response = await fetch(`/api/admin/counterpools/${id}/verify`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify')
      }

      // Update local state
      setProblems(prev => prev.map(p => p.id === id ? { ...p, status: 'open', notification_sent: true } : p))
      alert('✓ Problem verified and email sent!')
    } catch (err) {
      alert('❌ Error: ' + err.message)
    } finally {
      setActioning(prev => ({ ...prev, [id]: null }))
    }
  }

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to reject this problem?')) return
    setActioning(prev => ({ ...prev, [id]: 'rejecting' }))
    try {
      const response = await fetch(`/api/admin/counterpools/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      setProblems(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p))
      alert('✓ Problem rejected')
    } catch (err) {
      alert('❌ Error: ' + err.message)
    } finally {
      setActioning(prev => ({ ...prev, [id]: null }))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this problem? This cannot be undone.')) return
    setActioning(prev => ({ ...prev, [id]: 'deleting' }))
    try {
      const response = await fetch(`/api/admin/counterpools/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      setProblems(prev => prev.filter(p => p.id !== id))
      alert('✓ Problem deleted')
    } catch (err) {
      alert('❌ Error: ' + err.message)
    } finally {
      setActioning(prev => ({ ...prev, [id]: null }))
    }
  }

  const handleEditOpen = (problem) => {
    setEditingId(problem.id)
    setEditForm({
      keywords: problem.keywords || '',
      admin_notes: problem.admin_notes || '',
    })
  }

  const handleEditSave = async () => {
    setActioning(prev => ({ ...prev, [editingId]: 'saving' }))
    try {
      const response = await fetch(`/api/admin/counterpools/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      setProblems(prev => prev.map(p => p.id === editingId ? { ...p, ...editForm } : p))
      setEditingId(null)
      alert('✓ Problem updated')
    } catch (err) {
      alert('❌ Error: ' + err.message)
    } finally {
      setActioning(prev => ({ ...prev, [editingId]: null }))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'open': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'solved': return 'bg-purple-100 text-purple-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const currentProblem = problems.find(p => p.id === editingId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Counterpools Manager</h1>
        <p className="text-gray-600 mt-2">Manage and verify submitted problems</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Problems</option>
              <option value="pending">Pending Review</option>
              <option value="open">Open/Published</option>
              <option value="in_progress">In Progress</option>
              <option value="solved">Solved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search title, email, or name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && currentProblem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Edit Problem</h2>
              <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Problem Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Sector</div>
                  <div className="text-sm font-semibold text-gray-900">{currentProblem.domain}</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Difficulty</div>
                  <div className="text-sm font-semibold text-gray-900">{currentProblem.difficulty}</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Status</div>
                  <div className="text-sm font-semibold text-gray-900">{currentProblem.status}</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Teams Interested</div>
                  <div className="text-sm font-semibold text-gray-900">{currentProblem.teams_interested || 0}</div>
                </div>
              </div>

              {/* Problem Title */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Problem Title</h3>
                <p className="text-gray-600">{currentProblem.problem_title}</p>
              </div>

              {/* Email */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitter Email</h3>
                <p className="text-gray-600">{currentProblem.email}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitter Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-900">Name:</span> {currentProblem.full_name}</p>
                  <p><span className="font-medium text-gray-900">LinkedIn:</span> {currentProblem.linkedin_url ? <a href={currentProblem.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 break-all">{currentProblem.linkedin_url}</a> : 'Not provided'}</p>
                  <p><span className="font-medium text-gray-900">Solution Adoption:</span> {currentProblem.solution_adoption ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium text-gray-900">Hiring Interest:</span> {currentProblem.hiring_interest ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Problem Statement</h3>
                <textarea
                  readOnly
                  value={currentProblem.description || ''}
                  rows="8"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-700 text-sm leading-relaxed"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Expected Outcome</h3>
                <textarea
                  readOnly
                  value={currentProblem.expected_outcome || ''}
                  rows="5"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-700 text-sm leading-relaxed"
                />
              </div>

              {/* Links/URLs */}
              {currentProblem.links && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Problem Links</h3>
                  <div className="space-y-2">
                    {currentProblem.links.split('\n').map((link, idx) => (
                      link.trim() && (
                        <a key={idx} href={link.trim()} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 break-all text-sm block">
                          {link.trim()}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Keywords / Signals</h3>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">
                  {currentProblem.keywords || 'None added yet'}
                </p>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords/Signals (comma-separated)</label>
                <textarea
                  value={editForm.keywords}
                  onChange={(e) => setEditForm(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="e.g., machine-learning, python, data-processing, optimization"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                />
                <p className="text-xs text-gray-500 mt-1">Add keywords to help teams discover and match with this problem</p>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={editForm.admin_notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                  placeholder="Internal notes..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={actioning[editingId]}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {actioning[editingId] === 'saving' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Problems Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading problems...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Error: {error}</div>
        ) : problems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No problems found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Problem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Expert</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Domain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Keywords</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Teams</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {problems.map((problem) => (
                  <tr key={problem.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 max-w-xs truncate">{problem.problem_title}</p>
                        <p className="text-xs text-gray-500">{problem.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{problem.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{problem.domain}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{problem.difficulty}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {problem.keywords ? (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{problem.keywords.split(',').length} keywords</span>
                      ) : (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(problem.status)}`}>
                        {problem.status.charAt(0).toUpperCase() + problem.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{problem.teams_interested || 0}</td>
                    <td className="px-6 py-4 text-sm space-y-2">
                      <button
                        onClick={() => handleEditOpen(problem)}
                        className="block w-full px-3 py-1 bg-purple-500 text-white rounded text-xs font-medium hover:bg-purple-600"
                      >
                        Edit
                      </button>
                      {problem.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVerify(problem.id)}
                            disabled={actioning[problem.id]}
                            className="block w-full px-3 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 disabled:opacity-50"
                          >
                            {actioning[problem.id] === 'verifying' ? 'Verifying...' : 'Verify & Email'}
                          </button>
                          <button
                            onClick={() => handleReject(problem.id)}
                            disabled={actioning[problem.id]}
                            className="block w-full px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 disabled:opacity-50"
                          >
                            {actioning[problem.id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                          </button>
                        </>
                      )}
                      {problem.status !== 'pending' && (
                        <button
                          onClick={() => handleDelete(problem.id)}
                          disabled={actioning[problem.id]}
                          className="block w-full px-3 py-1 bg-gray-400 text-white rounded text-xs font-medium hover:bg-gray-500 disabled:opacity-50"
                        >
                          {actioning[problem.id] === 'deleting' ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
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
