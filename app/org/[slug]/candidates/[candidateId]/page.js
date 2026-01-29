'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'

export default function CandidateDetailPage() {
  const { slug, candidateId } = useParams()
  const router = useRouter()

  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCandidate()
  }, [candidateId])

  const fetchCandidate = async () => {
    try {
      const response = await fetch(`/api/org/${slug}/candidates/${candidateId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch candidate')
      }

      setCandidate(data.candidate)
      setEditData({
        full_name: data.candidate.full_name || '',
        email: data.candidate.email || '',
        phone: data.candidate.phone || '',
        location: data.candidate.location || '',
        job_title: data.candidate.job_title || '',
        linkedin_url: data.candidate.linkedin_url || '',
        notes: data.candidate.notes || '',
        status: data.candidate.status || 'active'
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/org/${slug}/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update candidate')
      }

      setCandidate(data.candidate)
      setEditing(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to archive this candidate?')) return

    try {
      const response = await fetch(`/api/org/${slug}/candidates/${candidateId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to archive candidate')
      }

      router.push(`/org/${slug}/candidates`)
    } catch (err) {
      alert(err.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      case 'hired': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link
          href={`/org/${slug}/candidates`}
          className="text-black underline"
        >
          Back to Candidates
        </Link>
      </div>
    )
  }

  if (!candidate) return null

  const keywords = candidate.org_candidate_keywords?.keywords || []

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/org/${slug}/candidates`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Candidates
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{candidate.full_name}</h1>
            {candidate.job_title && (
              <p className="text-gray-600">{candidate.job_title}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(candidate.status)}`}>
              {candidate.status}
            </span>
            {!editing && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50"
                >
                  Archive
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editData.full_name}
                    onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={editData.job_title}
                      onChange={(e) => setEditData(prev => ({ ...prev, job_title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={editData.linkedin_url}
                    onChange={(e) => setEditData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="hired">Hired</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="text-gray-900">
                    {candidate.email ? (
                      <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline">
                        {candidate.email}
                      </a>
                    ) : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Phone</dt>
                  <dd className="text-gray-900">{candidate.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Location</dt>
                  <dd className="text-gray-900">{candidate.location || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">LinkedIn</dt>
                  <dd className="text-gray-900">
                    {candidate.linkedin_url ? (
                      <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View Profile
                      </a>
                    ) : '—'}
                  </dd>
                </div>
              </dl>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            {editing ? (
              <textarea
                value={editData.notes}
                onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Add notes about this candidate..."
              />
            ) : (
              <p className="text-gray-600 whitespace-pre-wrap">
                {candidate.notes || 'No notes yet.'}
              </p>
            )}
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Extracted Skills ({keywords.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                  >
                    {kw.keyword}
                    {kw.weight && (
                      <span className="ml-1 text-gray-500 text-xs">({kw.weight})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Resume */}
          {candidate.resume_url && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume</h2>
              <a
                href={candidate.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Resume
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Source</dt>
                <dd className="text-gray-900 capitalize">{candidate.source}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Added</dt>
                <dd className="text-gray-900">
                  {format(new Date(candidate.created_at), 'MMM d, yyyy')}
                  <span className="text-gray-500 block text-xs">
                    {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
                  </span>
                </dd>
              </div>
              {candidate.uploader && (
                <div>
                  <dt className="text-gray-500">Added by</dt>
                  <dd className="text-gray-900">
                    {candidate.uploader.full_name || candidate.uploader.email}
                  </dd>
                </div>
              )}
              {candidate.updated_at !== candidate.created_at && (
                <div>
                  <dt className="text-gray-500">Last updated</dt>
                  <dd className="text-gray-900">
                    {formatDistanceToNow(new Date(candidate.updated_at), { addSuffix: true })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/org/${slug}/search?candidate=${candidateId}`}
                className="block w-full px-4 py-2 text-center border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Find Matching Jobs
              </Link>
              {candidate.email && (
                <a
                  href={`mailto:${candidate.email}`}
                  className="block w-full px-4 py-2 text-center border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Send Email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
