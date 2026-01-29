'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import CandidateUploader from '@/components/org/CandidateUploader'

export default function UploadCandidatesPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [uploadComplete, setUploadComplete] = useState(false)
  const [successCount, setSuccessCount] = useState(0)

  const handleUploadComplete = (results) => {
    const successes = results.filter(r => r.success).length
    setSuccessCount(successes)
    if (successes > 0) {
      setUploadComplete(true)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
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
        <h1 className="text-2xl font-bold text-gray-900">Upload Resumes</h1>
        <p className="text-sm text-gray-500">
          Upload PDF resumes to automatically extract candidate information and skills
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CandidateUploader
          orgSlug={slug}
          onUploadComplete={handleUploadComplete}
        />
      </div>

      {/* Success Actions */}
      {uploadComplete && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-green-900">
                {successCount} candidate{successCount !== 1 ? 's' : ''} added successfully!
              </h3>
              <p className="mt-1 text-sm text-green-700">
                Keywords have been extracted and candidates are ready for matching.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href={`/org/${slug}/candidates`}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                >
                  View Candidates
                </Link>
                <Link
                  href={`/org/${slug}/search`}
                  className="inline-flex items-center px-4 py-2 border border-green-600 text-green-700 font-medium rounded-lg hover:bg-green-50"
                >
                  Run a Search
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">How it works</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3">
              1
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Upload</h4>
            <p className="text-sm text-gray-500">Drop PDF resume files</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3">
              2
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Extract</h4>
            <p className="text-sm text-gray-500">AI extracts skills & info</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3">
              3
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Match</h4>
            <p className="text-sm text-gray-500">Search against job descriptions</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Best results:</strong> Use machine-readable PDF resumes (not scanned images).
            The AI will extract contact info, skills, experience, and education.
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Uploaded candidates are private to your organization.
            They will not appear in the public OpenPools directory.
          </p>
        </div>
      </div>
    </div>
  )
}
