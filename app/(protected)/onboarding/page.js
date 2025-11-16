'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import KeywordDisplay from '@/components/onboarding/KeywordDisplay'
import PdfUploader from '@/components/profile/PdfUploader'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [resumeText, setResumeText] = useState('')
  const [linkedinText, setLinkedinText] = useState('')
  const [keywords, setKeywords] = useState([])
  const [extracting, setExtracting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [uploadMethod, setUploadMethod] = useState('pdf') // 'text' or 'pdf'
  const router = useRouter()
  const supabase = createClient()

  const handlePdfKeywordsExtracted = (extractedKeywords) => {
    // Store keywords and move to next step
    setKeywords(extractedKeywords)
    setStep(2)
  }

  const handleExtractKeywords = async () => {
    setExtracting(true)

    try {
      // If we already have keywords from PDF and only adding LinkedIn, merge them
      if (keywords.length > 0 && linkedinText) {
        const sources = [{ text: linkedinText, source: 'linkedin' }]

        const response = await fetch('/api/extract-keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sources }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to extract keywords')
        }

        // Merge with existing PDF keywords
        setKeywords(data.keywords)
      } else {
        // Extract from text sources
        const sources = []

        if (resumeText) {
          sources.push({ text: resumeText, source: 'resume' })
        }

        if (linkedinText) {
          sources.push({ text: linkedinText, source: 'linkedin' })
        }

        const response = await fetch('/api/extract-keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sources }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to extract keywords')
        }

        setKeywords(data.keywords)
      }

      setStep(3)
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setExtracting(false)
    }
  }

  const handleComplete = async () => {
    setCompleting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Save keywords to keyword_profiles table
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

        // Mark onboarding as completed
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id)
      }

      router.push('/dashboard')
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
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

        <div className="card">
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
                      onClick={() => setStep(2)}
                      disabled={!resumeText.trim()}
                      className="btn-primary w-full disabled:opacity-50"
                    >
                      Continue
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Optional LinkedIn */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Add LinkedIn Profile (Optional)
              </h1>
              <p className="text-gray-600 mb-6">
                {keywords.length > 0
                  ? 'Add LinkedIn text to expand your keyword profile, or skip to review'
                  : 'Paste your LinkedIn profile text for more comprehensive matching'}
              </p>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="linkedin"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    LinkedIn Profile Text
                  </label>
                  <textarea
                    id="linkedin"
                    rows={6}
                    value={linkedinText}
                    onChange={(e) => setLinkedinText(e.target.value)}
                    placeholder="Paste your LinkedIn about, experience, and skills sections here..."
                    className="input-field resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-1"
                  >
                    Back
                  </button>
                  {keywords.length > 0 && !linkedinText ? (
                    <button
                      onClick={() => setStep(3)}
                      className="btn-primary flex-1"
                    >
                      Skip to Review
                    </button>
                  ) : (
                    <button
                      onClick={handleExtractKeywords}
                      disabled={extracting}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      {extracting ? 'Processing...' : 'Continue'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review Keywords */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Your Professional Profile
              </h1>
              <p className="text-gray-600 mb-6">
                Review your extracted keywords
              </p>

              <KeywordDisplay keywords={keywords} loading={extracting} />

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {completing ? 'Completing...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
