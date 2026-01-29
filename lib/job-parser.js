/**
 * Job Description Parser
 * Functions for parsing job descriptions and extracting requirements
 */

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

      if (!isRateLimitError || attempt === maxRetries - 1) {
        throw error
      }

      const baseDelay = Math.pow(2, attempt) * 1000
      const jitter = Math.random() * 1000
      const delay = baseDelay + jitter

      console.log(`Rate limit hit (attempt ${attempt + 1}/${maxRetries}), retrying in ${Math.round(delay)}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

/**
 * Extract structured data and keywords from a job description
 * @param {string} text - Job description text
 * @returns {Promise<{job: object, keywords: object[]}>}
 */
export async function parseJobDescription(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `Parse this job description and extract structured data and keywords as JSON.

Required format:
{
  "job": {
    "title": "",
    "company": "",
    "location": "",
    "employment_type": "",
    "experience_level": "",
    "salary_range": "",
    "department": "",
    "summary": ""
  },
  "requirements": {
    "must_have": [],
    "nice_to_have": [],
    "education": [],
    "experience_years": ""
  },
  "keywords": {
    "skills": [],
    "technologies": [],
    "tools": [],
    "methodologies": [],
    "domains": [],
    "certifications": [],
    "soft_skills": []
  }
}

Extraction rules:
- job.title: The job title being hired for
- job.company: Company name if mentioned
- job.location: Location or "Remote" if remote
- job.employment_type: Full-time, Part-time, Contract, etc.
- job.experience_level: Entry, Mid, Senior, Lead, etc.
- job.salary_range: If mentioned
- job.department: Engineering, Marketing, Sales, etc.
- job.summary: 1-2 sentence summary of the role

- requirements.must_have: Required skills/qualifications
- requirements.nice_to_have: Preferred/optional qualifications
- requirements.education: Degree requirements
- requirements.experience_years: "3-5 years", "5+ years", etc.

- keywords: Extract ALL technical and professional keywords
  - skills: Core competencies (analysis, communication, leadership, etc.)
  - technologies: Programming languages, frameworks, platforms (Python, React, AWS, etc.)
  - tools: Software applications (Jira, Figma, Slack, etc.)
  - methodologies: Processes (Agile, Scrum, CI/CD, etc.)
  - domains: Industry areas (fintech, healthcare, e-commerce, etc.)
  - certifications: Required or preferred certifications
  - soft_skills: Communication, teamwork, problem-solving, etc.

Rules:
- Use lowercase for all keywords
- Multi-word phrases together
- Be comprehensive - extract ALL relevant keywords
- Empty [] if none found
- Return JSON only, no markdown

Job Description:
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

    // Convert keywords to the standard format
    const keywords = []
    const categories = ['skills', 'technologies', 'tools', 'methodologies', 'domains', 'certifications', 'soft_skills']

    categories.forEach(category => {
      if (extracted.keywords?.[category] && Array.isArray(extracted.keywords[category])) {
        extracted.keywords[category].forEach(item => {
          if (item && item.trim()) {
            keywords.push({
              keyword: item.toLowerCase().trim(),
              category: category,
              weight: 1.0,
              source: 'job_description'
            })
          }
        })
      }
    })

    // Also add must_have requirements as high-weight keywords
    if (extracted.requirements?.must_have && Array.isArray(extracted.requirements.must_have)) {
      extracted.requirements.must_have.forEach(item => {
        if (item && item.trim()) {
          const normalized = item.toLowerCase().trim()
          // Check if not already added
          if (!keywords.find(k => k.keyword === normalized)) {
            keywords.push({
              keyword: normalized,
              category: 'requirements',
              weight: 1.5, // Higher weight for must-have requirements
              source: 'job_description'
            })
          }
        }
      })
    }

    return {
      job: extracted.job || {},
      requirements: extracted.requirements || {},
      keywords: keywords
    }
  } catch (error) {
    console.error('Error parsing job description:', error)
    throw new Error('Failed to parse job description: ' + error.message)
  }
}

/**
 * Extract only keywords from a job description (lighter weight)
 * @param {string} text - Job description text
 * @returns {Promise<object[]>}
 */
export async function extractJobKeywords(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `Extract all relevant keywords from this job description as JSON.

Format:
{
  "skills": [],
  "technologies": [],
  "tools": [],
  "methodologies": [],
  "domains": [],
  "certifications": [],
  "soft_skills": [],
  "requirements": []
}

Extract:
- skills: Core competencies (analysis, writing, communication, etc.)
- technologies: Programming languages, frameworks, platforms (Python, React, AWS, etc.)
- tools: Software applications (Jira, Figma, Salesforce, etc.)
- methodologies: Processes (Agile, Scrum, DevOps, TDD, etc.)
- domains: Industry/professional areas (fintech, healthcare, SaaS, etc.)
- certifications: Required certifications (AWS Certified, PMP, etc.)
- soft_skills: Communication, leadership, teamwork, etc.
- requirements: Must-have qualifications (5+ years experience, Bachelor's degree, etc.)

Rules:
- Use lowercase
- Multi-word phrases together
- Be comprehensive - extract ALL relevant keywords
- Empty [] if none
- Return JSON only

Job Description:
${text}

Return JSON only.`

  try {
    const result = await retryWithBackoff(() => model.generateContent(prompt))
    const response = result.response.text()

    let cleanedResponse = response.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '')
    }

    const extracted = JSON.parse(cleanedResponse)

    // Convert to keyword format
    const keywords = []
    const categories = ['skills', 'technologies', 'tools', 'methodologies', 'domains', 'certifications', 'soft_skills']

    categories.forEach(category => {
      if (extracted[category] && Array.isArray(extracted[category])) {
        extracted[category].forEach(item => {
          if (item && item.trim()) {
            keywords.push({
              keyword: item.toLowerCase().trim(),
              category: category,
              weight: 1.0,
              source: 'job_description'
            })
          }
        })
      }
    })

    // Requirements get higher weight
    if (extracted.requirements && Array.isArray(extracted.requirements)) {
      extracted.requirements.forEach(item => {
        if (item && item.trim()) {
          keywords.push({
            keyword: item.toLowerCase().trim(),
            category: 'requirements',
            weight: 1.5,
            source: 'job_description'
          })
        }
      })
    }

    return keywords
  } catch (error) {
    console.error('Error extracting job keywords:', error)
    throw new Error('Failed to extract keywords: ' + error.message)
  }
}
