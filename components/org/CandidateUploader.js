'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function CandidateUploader({ orgSlug, onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadResults, setUploadResults] = useState([])

  const onDrop = useCallback(async (acceptedFiles) => {
    setError(null)
    setUploading(true)
    const results = []

    for (const file of acceptedFiles) {
      try {
        const formData = new FormData()
        formData.append('resume', file)

        const response = await fetch(`/api/org/${orgSlug}/candidates/upload`, {
          method: 'POST',
          body: formData
        })

        const data = await response.json()

        if (!response.ok) {
          results.push({
            fileName: file.name,
            success: false,
            error: data.error || 'Upload failed'
          })
        } else {
          results.push({
            fileName: file.name,
            success: true,
            candidate: data.candidate,
            keywords: data.keywords
          })
        }
      } catch (err) {
        results.push({
          fileName: file.name,
          success: false,
          error: err.message
        })
      }
    }

    setUploadResults(results)
    setUploading(false)

    if (onUploadComplete) {
      onUploadComplete(results)
    }
  }, [orgSlug, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading
  })

  const successCount = uploadResults.filter(r => r.success).length
  const failCount = uploadResults.filter(r => !r.success).length

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="text-gray-600">Processing resumes...</p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop the files here' : 'Drag and drop resume PDFs'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                or click to select files
              </p>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              PDF files only, up to 10MB each
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {uploadResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {successCount > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ {successCount} uploaded
              </span>
            )}
            {failCount > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                ✗ {failCount} failed
              </span>
            )}
          </div>

          <ul className="divide-y divide-gray-200 border rounded-lg">
            {uploadResults.map((result, index) => (
              <li key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-green-100">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    ) : (
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-100">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{result.fileName}</p>
                      {result.success && result.candidate && (
                        <p className="text-sm text-gray-500">
                          Created: {result.candidate.full_name}
                          {result.keywords?.length > 0 && ` • ${result.keywords.length} keywords extracted`}
                        </p>
                      )}
                      {!result.success && (
                        <p className="text-sm text-red-600">{result.error}</p>
                      )}
                    </div>
                  </div>
                  {result.success && result.candidate && (
                    <a
                      href={`/org/${orgSlug}/candidates/${result.candidate.id}`}
                      className="text-sm font-medium text-black hover:underline"
                    >
                      View →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
