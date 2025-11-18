'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import KeywordDisplay from '@/components/onboarding/KeywordDisplay'
import PdfUploader from '@/components/profile/PdfUploader'
import { mergeKeywords } from '@/lib/keywords'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [keywordProfile, setKeywordProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPdfUploader, setShowPdfUploader] = useState(false)
  const [savingKeywords, setSavingKeywords] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingKeywords, setEditingKeywords] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    company: '',
    job_title: '',
    location: '',
    phone_number: '',
    linkedin_url: '',
    website: '',
    twitter_url: '',
    github_url: ''
  })
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])


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

    if (profileData) {
      setFormData({
        full_name: profileData.full_name || '',
        bio: profileData.bio || '',
        company: profileData.company || '',
        job_title: profileData.job_title || '',
        location: profileData.location || '',
        phone_number: profileData.phone_number || '',
        linkedin_url: profileData.linkedin_url || '',
        website: profileData.website || '',
        twitter_url: profileData.twitter_url || '',
        github_url: profileData.github_url || ''
      })
    }

    setLoading(false)
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
          <button onClick={() => setEditing(true)} className="btn-secondary">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input-field w-full"
                />
              ) : (
                <div className="text-gray-900">{profile?.company || 'Not set'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className="input-field w-full"
                />
              ) : (
                <div className="text-gray-900">{profile?.job_title || 'Not set'}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            {editing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field w-full"
                placeholder="City, Country"
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
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="input-field w-full"
                placeholder="+1 234 567 8900"
              />
            ) : (
              <div className="text-gray-900">{profile?.phone_number || 'Not set'}</div>
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
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Keywords from PDF
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
