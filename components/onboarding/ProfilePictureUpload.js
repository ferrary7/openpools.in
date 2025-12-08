'use client'

import { useState } from 'react'

export default function ProfilePictureUpload({
  currentImage,
  userName = '',
  onImageChange,
  uploading = false
}) {
  const [preview, setPreview] = useState(currentImage || null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Pass file to parent
    if (onImageChange) {
      onImageChange(file, URL.createObjectURL(file))
    }
  }

  const getInitials = () => {
    if (!userName) return '?'
    const parts = userName.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return userName[0].toUpperCase()
  }

  return (
    <div className="card border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50/30">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <span className="text-2xl">📸</span> Profile Picture
        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Optional</span>
      </h3>

      <div className="flex items-center gap-6">
        {/* Preview Circle */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-primary-200">
            {preview ? (
              <img
                src={preview}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center text-white text-3xl font-bold">
                {getInitials()}
              </div>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-primary-400 rounded-lg transition-all text-gray-700 font-medium shadow-sm hover:shadow-md">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {uploading ? 'Uploading...' : preview ? 'Change Photo' : 'Add Photo'}
          </label>
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG or GIF. Max size 5MB.
          </p>
        </div>
      </div>
    </div>
  )
}
