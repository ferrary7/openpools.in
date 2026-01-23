'use client'

import { useState } from 'react'

export default function PdfUploader({ onKeywordsExtracted, onUploadingChange }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file')
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    if (onUploadingChange) onUploadingChange(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse PDF')
      }

      setResult(data)

      // Call parent callback with extracted data (keywords + profile)
      if (onKeywordsExtracted) {
        onKeywordsExtracted({
          keywords: data.keywords || [],
          profile: data.profile || {},
          text: data.text || ''
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (onUploadingChange) onUploadingChange(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      {!result ? (
        <>
          <div>
            <label
              htmlFor="pdf-upload"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload PDF Document
            </label>
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload a PDF to extract keywords (resume, document, etc.)
            </p>
          </div>

          {file && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Selected: <span className="font-medium">{file.name}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Size: {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Extracting Keywords...' : 'Extract Keywords from PDF'}
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-green-800">
                  Keywords extracted successfully!
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  Extracted {result.keywords.length} keywords from {result.wordCount} words
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Extracted Keywords:
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.keywords.slice(0, 10).map((kw, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                >
                  {kw.keyword}
                </span>
              ))}
              {result.keywords.length > 10 && (
                <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">
                  +{result.keywords.length - 10} more
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="btn-secondary w-full"
          >
            Upload Another PDF
          </button>
        </div>
      )}
    </div>
  )
}
