import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Exponential backoff with jitter for rate limit handling
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const isRateLimitError = error.message?.includes('429') ||
                               error.message?.includes('quota') ||
                               error.message?.includes('rate limit')

      // If not a rate limit error or last attempt, throw immediately
      if (!isRateLimitError || attempt === maxRetries - 1) {
        throw error
      }

      // Exponential backoff: 2^attempt seconds + random jitter
      const baseDelay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
      const jitter = Math.random() * 1000 // 0-1s random jitter
      const delay = baseDelay + jitter

      console.log(`Rate limit hit (attempt ${attempt + 1}/${maxRetries}), retrying in ${Math.round(delay)}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

export async function extractKeywords(text, source = 'resume') {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `Extract keywords from this text as JSON.

Format:
{
  "skills": [], "technologies": [], "companies": [], "institutions": [],
  "roles": [], "projects": [], "interests": [], "certifications": [], "links": []
}

Extract:
- skills: abilities (leadership, analysis)
- technologies: tools, languages (React, Python)
- companies: employer names
- institutions: schools, universities
- roles: job titles
- projects: project names
- interests: professional domains
- certifications: degrees, certs
- links: URLs

Use lowercase. Multi-word phrases together. Extract only what's mentioned. Empty [] if none.

Text:
${text}

Return JSON only.`

  try {
    const result = await retryWithBackoff(() => model.generateContent(prompt))
    const response = result.response.text()

    // Clean up the response
    let cleanedResponse = response.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '')
    }

    const extracted = JSON.parse(cleanedResponse)

    // Convert to keyword format with metadata
    const keywords = []
    const categories = ['skills', 'technologies', 'companies', 'institutions', 'roles', 'projects', 'interests', 'certifications', 'links']

    categories.forEach(category => {
      if (extracted[category] && Array.isArray(extracted[category])) {
        extracted[category].forEach(item => {
          keywords.push({
            keyword: item.toLowerCase().trim(),
            category: category,
            weight: source === 'resume' ? 1.0 : source === 'linkedin' ? 0.9 : 0.7,
            source: source
          })
        })
      }
    })

    return keywords
  } catch (error) {
    console.error('Error extracting keywords with Gemini:', error)
    throw new Error('Failed to extract keywords: ' + error.message)
  }
}

export async function extractKeywordsFromMultipleSources(sources) {
  const allKeywords = []
  const keywordMap = new Map()

  for (const { text, source } of sources) {
    if (!text || text.trim().length === 0) continue

    const keywords = await extractKeywords(text, source)
    allKeywords.push(...keywords)
  }

  // Merge keywords and combine weights
  allKeywords.forEach(({ keyword, weight, source, category }) => {
    if (keywordMap.has(keyword)) {
      const existing = keywordMap.get(keyword)
      existing.weight = Math.max(existing.weight, weight)
      if (!existing.sources.includes(source)) {
        existing.sources.push(source)
      }
      // Keep the most specific category
      if (!existing.category) {
        existing.category = category
      }
    } else {
      keywordMap.set(keyword, {
        keyword,
        category,
        weight,
        sources: [source]
      })
    }
  })

  return Array.from(keywordMap.values())
}

export async function extractCompleteProfile(text, source = 'resume') {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `Extract profile and keywords from this resume as JSON.

Required format:
{
  "profile": {
    "full_name": "", "bio": "", "company": "", "job_title": "", "location": "",
    "phone_number": "", "linkedin_url": "", "github_url": "", "website": "", "twitter_url": "",
    "work_history": [{"company":"","job_title":"","duration":"","description":""}]
  },
  "keywords": {
    "skills": [], "technologies": [], "companies": [], "institutions": [],
    "roles": [], "projects": [], "interests": [], "certifications": [], "links": []
  }
}

Rules:
- Extract only explicitly mentioned info
- Bio: 2-3 sentences about experience/expertise
- Work history: All jobs, newest first
- Add https:// to URLs if missing
- Proper case for profile, lowercase for keywords
- Empty string "" or [] if not found

Resume text:
${text}

Return JSON only, no markdown.`

  try {
    const result = await retryWithBackoff(() => model.generateContent(prompt))
    const response = result.response.text()

    // Clean up the response
    let cleanedResponse = response.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '')
    }

    const extracted = JSON.parse(cleanedResponse)

    // Convert keywords to the format expected by the app
    const keywords = []
    const categories = ['skills', 'technologies', 'companies', 'institutions', 'roles', 'projects', 'interests', 'certifications', 'links']

    categories.forEach(category => {
      if (extracted.keywords[category] && Array.isArray(extracted.keywords[category])) {
        extracted.keywords[category].forEach(item => {
          keywords.push({
            keyword: item.toLowerCase().trim(),
            category: category,
            weight: source === 'resume' ? 1.0 : source === 'linkedin' ? 0.9 : 0.7,
            source: source
          })
        })
      }
    })

    return {
      profile: extracted.profile || {},
      keywords: keywords
    }
  } catch (error) {
    console.error('Error extracting complete profile with Gemini:', error)
    throw new Error('Failed to extract profile: ' + error.message)
  }
}
