'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import KeywordDisplay from '@/components/onboarding/KeywordDisplay'
import PdfUploader from '@/components/profile/PdfUploader'
import NotionInput from '@/components/onboarding/NotionInput'
import ProfilePictureUpload from '@/components/onboarding/ProfilePictureUpload'
import ProfilePreviewCard from '@/components/onboarding/ProfilePreviewCard'
import { createClient } from '@/lib/supabase/client'
import { uploadProfilePicture } from '@/components/profile/ProfilePictureUploader'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [resumeText, setResumeText] = useState('')
  const [keywords, setKeywords] = useState([])
  const [extracting, setExtracting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [uploadMethod, setUploadMethod] = useState('pdf') // 'text' or 'pdf'
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false)
  const [showContactSection, setShowContactSection] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [usernameError, setUsernameError] = useState(null)
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState(null)
  const [linkedinContentText, setLinkedinContentText] = useState('')
  const [extractingLinkedIn, setExtractingLinkedIn] = useState(false)
  const [showLinkedinPaste, setShowLinkedinPaste] = useState(false)
  const [workHistory, setWorkHistory] = useState([])
  const [showWorkHistoryPaste, setShowWorkHistoryPaste] = useState(false)
  const [workHistoryText, setWorkHistoryText] = useState('')
  const [usernameSuggestions, setUsernameSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Profile data state
  const [profileData, setProfileData] = useState({
    full_name: '',
    bio: '',
    username: '',
    profile_picture: null,
    profile_picture_url: '',
    company: '',
    job_title: '',
    location: '',
    phone_number: '',
    linkedin_url: '',
    website: '',
    twitter_url: '',
    github_url: '',
    show_phone_to_collaborators: false,
    hide_profile_picture_from_collaborators: false,
  })

  // Track which fields were auto-filled
  const [autoFilledFields, setAutoFilledFields] = useState({})

  const router = useRouter()
  const supabase = createClient()

  // Auto-generate username when landing on step 2 with a full_name
  useEffect(() => {
    if (step === 2 && profileData.full_name && !profileData.username) {
      generateUsernameSuggestions(profileData.full_name)
    }
  }, [step])

  const handlePdfKeywordsExtracted = async (extractedData) => {
    // extractedData now contains: { keywords, profile, text }
    setKeywords(extractedData.keywords || [])

    // Set work history if extracted
    if (extractedData.profile?.work_history && Array.isArray(extractedData.profile.work_history)) {
      setWorkHistory(extractedData.profile.work_history)
    }

    // Auto-populate profile data if extracted
    if (extractedData.profile) {
      const autoFilled = {}
      const updatedProfile = { ...profileData }

      // Map extracted profile fields
      if (extractedData.profile.full_name) {
        updatedProfile.full_name = extractedData.profile.full_name
        autoFilled.full_name = true
      }
      if (extractedData.profile.bio) {
        updatedProfile.bio = extractedData.profile.bio
        autoFilled.bio = true
      }
      if (extractedData.profile.company) {
        updatedProfile.company = extractedData.profile.company
        autoFilled.company = true
      }
      if (extractedData.profile.job_title) {
        updatedProfile.job_title = extractedData.profile.job_title
        autoFilled.job_title = true
      }
      if (extractedData.profile.location) {
        updatedProfile.location = extractedData.profile.location
        autoFilled.location = true
      }
      if (extractedData.profile.phone_number) {
        updatedProfile.phone_number = extractedData.profile.phone_number
        autoFilled.phone_number = true
      }
      if (extractedData.profile.linkedin_url) {
        updatedProfile.linkedin_url = extractedData.profile.linkedin_url
        autoFilled.linkedin_url = true
      }
      if (extractedData.profile.github_url) {
        updatedProfile.github_url = extractedData.profile.github_url
        autoFilled.github_url = true
      }
      if (extractedData.profile.website) {
        updatedProfile.website = extractedData.profile.website
        autoFilled.website = true
      }
      if (extractedData.profile.twitter_url) {
        updatedProfile.twitter_url = extractedData.profile.twitter_url
        autoFilled.twitter_url = true
      }

      setProfileData(updatedProfile)
      setAutoFilledFields(autoFilled)
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Save keywords to database
        await supabase
          .from('keyword_profiles')
          .upsert(
            {
              user_id: user.id,
              keywords: extractedData.keywords || [],
              total_keywords: extractedData.keywords?.length || 0,
              last_updated: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
      }
    } catch (error) {
      console.error('Error saving keywords:', error)
    }

    setStep(2)
  }

  const handleUsernameChange = (value) => {
    // Sanitize username (remove spaces, special chars except underscore/hyphen)
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    setProfileData({ ...profileData, username: sanitized })

    // Clear previous timeout
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout)
    }

    // Reset status
    setUsernameError(null)
    setUsernameAvailable(null)

    // If empty, don't check
    if (!sanitized) {
      return
    }

    // Validate format first
    if (sanitized.length < 3) {
      setUsernameError('Username must be at least 3 characters')
      return
    }
    if (sanitized.length > 30) {
      setUsernameError('Username must be less than 30 characters')
      return
    }
    if (!/^[a-z0-9]/.test(sanitized)) {
      setUsernameError('Username must start with a letter or number')
      return
    }

    // Debounce the API call
    const timeout = setTimeout(async () => {
      setCheckingUsername(true)
      try {
        const response = await fetch(`/api/username/check?username=${encodeURIComponent(sanitized)}`)
        const data = await response.json()
        setUsernameAvailable(data.available)
        if (!data.available && data.error) {
          setUsernameError(data.error)
        }
      } catch (error) {
        console.error('Error checking username:', error)
        setUsernameError('Failed to check availability')
      } finally {
        setCheckingUsername(false)
      }
    }, 500)

    setUsernameCheckTimeout(timeout)
  }

  const generateUsernameSuggestions = async (fullName) => {
    if (!fullName || fullName.trim().length < 2) {
      setUsernameSuggestions([])
      return
    }

    setLoadingSuggestions(true)
    try {
      // Parse the full name
      const nameParts = fullName.trim().toLowerCase().split(/\s+/)
      const firstName = nameParts[0]
      const lastName = nameParts[nameParts.length - 1]

      // Generate base suggestions
      const baseSuggestions = [
        `${firstName}${lastName}`,
        `${firstName}.${lastName}`,
        `${firstName}_${lastName}`,
        `${lastName}${firstName}`,
      ]

      // Remove duplicates and sanitize
      const uniqueSuggestions = [...new Set(baseSuggestions)].map(s =>
        s.toLowerCase().replace(/[^a-z0-9_.-]/g, '')
      )

      // Check availability and generate numbered variants
      const suggestions = []
      
      for (const baseSugg of uniqueSuggestions) {
        // Check if base suggestion is available
        const response = await fetch(`/api/username/check?username=${encodeURIComponent(baseSugg)}`)
        const data = await response.json()

        if (data.available) {
          suggestions.push({ username: baseSugg, available: true })
        } else {
          // If not available, generate numbered variants (baseSugg1, baseSugg2, etc.)
          for (let i = 1; i <= 3; i++) {
            const variantUsername = `${baseSugg}${i}`
            const variantResponse = await fetch(`/api/username/check?username=${encodeURIComponent(variantUsername)}`)
            const variantData = await variantResponse.json()
            
            if (variantData.available) {
              suggestions.push({ username: variantUsername, available: true })
              break // Stop once we find an available numbered variant
            }
          }
        }
      }

      const topSuggestions = suggestions.slice(0, 4)
      setUsernameSuggestions(topSuggestions)
      
      // Auto-fill username with the first suggestion
      if (topSuggestions.length > 0) {
        setProfileData(prev => ({ ...prev, username: topSuggestions[0].username }))
      }
    } catch (error) {
      console.error('Error generating username suggestions:', error)
      setUsernameSuggestions([])
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleFullNameChange = (value) => {
    setProfileData({ ...profileData, full_name: value })
    generateUsernameSuggestions(value)
  }

  const applySuggestion = (suggestedUsername) => {
    setProfileData({ ...profileData, username: suggestedUsername })
    handleUsernameChange(suggestedUsername)
    setUsernameSuggestions([])
  }

  const handleProfilePictureChange = (file, previewUrl) => {
    setProfileData({
      ...profileData,
      profile_picture: file,
      profile_picture_url: previewUrl,
    })
  }

  const handleTextResumeSubmit = async () => {
    if (!resumeText.trim()) {
      alert('Please paste your resume text')
      return
    }

    setExtracting(true)

    try {
      // Extract profile data from pasted text
      const response = await fetch('/api/extract-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: [{ text: resumeText, source: 'resume' }]
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract data')
      }

      // Set keywords
      setKeywords(data.keywords || [])

      // Set work history if extracted
      if (data.profile?.work_history && Array.isArray(data.profile.work_history)) {
        setWorkHistory(data.profile.work_history)
      }

      // Auto-populate profile data if extracted
      if (data.profile) {
        const autoFilled = {}
        const updatedProfile = { ...profileData }

        if (data.profile.full_name) {
          updatedProfile.full_name = data.profile.full_name
          autoFilled.full_name = true
        }
        if (data.profile.bio) {
          updatedProfile.bio = data.profile.bio
          autoFilled.bio = true
        }
        if (data.profile.company) {
          updatedProfile.company = data.profile.company
          autoFilled.company = true
        }
        if (data.profile.job_title) {
          updatedProfile.job_title = data.profile.job_title
          autoFilled.job_title = true
        }
        if (data.profile.location) {
          updatedProfile.location = data.profile.location
          autoFilled.location = true
        }
        if (data.profile.phone_number) {
          updatedProfile.phone_number = data.profile.phone_number
          autoFilled.phone_number = true
        }
        if (data.profile.linkedin_url) {
          updatedProfile.linkedin_url = data.profile.linkedin_url
          autoFilled.linkedin_url = true
        }
        if (data.profile.github_url) {
          updatedProfile.github_url = data.profile.github_url
          autoFilled.github_url = true
        }
        if (data.profile.website) {
          updatedProfile.website = data.profile.website
          autoFilled.website = true
        }
        if (data.profile.twitter_url) {
          updatedProfile.twitter_url = data.profile.twitter_url
          autoFilled.twitter_url = true
        }

        setProfileData(updatedProfile)
        setAutoFilledFields(autoFilled)
      }

      setStep(2)
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setExtracting(false)
    }
  }

  const handleCopyFromLinkedIn = () => {
    // Check if LinkedIn URL is already filled
    if (profileData.linkedin_url?.trim()) {
      // If URL exists, directly open LinkedIn
      handleOpenLinkedInProfile()
    } else {
      // Show tooltip and scroll to LinkedIn section
      alert('💡 To copy from LinkedIn:\n\n1. First, scroll down and enter your LinkedIn profile URL in the Contact & Social section\n2. Then click the "Open LinkedIn & Copy Content" button\n3. Copy your About, Experience, and Skills from LinkedIn\n4. Paste it back here to enhance your profile!')

      setShowContactSection(true)
      setTimeout(() => {
        const linkedinSection = document.getElementById('linkedin-section')
        if (linkedinSection) {
          linkedinSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Highlight the LinkedIn field
          const linkedinInput = linkedinSection.querySelector('input')
          if (linkedinInput) {
            linkedinInput.focus()
          }
        }
      }, 100)
    }
  }

  const handleOpenLinkedInProfile = () => {
    if (!profileData.linkedin_url?.trim()) {
      alert('Please enter your LinkedIn profile URL first')
      return
    }

    // Open LinkedIn profile in new tab
    window.open(profileData.linkedin_url, '_blank')

    // Show the paste section
    setShowLinkedinPaste(true)
  }

  const handleExtractLinkedInContent = async () => {
    if (!linkedinContentText.trim()) {
      alert('Please paste your LinkedIn content first')
      return
    }

    setExtractingLinkedIn(true)

    try {
      const response = await fetch('/api/extract-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: [{ text: linkedinContentText, source: 'linkedin' }]
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract LinkedIn data')
      }

      // Merge keywords with existing
      if (data.keywords && data.keywords.length > 0) {
        setKeywords(prev => {
          const merged = [...prev]
          data.keywords.forEach(newKw => {
            const exists = merged.find(k => k.keyword === newKw.keyword)
            if (!exists) {
              merged.push(newKw)
            }
          })
          return merged
        })
      }

      // Update bio if extracted and not already filled
      if (data.profile?.bio && !profileData.bio) {
        setProfileData(prev => ({ ...prev, bio: data.profile.bio }))
        setAutoFilledFields(prev => ({ ...prev, bio: true }))
      }

      alert('LinkedIn content extracted successfully! Check your keywords and bio.')
      setShowLinkedinPaste(false)
      setLinkedinContentText('')
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setExtractingLinkedIn(false)
    }
  }

  const handleContinueToReview = () => {
    // Validate required fields
    if (!profileData.full_name?.trim()) {
      alert('Full Name is required')
      return
    }
    if (!profileData.company?.trim()) {
      alert('Company is required')
      return
    }
    if (!profileData.job_title?.trim()) {
      alert('Job Title is required')
      return
    }
    if (!profileData.location?.trim()) {
      alert('Location is required')
      return
    }

    // Username is now required
    if (!profileData.username?.trim()) {
      alert('⚠️ Username is required\n\nPlease set a username to create your personalized profile URL.')
      // Scroll to username field
      setTimeout(() => {
        const usernameInput = document.querySelector('input[placeholder="your_username"]')
        if (usernameInput) {
          usernameInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
          usernameInput.focus()
        }
      }, 100)
      return
    }

    // Check if username is available before proceeding
    if (usernameError) {
      alert('⚠️ Please fix the username error before continuing:\n\n' + usernameError)
      return
    }

    if (usernameAvailable === false) {
      alert('⚠️ The username "' + profileData.username + '" is not available. Please choose a different one.')
      return
    }

    setStep(3)
  }

  const handleComplete = async () => {
    setCompleting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No user found')
      }

      // 1. Upload profile picture if exists
      let uploadedImageUrl = profileData.profile_picture_url
      if (profileData.profile_picture) {
        try {
          uploadedImageUrl = await uploadProfilePicture(profileData.profile_picture, user.id)
        } catch (error) {
          console.error('Error uploading profile picture:', error)
          // Continue even if image upload fails
        }
      }

      // 2. Save profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name || null,
          bio: profileData.bio || null,
          username: profileData.username || null,
          profile_picture_url: uploadedImageUrl || null,
          company: profileData.company,
          job_title: profileData.job_title,
          location: profileData.location,
          phone_number: profileData.phone_number || null,
          linkedin_url: profileData.linkedin_url || null,
          website: profileData.website || null,
          twitter_url: profileData.twitter_url || null,
          github_url: profileData.github_url || null,
          show_phone_to_collaborators: profileData.show_phone_to_collaborators,
          hide_profile_picture_from_collaborators: profileData.hide_profile_picture_from_collaborators,
          onboarding_completed: true,
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('Error saving profile:', profileError)
        throw new Error('Failed to save profile: ' + profileError.message)
      }

      // Send welcome email (non-blocking)
      fetch('/api/send-welcome-email', {
        method: 'POST',
      }).catch(err => console.error('Welcome email failed:', err))

      // 3. Save keywords (already saved during extraction, but upsert again for consistency)
      if (keywords.length > 0) {
        const { error: keywordError } = await supabase
          .from('keyword_profiles')
          .upsert(
            {
              user_id: user.id,
              keywords: keywords,
              total_keywords: keywords.length,
              last_updated: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )

        if (keywordError) {
          console.error('Error saving keywords:', keywordError)
          throw new Error('Failed to save keywords: ' + keywordError.message)
        }
      }

      router.push('/dashboard')
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {step} of 3</span>
            <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {/* Step 1: Resume Upload */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Add Your Resume
              </h1>
              <p className="text-gray-600 mb-6">
                Upload a PDF or paste your resume text to extract keywords
              </p>

              <div className="space-y-4">
                {/* Upload Method Toggle */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setUploadMethod('pdf')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      uploadMethod === 'pdf'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Upload PDF
                  </button>
                  <button
                    onClick={() => setUploadMethod('text')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      uploadMethod === 'text'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>

                {/* PDF Upload */}
                {uploadMethod === 'pdf' && (
                  <PdfUploader onKeywordsExtracted={handlePdfKeywordsExtracted} />
                )}

                {/* Text Input */}
                {uploadMethod === 'text' && (
                  <>
                    <div>
                      <label
                        htmlFor="resume"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Resume Text
                      </label>
                      <textarea
                        id="resume"
                        rows={10}
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your resume, work experience, skills, and qualifications here..."
                        className="input-field resize-none"
                      />
                    </div>

                    <button
                      onClick={handleTextResumeSubmit}
                      disabled={!resumeText.trim() || extracting}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      {extracting ? 'Extracting data...' : 'Continue'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Complete Your Profile Form */}
          {step === 2 && (
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 via-purple-400 to-primary-500 bg-clip-text text-transparent mb-2">
                Complete Your Profile
              </h1>
              <p className="text-gray-600 mb-8">
                We've pre-filled this from your resume. Review and edit as needed.
              </p>

              <div className="space-y-4">
                {/* Profile Picture Section */}
                <ProfilePictureUpload
                  currentImage={profileData.profile_picture_url}
                  userName={profileData.full_name}
                  onImageChange={handleProfilePictureChange}
                  uploading={uploadingProfilePic}
                />

                {/* Basic Information */}
                <div className="space-y-4 border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">👤</span> Basic Information
                  </h3>

                  <NotionInput
                    label="Full Name"
                    value={profileData.full_name}
                    onChange={(e) => handleFullNameChange(e.target.value)}
                    placeholder="Your full name"
                    required
                    autoFilled={autoFilledFields.full_name}
                  />

                  {/* Username Suggestions */}
                  {usernameSuggestions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <p className="text-sm font-medium text-blue-900">Suggested usernames</p>
                        {loadingSuggestions && (
                          <div className="flex items-center gap-1 ml-auto">
                            <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            <span className="text-xs text-blue-600">Checking...</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {usernameSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.username}
                            onClick={() => applySuggestion(suggestion.username)}
                            className="px-3 py-2 bg-white text-left border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium text-gray-900"
                          >
                            <span className="text-blue-600">@</span>{suggestion.username}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <NotionInput
                    label="Username"
                    value={profileData.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="your_username"
                    required
                    maxLength={30}
                    error={usernameError}
                    icon="@"
                  />
                  {profileData.username && !usernameError && (
                    <div className="flex items-center gap-2 text-xs">
                      {checkingUsername ? (
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="animate-spin h-3 w-3 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                          Checking availability...
                        </div>
                      ) : usernameAvailable ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Username available! Your profile will be at openpools.in/dna/{profileData.username}
                        </div>
                      ) : (
                        <div className="text-red-600">Username not available</div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Bio</label>
                      <button
                        type="button"
                        onClick={handleCopyFromLinkedIn}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Copy from LinkedIn
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      placeholder="Tell us about yourself and what you're looking to collaborate on..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all text-gray-900 placeholder-gray-400 resize-none"
                    />
                    {autoFilledFields.bio && (
                      <div className="flex items-center gap-1 text-xs text-primary-600">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Auto-filled from resume
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Details - Required */}
                <div className="space-y-4 border-b border-gray-200 pb-4 bg-gradient-to-br from-white to-primary-50/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">💼</span> Professional Details
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">Required</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NotionInput
                      label="Company"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      placeholder="Your current company"
                      required
                      autoFilled={autoFilledFields.company}
                    />

                    <NotionInput
                      label="Job Title"
                      value={profileData.job_title}
                      onChange={(e) => setProfileData({ ...profileData, job_title: e.target.value })}
                      placeholder="Your current role"
                      required
                      autoFilled={autoFilledFields.job_title}
                    />
                  </div>

                  <NotionInput
                    label="Location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="City, Country"
                    required
                    autoFilled={autoFilledFields.location}
                  />
                </div>

                {/* Past Work Experience - Optional */}
                <div className="space-y-4 bg-gradient-to-br from-white to-purple-50/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">💼</span> Past Work Experience
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">For better matching</span>
                    </h3>
                    {workHistory.length === 0 && (
                      <button
                        type="button"
                        onClick={() => setShowWorkHistoryPaste(!showWorkHistoryPaste)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                      >
                        {showWorkHistoryPaste ? 'Hide' : 'Add Experience'}
                      </button>
                    )}
                  </div>

                  {workHistory.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        ✨ We extracted {workHistory.length} work experience{workHistory.length > 1 ? 's' : ''} from your resume
                      </p>
                      {workHistory.map((job, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900">{job.job_title}</h4>
                              <p className="text-sm text-gray-700">{job.company}</p>
                              {job.duration && (
                                <p className="text-xs text-gray-500 mt-1">{job.duration}</p>
                              )}
                              {job.description && (
                                <p className="text-sm text-gray-600 mt-2">{job.description}</p>
                              )}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const newTitle = prompt('Edit Job Title:', job.job_title)
                                  if (newTitle && newTitle.trim()) {
                                    const updated = [...workHistory]
                                    updated[index] = { ...updated[index], job_title: newTitle.trim() }
                                    setWorkHistory(updated)
                                  }
                                }}
                                className="p-1.5 hover:bg-primary-50 rounded text-primary-600 hover:text-primary-700 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete "${job.job_title}" at ${job.company}?`)) {
                                    setWorkHistory(workHistory.filter((_, i) => i !== index))
                                  }
                                }}
                                className="p-1.5 hover:bg-red-50 rounded text-red-600 hover:text-red-700 transition-colors"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowWorkHistoryPaste(true)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        + Add more experience
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Add your past work experience to improve keyword matching. This helps us find better collaboration opportunities.
                    </p>
                  )}

                  {showWorkHistoryPaste && (
                    <div className="mt-4 p-4 border-2 border-purple-200 bg-purple-50/50 rounded-lg space-y-3 animate-fadeIn">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-purple-800">
                          <p className="font-semibold mb-1">Paste your past work experience:</p>
                          <p className="text-purple-700 text-xs">
                            Copy past job descriptions, responsibilities, and achievements from your resume or LinkedIn. We'll extract additional keywords for better matching!
                          </p>
                        </div>
                      </div>

                      <textarea
                        rows={6}
                        value={workHistoryText}
                        onChange={(e) => setWorkHistoryText(e.target.value)}
                        placeholder="Example:&#10;&#10;Software Engineer at TechCorp (2019-2021)&#10;- Built scalable web applications using React and Node.js&#10;- Led team of 3 developers&#10;- Improved performance by 40%"
                        className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all text-gray-900 placeholder-gray-500 resize-none bg-white text-sm"
                      />

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!workHistoryText.trim()) {
                              alert('Please paste your work experience first')
                              return
                            }

                            setExtractingLinkedIn(true)
                            try {
                              const response = await fetch('/api/extract-keywords', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  sources: [{ text: workHistoryText, source: 'work_history' }]
                                }),
                              })

                              const data = await response.json()

                              if (!response.ok) {
                                throw new Error(data.error || 'Failed to extract work history')
                              }

                              // Merge keywords
                              if (data.keywords && data.keywords.length > 0) {
                                setKeywords(prev => {
                                  const merged = [...prev]
                                  data.keywords.forEach(newKw => {
                                    const exists = merged.find(k => k.keyword === newKw.keyword)
                                    if (!exists) {
                                      merged.push(newKw)
                                    }
                                  })
                                  return merged
                                })
                              }

                              // Add work history if extracted
                              if (data.profile?.work_history && Array.isArray(data.profile.work_history)) {
                                setWorkHistory(prev => [...prev, ...data.profile.work_history])
                              }

                              alert('Work experience extracted successfully!')
                              setShowWorkHistoryPaste(false)
                              setWorkHistoryText('')
                            } catch (error) {
                              alert('Error: ' + error.message)
                            } finally {
                              setExtractingLinkedIn(false)
                            }
                          }}
                          disabled={!workHistoryText.trim() || extractingLinkedIn}
                          className="btn-primary flex-1 disabled:opacity-50"
                        >
                          {extractingLinkedIn ? 'Extracting...' : 'Extract Keywords'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowWorkHistoryPaste(false)
                            setWorkHistoryText('')
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact & Social - Optional */}
                <div className="space-y-4 bg-gradient-to-br from-white to-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">🔗</span> Contact & Social
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Optional</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowContactSection(!showContactSection)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      {showContactSection ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {showContactSection && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div id="linkedin-section" className="space-y-2">
                          <NotionInput
                            label="LinkedIn"
                            icon="🔵"
                            value={profileData.linkedin_url}
                            onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
                            placeholder="https://linkedin.com/in/..."
                            autoFilled={autoFilledFields.linkedin_url}
                          />
                          {profileData.linkedin_url && (
                            <button
                              type="button"
                              onClick={handleOpenLinkedInProfile}
                              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Open LinkedIn & Copy Content
                            </button>
                          )}
                        </div>

                        <NotionInput
                          label="GitHub"
                          icon="⚫"
                          value={profileData.github_url}
                          onChange={(e) => setProfileData({ ...profileData, github_url: e.target.value })}
                          placeholder="https://github.com/..."
                          autoFilled={autoFilledFields.github_url}
                        />

                        <NotionInput
                          label="Website"
                          icon="🌐"
                          value={profileData.website}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                          placeholder="https://yourwebsite.com"
                          autoFilled={autoFilledFields.website}
                        />

                        <NotionInput
                          label="Twitter/X"
                          icon="🐦"
                          value={profileData.twitter_url}
                          onChange={(e) => setProfileData({ ...profileData, twitter_url: e.target.value })}
                          placeholder="https://twitter.com/..."
                          autoFilled={autoFilledFields.twitter_url}
                        />
                      </div>

                      <NotionInput
                        label="Phone Number"
                        type="tel"
                        value={profileData.phone_number}
                        onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                        placeholder="+1 234 567 8900"
                        autoFilled={autoFilledFields.phone_number}
                      />

                      <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={profileData.show_phone_to_collaborators}
                          onChange={(e) => setProfileData({ ...profileData, show_phone_to_collaborators: e.target.checked })}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span>
                          Show full phone number to collaborators
                          <span className="block text-xs text-gray-500 mt-0.5">
                            By default, only last 3 digits are visible for privacy
                          </span>
                        </span>
                      </label>

                      {/* LinkedIn Content Paste Section */}
                      {showLinkedinPaste && (
                        <div className="mt-6 p-4 border-2 border-blue-200 bg-blue-50 rounded-lg space-y-3 animate-fadeIn">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-800">
                              <p className="font-semibold mb-1">How to copy your LinkedIn content:</p>
                              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                                <li>Your LinkedIn profile should now be open in a new tab</li>
                                <li>Copy your <strong>About</strong> section, <strong>Experience</strong>, and <strong>Skills</strong></li>
                                <li>Paste the content in the text area below</li>
                                <li>Click "Extract Content" to enhance your bio and keywords</li>
                              </ol>
                            </div>
                          </div>

                          <textarea
                            rows={8}
                            value={linkedinContentText}
                            onChange={(e) => setLinkedinContentText(e.target.value)}
                            placeholder="Paste your LinkedIn About, Experience, and Skills sections here..."
                            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-900 placeholder-gray-500 resize-none bg-white"
                          />

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleExtractLinkedInContent}
                              disabled={!linkedinContentText.trim() || extractingLinkedIn}
                              className="btn-primary flex-1 disabled:opacity-50"
                            >
                              {extractingLinkedIn ? 'Extracting...' : 'Extract Content'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowLinkedinPaste(false)}
                              className="btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleContinueToReview}
                  className="btn-primary flex-1 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 transition-all"
                >
                  Continue to Review →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review Profile & Signals */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Review Your Profile
                </h1>
                <p className="text-gray-600 mb-4">
                  Everything looks good? Confirm to complete your setup.
                </p>
              </div>

              {/* Profile Preview Card */}
              <ProfilePreviewCard
                profileData={profileData}
                onEdit={() => setStep(2)}
              />

              {/* Keywords Display */}
              <div className="space-y-2 rounded-lg p-4 bg-white border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">✨</span> Your Professional Signals
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                    {keywords.length} keywords
                  </span>
                </h3>
                <KeywordDisplay keywords={keywords} loading={extracting} />
              </div>

              {/* Confirmation Message */}
              <div className="bg-gradient-to-r from-purple-50 via-primary-50 to-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">🚀</span>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg mb-1">
                    Ready to unlock collaborations?
                  </h4>
                  <p className="text-sm text-gray-700">
                    Your profile and signals will be used to match you with relevant opportunities
                    and collaborators. You can always update your profile later.
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary flex-1"
                >
                  ← Back to Edit
                </button>
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="btn-primary flex-1 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-600 hover:from-primary-600 hover:via-purple-600 hover:to-primary-700 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {completing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Completing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      ✨ Complete Setup
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
