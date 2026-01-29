'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function CandidateTable({
  candidates,
  orgSlug,
  onStatusChange,
  onDelete,
  isLoading = false
}) {
  const [selectedCandidates, setSelectedCandidates] = useState([])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCandidates(candidates.map(c => c.id))
    } else {
      setSelectedCandidates([])
    }
  }

  const handleSelectOne = (id) => {
    setSelectedCandidates(prev =>
      prev.includes(id)
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      case 'hired':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSourceIcon = (source) => {
    switch (source) {
      case 'upload':
        return '📄'
      case 'manual':
        return '✏️'
      case 'linkedin':
        return '💼'
      case 'referral':
        return '🤝'
      default:
        return '📋'
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    )
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by uploading a resume or adding a candidate manually.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={`/org/${orgSlug}/candidates/upload`}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
          >
            Upload Resume
          </Link>
          <Link
            href={`/org/${orgSlug}/candidates/new`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Add Manually
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="relative px-6 py-3">
              <input
                type="checkbox"
                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                checked={selectedCandidates.length === candidates.length}
                onChange={handleSelectAll}
              />
            </th>
            <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Candidate
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Title
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Location
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Source
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Status
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Added
            </th>
            <th scope="col" className="relative py-3 pl-3 pr-4">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {candidates.map((candidate) => (
            <tr key={candidate.id} className={selectedCandidates.includes(candidate.id) ? 'bg-gray-50' : undefined}>
              <td className="relative px-6 py-4">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  checked={selectedCandidates.includes(candidate.id)}
                  onChange={() => handleSelectOne(candidate.id)}
                />
              </td>
              <td className="whitespace-nowrap py-4 pl-4 pr-3">
                <Link href={`/org/${orgSlug}/candidates/${candidate.id}`} className="block">
                  <div className="font-medium text-gray-900 hover:text-black">
                    {candidate.full_name}
                  </div>
                  {candidate.email && (
                    <div className="text-sm text-gray-500">{candidate.email}</div>
                  )}
                </Link>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {candidate.job_title || '—'}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {candidate.location || '—'}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <span title={candidate.source}>
                  {getSourceIcon(candidate.source)} {candidate.source}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(candidate.status)}`}>
                  {candidate.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
              </td>
              <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/org/${orgSlug}/candidates/${candidate.id}`}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    View
                  </Link>
                  {candidate.resume_url && (
                    <a
                      href={candidate.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Resume
                    </a>
                  )}
                  {onStatusChange && candidate.status === 'active' && (
                    <button
                      onClick={() => onStatusChange(candidate.id, 'archived')}
                      className="text-red-600 hover:text-red-900"
                    >
                      Archive
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
