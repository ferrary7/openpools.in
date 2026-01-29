'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function JobsPage() {
  const { slug } = useParams()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showActiveOnly, setShowActiveOnly] = useState(true)

  // New job form
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    department: '',
    location: '',
    employment_type: 'full-time'
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [slug, showActiveOnly])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/org/${slug}/jobs?activeOnly=${showActiveOnly}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch jobs')
      }

      setJobs(data.jobs || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateJob = async (e) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch(`/api/org/${slug}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job')
      }

      setShowNewModal(false)
      setNewJob({
        title: '',
        description: '',
        department: '',
        location: '',
        employment_type: 'full-time'
      })
      fetchJobs()
    } catch (err) {
      alert(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleArchiveJob = async (jobId) => {
    if (!confirm('Archive this job description?')) return

    try {
      const response = await fetch(`/api/org/${slug}/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to archive job')
      }

      fetchJobs()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Permanently delete this job description?')) return

    try {
      const response = await fetch(`/api/org/${slug}/jobs/${jobId}?permanent=true`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete job')
      }

      fetchJobs()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Descriptions</h1>
          <p className="text-sm text-gray-500">Save and manage job descriptions for quick searching</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <span className="mr-2">+</span>
          New Job
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowActiveOnly(true)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            showActiveOnly
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active Jobs
        </button>
        <button
          onClick={() => setShowActiveOnly(false)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            !showActiveOnly
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Jobs
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Jobs List */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No job descriptions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Save job descriptions here to quickly search for matching candidates.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800"
            >
              Create Job Description
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div
              key={job.id}
              className={`bg-white border rounded-lg p-6 ${
                job.is_active ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    {!job.is_active && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                        Archived
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    {job.department && <span>{job.department}</span>}
                    {job.location && <span>{job.location}</span>}
                    {job.employment_type && <span className="capitalize">{job.employment_type}</span>}
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {job.description?.substring(0, 200)}...
                  </p>
                  {job.keywords && job.keywords.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {job.keywords.slice(0, 8).map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                        >
                          {kw.keyword}
                        </span>
                      ))}
                      {job.keywords.length > 8 && (
                        <span className="text-xs text-gray-500">
                          +{job.keywords.length - 8} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/org/${slug}/search?job=${job.id}`}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-black rounded hover:bg-gray-800"
                  >
                    Search
                  </Link>
                  {job.is_active ? (
                    <button
                      onClick={() => handleArchiveJob(job.id)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Archive
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Created {new Date(job.created_at).toLocaleDateString()}
                  {job.creator && ` by ${job.creator.full_name || job.creator.email}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Job Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">New Job Description</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newJob.department}
                    onChange={(e) => setNewJob(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Engineering"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Remote / San Francisco"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={newJob.employment_type}
                    onChange={(e) => setNewJob(prev => ({ ...prev, employment_type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Paste or write the full job description here. Include responsibilities, requirements, qualifications, etc."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Keywords will be automatically extracted for searching
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newJob.title || !newJob.description}
                  className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
