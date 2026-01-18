'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import KeywordDisplay from '@/components/onboarding/KeywordDisplay'
import PdfUploader from '@/components/profile/PdfUploader'
import { mergeKeywords } from '@/lib/keywords'
import { uploadProfilePicture, deleteProfilePicture } from '@/components/profile/ProfilePictureUploader'
import { validateUsernameFormat, sanitizeUsername, generateUsernameSuggestions } from '@/lib/username'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [keywordProfile, setKeywordProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPdfUploader, setShowPdfUploader] = useState(false)
  const [savingKeywords, setSavingKeywords] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingKeywords, setEditingKeywords] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, error: null })
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    company: '',
    job_title: '',
    location: '',
    phone_number: '',
    show_phone_to_collaborators: true,
    hide_profile_picture_from_collaborators: false,
    linkedin_url: '',
    website: '',
    twitter_url: '',
    github_url: ''
  })
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    // Handle auto-scroll to hash on page load
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash) {
        setTimeout(() => {
          const element = document.querySelector(hash)
          if (element) {
            const elementPosition = element.getBoundingClientRect().top + window.scrollY
            const offsetPosition = elementPosition - 120 // Account for navbar height
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            })
          }
        }, 100)
      }
    }
  }, [loading])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: keywordData } = await supabase
      .from('keyword_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setProfile(profileData)
    setKeywordProfile(keywordData)
    setUsernameInput(profileData?.username || '')

    if (profileData) {
      setFormData({
        full_name: profileData.full_name || '',
        bio: profileData.bio || '',
        company: profileData.company || '',
        job_title: profileData.job_title || '',
        location: profileData.location || '',
        phone_number: profileData.phone_number || '',
        show_phone_to_collaborators: profileData.show_phone_to_collaborators !== false,
        hide_profile_picture_from_collaborators: profileData.hide_profile_picture_from_collaborators || false,
        linkedin_url: profileData.linkedin_url || '',
        website: profileData.website || '',
        twitter_url: profileData.twitter_url || '',
        github_url: profileData.github_url || ''
      })
    }

    setLoading(false)
  }

  const checkUsernameAvailability = async (username) => {
    try {
      const response = await fetch(`/api/username/check?username=${encodeURIComponent(username)}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error checking username:', error)
      return { available: false, error: 'Failed to check availability' }
    }
  }

  const handleUsernameChange = (value) => {
    const sanitized = sanitizeUsername(value)
    setUsernameInput(sanitized)

    // Clear previous timeout
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout)
    }

    // Reset status
    setUsernameStatus({ checking: false, available: null, error: null })

    // If empty or same as current, don't check
    if (!sanitized || sanitized === profile?.username) {
      return
    }

    // Validate format first
    const validation = validateUsernameFormat(sanitized)
    if (!validation.valid) {
      setUsernameStatus({ checking: false, available: false, error: validation.error })
      return
    }

    // Debounce the API call
    const timeout = setTimeout(async () => {
      setUsernameStatus({ checking: true, available: null, error: null })
      const result = await checkUsernameAvailability(sanitized)
      setUsernameStatus({
        checking: false,
        available: result.available,
        error: result.error || null
      })
    }, 500)

    setUsernameCheckTimeout(timeout)
  }

  const handleSaveUsername = async () => {
    if (!usernameInput || usernameInput === profile?.username) {
      return
    }

    if (usernameStatus.error || usernameStatus.available === false) {
      alert('Please choose a valid and available username')
      return
    }

    try {
      setSaving(true)

      const response = await fetch('/api/username/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update username')
      }

      await loadProfile()
      alert('Username updated successfully!')
    } catch (error) {
      alert('Error updating username: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploadingImage(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Delete old image if exists
      if (profile?.profile_picture_url) {
        try {
          await deleteProfilePicture(profile.profile_picture_url)
        } catch (error) {
          console.warn('Error deleting old profile picture:', error)
        }
      }

      // Upload new image
      const imageUrl = await uploadProfilePicture(file, user.id)

      // Update profile with new image URL
      const { error } = await supabase
        .from('profiles')
        .update({ profile_picture_url: imageUrl })
        .eq('id', user.id)

      if (error) throw error

      // Refresh the page to show updated profile picture
      window.location.reload()
    } catch (error) {
      alert('Error uploading profile picture: ' + error.message)
      setUploadingImage(false)
    }
  }

  const handleKeywordsExtracted = async (newKeywords) => {
    setSavingKeywords(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      let finalKeywords = newKeywords
      if (keywordProfile?.keywords) {
        finalKeywords = mergeKeywords(keywordProfile.keywords, newKeywords)
      }

      const { error } = await supabase
        .from('keyword_profiles')
        .upsert(
          {
            user_id: user.id,
            keywords: finalKeywords,
            total_keywords: finalKeywords.length,
            last_updated: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

      if (error) throw error

      await loadProfile()
      setShowPdfUploader(false)
      alert('Keywords added successfully!')
    } catch (error) {
      alert('Error saving keywords: ' + error.message)
    } finally {
      setSavingKeywords(false)
    }
  }

  const handleSaveProfile = async () => {
    // Validate required fields
    if (!formData.company?.trim()) {
      alert('Company is required')
      return
    }
    if (!formData.job_title?.trim()) {
      alert('Job Title is required')
      return
    }
    if (!formData.location?.trim()) {
      alert('Location is required')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id)

      if (error) throw error

      await loadProfile()
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      alert('Error saving profile: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteKeyword = async (indexToDelete) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const updatedKeywords = keywordProfile.keywords.filter((_, index) => index !== indexToDelete)

      const { error } = await supabase
        .from('keyword_profiles')
        .update({
          keywords: updatedKeywords,
          total_keywords: updatedKeywords.length,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error

      await loadProfile()
    } catch (error) {
      alert('Error deleting keyword: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors">
            Edit Profile
          </button>
        ) : (
          <div className="space-x-2">
            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setEditing(false)
                loadProfile()
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Picture Section */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Picture</h2>
        <div className="flex items-center gap-6">
          {/* Profile Picture Display */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gradient-to-br from-primary-400 to-purple-400">
              {profile?.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || '?'}
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex-1">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                disabled={uploadingImage}
                className="hidden"
              />
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {uploadingImage ? 'Uploading...' : 'Change Picture'}
            </label>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>
        </div>

        {/* Privacy Settings for Profile Picture */}
        {editing && profile?.profile_picture_url && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hide_profile_picture_from_collaborators}
                onChange={(e) => setFormData({ ...formData, hide_profile_picture_from_collaborators: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                Hide profile picture from collaborators
                <span className="block text-xs text-gray-500 mt-0.5">
                  When enabled, collaborators will only see the first letter of your name
                </span>
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            {editing ? (
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="input-field w-full"
              />
            ) : (
              <div className="text-gray-900">{profile?.full_name || 'Not set'}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="text-gray-900">{profile?.email}</div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            {editing ? (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">@</span>
                  </div>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className={`input-field w-full pl-8 ${
                      usernameStatus.error
                        ? 'border-red-500 focus:ring-red-500'
                        : usernameStatus.available
                        ? 'border-green-500 focus:ring-green-500'
                        : ''
                    }`}
                    placeholder="your_username"
                    maxLength={30}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {usernameStatus.checking && (
                      <div className="animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                    )}
                    {!usernameStatus.checking && usernameStatus.available && (
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {!usernameStatus.checking && usernameStatus.error && (
                      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
                {usernameStatus.error && (
                  <p className="text-xs text-red-600">{usernameStatus.error}</p>
                )}
                {usernameStatus.available && (
                  <p className="text-xs text-green-600">Username is available!</p>
                )}
                {!profile?.username && !usernameInput && (
                  <p className="text-xs text-gray-500">
                    Choose a unique username for your profile URL (3-30 characters, letters, numbers, underscores, hyphens)
                  </p>
                )}
                {usernameInput && usernameInput !== profile?.username && usernameStatus.available && (
                  <button
                    onClick={handleSaveUsername}
                    disabled={saving}
                    className="text-sm px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Username'}
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="text-gray-900">
                  {profile?.username ? `@${profile.username}` : 'Not set'}
                </div>
                {profile?.username && (
                  <p className="text-xs text-gray-500 mt-1">
                    Your profile URL: openpools.in/dna/{profile.username}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            {editing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input-field w-full"
                rows={4}
                placeholder="Tell others about yourself and what you're looking to collaborate on..."
              />
            ) : (
              <div className="text-gray-900">{profile?.bio || 'Not set'}</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input-field w-full"
                  required
                />
              ) : (
                <div className="text-gray-900">{profile?.company || 'Not set'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className="input-field w-full"
                  required
                />
              ) : (
                <div className="text-gray-900">{profile?.job_title || 'Not set'}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field w-full"
                placeholder="City, Country"
                required
              />
            ) : (
              <div className="text-gray-900">{profile?.location || 'Not set'}</div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info - Private */}
      <div className="card mb-6 border-2 border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3 mb-4">
          <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
            <p className="text-sm text-amber-700 mt-1">
              Only visible to users you have an active collaboration with
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            {editing ? (
              <div className="space-y-3">
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="input-field w-full"
                  placeholder="+1 234 567 8900"
                />
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!formData.show_phone_to_collaborators}
                    onChange={(e) => setFormData({ ...formData, show_phone_to_collaborators: !e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    Hide phone number from collaborators
                    <span className="block text-xs text-gray-500 mt-0.5">
                      When enabled, only first 3 digits will be visible (e.g., +91*******)
                    </span>
                  </span>
                </label>
              </div>
            ) : (
              <div>
                <div className="text-gray-900">{profile?.phone_number || 'Not set'}</div>
                {profile?.phone_number && (
                  <div className="text-xs text-gray-500 mt-1">
                    {profile?.show_phone_to_collaborators
                      ? 'Full number visible to collaborators'
                      : 'Only first 3 digits visible to collaborators'}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            {editing ? (
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                className="input-field w-full"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            ) : (
              <div className="text-gray-900">
                {profile?.linkedin_url ? (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {profile.linkedin_url}
                  </a>
                ) : 'Not set'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            {editing ? (
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="input-field w-full"
                placeholder="https://yourwebsite.com"
              />
            ) : (
              <div className="text-gray-900">
                {profile?.website ? (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {profile.website}
                  </a>
                ) : 'Not set'}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter/X</label>
              {editing ? (
                <input
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  className="input-field w-full"
                  placeholder="https://twitter.com/username"
                />
              ) : (
                <div className="text-gray-900">
                  {profile?.twitter_url ? (
                    <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      @{profile.twitter_url.split('/').pop()}
                    </a>
                  ) : 'Not set'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
              {editing ? (
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  className="input-field w-full"
                  placeholder="https://github.com/username"
                />
              ) : (
                <div className="text-gray-900">
                  {profile?.github_url ? (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      @{profile.github_url.split('/').pop()}
                    </a>
                  ) : 'Not set'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save/Cancel buttons at bottom when editing */}
        {editing && (
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-2">
            <button
              onClick={() => {
                setEditing(false)
                loadProfile()
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* PDF Upload */}
      <div id="add-pdf-signals" className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Signals from PDF
          </h2>
          {!showPdfUploader && (
            <button
              onClick={() => setShowPdfUploader(true)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Upload PDF
            </button>
          )}
        </div>

        {showPdfUploader ? (
          <div>
            <PdfUploader onKeywordsExtracted={handleKeywordsExtracted} />
            <button
              onClick={() => setShowPdfUploader(false)}
              className="mt-4 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">
            Upload a PDF to extract and add professional keywords to your profile
          </p>
        )}
      </div>

      {/* Keywords */}
      <div className="card">
        {keywordProfile?.keywords ? (
          <>
            <KeywordDisplay
              keywords={keywordProfile.keywords}
              editMode={editingKeywords}
              onDelete={handleDeleteKeyword}
              onToggleEdit={() => setEditingKeywords(!editingKeywords)}
            />
            <div className="mt-4 text-sm text-gray-600">
              Last updated: {new Date(keywordProfile.last_updated).toLocaleDateString()}
            </div>
          </>
        ) : (
          <div className="text-gray-600">No keywords yet. Upload a PDF to get started!</div>
        )}
      </div>
    </div>
  )
}
