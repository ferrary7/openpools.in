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
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Get user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get keyword profile
    const { data: keywordData } = await supabase
      .from('keyword_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setProfile(profileData)
    setKeywordProfile(keywordData)
    setLoading(false)
  }

  const handleKeywordsExtracted = async (newKeywords) => {
    setSavingKeywords(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Merge with existing keywords if any
      let finalKeywords = newKeywords
      if (keywordProfile?.keywords) {
        finalKeywords = mergeKeywords(keywordProfile.keywords, newKeywords)
      }

      // Save to database
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

      // Reload profile
      await loadProfile()
      setShowPdfUploader(false)
      alert('Keywords added successfully!')
    } catch (error) {
      alert('Error saving keywords: ' + error.message)
    } finally {
      setSavingKeywords(false)
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>

      {/* Profile Information */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Profile Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="text-gray-900">{profile?.full_name || 'Not set'}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="text-gray-900">{profile?.email}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Keywords
            </label>
            <div className="text-gray-900">{keywordProfile?.total_keywords || 0}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member Since
            </label>
            <div className="text-gray-900">
              {new Date(profile?.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Upload Section */}
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
            Upload a PDF document (resume, portfolio, etc.) to automatically extract and add keywords to your profile.
          </p>
        )}
      </div>

      {/* Keyword Profile */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Keyword Profile
        </h2>
        {keywordProfile?.keywords ? (
          <>
            <KeywordDisplay keywords={keywordProfile.keywords} />
            <div className="mt-4 text-sm text-gray-600">
              Last updated:{' '}
              {new Date(keywordProfile.last_updated).toLocaleDateString()}
            </div>
          </>
        ) : (
          <div className="text-gray-600">No keywords yet</div>
        )}
      </div>
    </div>
  )
}
