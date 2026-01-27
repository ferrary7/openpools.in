'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Common variations/synonyms for better matching
const VARIATIONS = {
  'bangalore': ['bangalore', 'bengaluru', 'blr'],
  'bengaluru': ['bangalore', 'bengaluru', 'blr'],
  'mumbai': ['mumbai', 'bombay'],
  'bombay': ['mumbai', 'bombay'],
  'chennai': ['chennai', 'madras'],
  'madras': ['chennai', 'madras'],
  'kolkata': ['kolkata', 'calcutta'],
  'calcutta': ['kolkata', 'calcutta'],
  'delhi': ['delhi', 'new delhi', 'ncr'],
  'lpu': ['lpu', 'lovely professional university', 'lovely'],
  'iit': ['iit', 'indian institute of technology'],
  'nit': ['nit', 'national institute of technology'],
  'javascript': ['javascript', 'js'],
  'typescript': ['typescript', 'ts'],
  'python': ['python', 'py'],
  'machine learning': ['machine learning', 'ml'],
  'artificial intelligence': ['artificial intelligence', 'ai'],
  'react': ['react', 'reactjs', 'react.js'],
  'node': ['node', 'nodejs', 'node.js'],
  'next': ['next', 'nextjs', 'next.js'],
}

export default function QuestionFlow({ userInput, onComplete }) {
  const [candidates, setCandidates] = useState([])
  const [extractedKeywords, setExtractedKeywords] = useState([])
  const [filterSteps, setFilterSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [stage, setStage] = useState('analyzing')
  const supabase = createClient()

  useEffect(() => {
    processInput()
  }, [])

  // Get all variations for a keyword
  const getVariations = (keyword) => {
    const kw = keyword.toLowerCase()
    if (VARIATIONS[kw]) {
      return VARIATIONS[kw]
    }
    return [kw]
  }

  const processInput = async () => {
    setLoading(true)
    setStage('analyzing')

    const { data: { user } } = await supabase.auth.getUser()

    // Fetch ALL profiles with ALL data
    const { data: profiles } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        bio,
        job_title,
        company,
        location,
        phone_number,
        linkedin_url,
        resume_url,
        keyword_profiles(keywords, total_keywords)
      `)
      .neq('id', user?.id || '')

    if (!profiles || profiles.length === 0) {
      setLoading(false)
      onComplete([], [])
      return
    }

    // Fetch all journals
    const { data: allJournals } = await supabase
      .from('journals')
      .select('user_id, content, extracted_keywords')

    const journalsByUser = {}
    if (allJournals) {
      allJournals.forEach(journal => {
        if (!journalsByUser[journal.user_id]) {
          journalsByUser[journal.user_id] = []
        }
        journalsByUser[journal.user_id].push(journal)
      })
    }

    // Build MASTER KEYWORD SET from ALL database data
    const masterKeywords = new Set()

    profiles.forEach(profile => {
      // From keyword_profiles
      if (profile.keyword_profiles?.keywords && Array.isArray(profile.keyword_profiles.keywords)) {
        profile.keyword_profiles.keywords.forEach(kw => {
          if (kw.keyword) masterKeywords.add(kw.keyword.toLowerCase().trim())
        })
      }

      // From location (split by comma)
      if (profile.location) {
        masterKeywords.add(profile.location.toLowerCase().trim())
        profile.location.split(',').forEach(part => {
          const cleaned = part.trim().toLowerCase()
          if (cleaned.length > 2) masterKeywords.add(cleaned)
        })
      }

      // From company
      if (profile.company) {
        masterKeywords.add(profile.company.toLowerCase().trim())
      }

      // From job title
      if (profile.job_title) {
        masterKeywords.add(profile.job_title.toLowerCase().trim())
        // Also add individual words from job title
        profile.job_title.toLowerCase().split(/\s+/).forEach(word => {
          if (word.length > 3) masterKeywords.add(word)
        })
      }

      // From bio
      if (profile.bio) {
        // Extract meaningful words (4+ chars)
        const bioWords = profile.bio.toLowerCase().match(/\b[a-z]{4,}\b/g) || []
        bioWords.forEach(word => masterKeywords.add(word))
      }

      // From journals
      const userJournals = journalsByUser[profile.id] || []
      userJournals.forEach(journal => {
        if (journal.extracted_keywords) {
          journal.extracted_keywords.forEach(kw => {
            if (typeof kw === 'string') {
              masterKeywords.add(kw.toLowerCase().trim())
            } else if (kw.keyword) {
              masterKeywords.add(kw.keyword.toLowerCase().trim())
            }
          })
        }
      })
    })

    // Add all variations to master keywords
    Object.values(VARIATIONS).forEach(variants => {
      variants.forEach(v => masterKeywords.add(v))
    })

    const masterKeywordsArray = Array.from(masterKeywords)

    // EXTRACT KEYWORDS using Gemini AI - pass all database data for matching
    let matchedKeywords = []

    // Build searchable data from all profiles
    const searchableData = {
      keywords: masterKeywordsArray,
      names: profiles.map(p => p.full_name).filter(Boolean),
      emails: profiles.map(p => p.email?.split('@')[0]).filter(Boolean),
      companies: [...new Set(profiles.map(p => p.company).filter(Boolean))],
      locations: [...new Set(profiles.map(p => p.location).filter(Boolean))],
      jobTitles: [...new Set(profiles.map(p => p.job_title).filter(Boolean))]
    }

    try {
      const response = await fetch('/api/ask-antenna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: userInput.input,
          intent: userInput.intent,
          searchableData
        })
      })

      if (response.ok) {
        const data = await response.json()
        matchedKeywords = data.keywords || []
      }
    } catch (error) {
      console.error('Gemini keyword extraction failed:', error)
      // Fallback: extract simple words if Gemini fails
      const input = userInput.input.toLowerCase()
      const words = input.match(/\b[a-z]{3,}\b/g) || []
      const skipWords = ['the', 'and', 'for', 'who', 'what', 'where', 'how', 'can', 'want', 'find', 'someone', 'everyone', 'anyone', 'looking', 'from', 'with', 'has', 'have', 'know', 'knows']
      matchedKeywords = words.filter(w => !skipWords.includes(w))
    }

    setExtractedKeywords(matchedKeywords)

    // If no keywords extracted, show honest message
    if (matchedKeywords.length === 0) {
      setLoading(false)
      setStage('no_keywords')
      return
    }

    await new Promise(r => setTimeout(r, 800))
    setStage('filtering')

    // Build candidate list with ALL their searchable data
    let candidateList = profiles.map(profile => {
      const userJournals = journalsByUser[profile.id] || []

      // Build searchable content for this user
      const searchableContent = new Set()

      // Keywords
      if (profile.keyword_profiles?.keywords && Array.isArray(profile.keyword_profiles.keywords)) {
        profile.keyword_profiles.keywords.forEach(kw => {
          if (kw.keyword) {
            searchableContent.add(kw.keyword.toLowerCase().trim())
            // Add variations
            getVariations(kw.keyword.toLowerCase()).forEach(v => searchableContent.add(v))
          }
        })
      }

      // Location
      if (profile.location) {
        searchableContent.add(profile.location.toLowerCase().trim())
        profile.location.split(',').forEach(part => {
          const cleaned = part.trim().toLowerCase()
          if (cleaned.length > 2) {
            searchableContent.add(cleaned)
            getVariations(cleaned).forEach(v => searchableContent.add(v))
          }
        })
      }

      // Company
      if (profile.company) {
        searchableContent.add(profile.company.toLowerCase().trim())
      }

      // Job title
      if (profile.job_title) {
        searchableContent.add(profile.job_title.toLowerCase().trim())
        profile.job_title.toLowerCase().split(/\s+/).forEach(word => {
          if (word.length > 3) searchableContent.add(word)
        })
      }

      // Bio
      if (profile.bio) {
        const bioWords = profile.bio.toLowerCase().match(/\b[a-z]{4,}\b/g) || []
        bioWords.forEach(word => searchableContent.add(word))
      }

      // Journal keywords
      userJournals.forEach(journal => {
        if (journal.extracted_keywords) {
          journal.extracted_keywords.forEach(kw => {
            if (typeof kw === 'string') {
              searchableContent.add(kw.toLowerCase().trim())
            } else if (kw.keyword) {
              searchableContent.add(kw.keyword.toLowerCase().trim())
            }
          })
        }
      })

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        bio: profile.bio,
        job_title: profile.job_title,
        company: profile.company,
        location: profile.location,
        keywords: Array.from(profile.keyword_profiles?.keywords || []).map(kw => kw.keyword).filter(Boolean),
        searchableContent: Array.from(searchableContent),
        totalKeywords: profile.keyword_profiles?.total_keywords || 0,
        hasLinkedIn: !!profile.linkedin_url,
        hasResume: !!profile.resume_url,
        matchedFilters: [],
        score: 0
      }
    })

    // SCORING - true percentage: matched keywords / total extracted keywords
    const steps = []

    for (const keyword of matchedKeywords) {
      const keywordVariations = getVariations(keyword)
      let matchCount = 0

      candidateList.forEach(c => {
        const matches = keywordVariations.some(variant =>
          c.searchableContent.some(content => {
            return content.includes(variant) || content === variant
          })
        )
        if (matches) {
          c.matchedFilters.push(keyword)
          matchCount++
        }
      })

      steps.push({
        keyword,
        before: candidateList.length,
        after: matchCount
      })
      setFilterSteps([...steps])
      await new Promise(r => setTimeout(r, 400))
    }

    // Filter to only keep candidates that matched at least ONE keyword
    candidateList = candidateList.filter(c => c.matchedFilters.length > 0)

    // Weighted antenna score: 85% keyword match, 10% profile completeness, 5% skill diversity, 5% premium boost
    function calculateProfileCompleteness(profile) {
      if (!profile) return 0;
      const fields = [
        'full_name', 'bio', 'job_title', 'company', 'location', 'linkedin_url', 'github_url', 'website'
      ];
      const filled = fields.filter(f => profile[f]?.toString().trim()).length;
      return (filled / fields.length) * 10; // out of 10
    }

    function calculateSkillDiversity(keywords) {
      if (!keywords || keywords.length === 0) return 0;
      const unique = new Set(keywords.map(k => k.toLowerCase())).size;
      // Diversity: more unique keywords = higher, scale to 5
      return Math.min(5, (unique / 12) * 5); // 12 is typical max shown
    }

    const totalKeywords = matchedKeywords.length || 1;
    const sorted = candidateList
      .map((c, idx) => {
        // Premium boost
        const isPremium = c.is_premium || c.isPremium;
        const premiumBoost = isPremium ? 5 : 0;
        // Weighted score
        const keywordScore = (c.matchedFilters.length / totalKeywords) * 85;
        const completenessScore = calculateProfileCompleteness(c);
        const diversityScore = calculateSkillDiversity(c.keywords);
        let score = keywordScore + completenessScore + diversityScore + premiumBoost;
        score = Math.min(Math.round(score), 100);
        return {
          ...c,
          score,
          keywords: c.keywords.slice(0, 12)
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setCandidates(sorted);
    setLoading(false);

    // Show results after a brief pause
    await new Promise(r => setTimeout(r, 600));
    onComplete([], sorted);
  }

  // Analyzing stage
  if (loading && stage === 'analyzing') {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <div className="text-center">
          {/* Animated antenna icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tuning into signals...</h2>
          <p className="text-sm text-gray-500">Analyzing your query with AI</p>
        </div>
      </div>
    )
  }

  // No keywords extracted - honest message
  if (stage === 'no_keywords') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No signal detected</h2>
            <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
              I couldn't extract searchable keywords from your query. Try being more specific.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs font-medium text-gray-500 mb-2">Try something like:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full text-gray-700">"Python developer in Bangalore"</span>
                <span className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full text-gray-700">"Someone from LPU who knows React"</span>
              </div>
            </div>

            <button
              onClick={() => onComplete([], [])}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'filtering') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-4">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-sm font-medium text-primary-700">Scanning network</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Finding your matches</h2>
          <p className="text-sm text-gray-500">
            {candidates.length > 0 ? `Found ${candidates.length} potential matches` : 'Searching through profiles...'}
          </p>
        </div>

        {/* Extracted Keywords */}
        {extractedKeywords.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="text-sm font-semibold text-gray-900">Detected Keywords</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {extractedKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200 rounded-lg"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filter Steps */}
        {filterSteps.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <p className="text-sm font-semibold text-gray-900">Filter Progress</p>
            </div>
            <div className="space-y-2">
              {filterSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-fadeIn"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      step.after > 0
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{step.keyword}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    step.after > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {step.after} {step.after === 1 ? 'match' : 'matches'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-full">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-gray-600">Processing...</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
