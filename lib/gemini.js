import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function extractKeywords(text, source = 'resume') {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `You are an expert professional profile analyzer. Extract comprehensive structured data from the following text.

Extract and return a JSON object with these categories:

{
  "skills": ["skill1", "skill2"],
  "technologies": ["tech1", "tech2"],
  "companies": ["company1", "company2"],
  "institutions": ["institution1", "institution2"],
  "roles": ["role1", "role2"],
  "projects": ["project1", "project2"],
  "interests": ["interest1", "interest2"],
  "certifications": ["cert1", "cert2"],
  "links": ["url1", "url2"]
}

EXTRACTION RULES:
- skills: Professional abilities (e.g., "leadership", "data analysis", "public speaking")
- technologies: Tools, languages, frameworks (e.g., "React", "Python", "Docker", "AWS")
- companies: Company names where person worked (e.g., "Google", "Microsoft", "Startup Inc")
- institutions: Schools, universities, bootcamps (e.g., "Stanford", "MIT", "Coursera")
- roles: Job titles or positions (e.g., "Software Engineer", "Product Manager", "CEO")
- projects: Project names or descriptions (e.g., "E-commerce Platform", "Mobile App")
- interests: Professional interests/domains (e.g., "machine learning", "UI/UX", "blockchain")
- certifications: Certificates, degrees (e.g., "AWS Certified", "MBA", "B.S. Computer Science")
- links: URLs found in the text (GitHub, portfolio, LinkedIn, etc.)

IMPORTANT:
- Extract ONLY what is explicitly mentioned
- Use lowercase for consistency
- Keep multi-word phrases together (e.g., "machine learning", "product management")
- NO generic words or filler
- If a category has nothing, return empty array []

Text to analyze:

${text}

Return ONLY the JSON object. No markdown, no explanation.`

  try {
    const result = await model.generateContent(prompt)
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

  const prompt = `You are an expert resume and profile analyzer. Extract comprehensive structured data from the following resume/profile text.

Extract and return a JSON object with the following structure:

{
  "profile": {
    "full_name": "Full name of the person",
    "bio": "A professional 2-3 sentence bio/summary based on their experience and skills",
    "company": "Current/most recent company name",
    "job_title": "Current/most recent job title",
    "location": "City, Country format",
    "phone_number": "Phone number if mentioned",
    "linkedin_url": "LinkedIn profile URL if mentioned",
    "github_url": "GitHub profile URL if mentioned",
    "website": "Personal website URL if mentioned",
    "twitter_url": "Twitter/X profile URL if mentioned",
    "work_history": [
      {
        "company": "Company name",
        "job_title": "Job title/role",
        "duration": "Time period (e.g., 'Jan 2020 - Dec 2022' or '2 years')",
        "description": "Brief description of role and achievements"
      }
    ]
  },
  "keywords": {
    "skills": ["skill1", "skill2"],
    "technologies": ["tech1", "tech2"],
    "companies": ["all companies mentioned"],
    "institutions": ["universities, schools"],
    "roles": ["all job titles mentioned"],
    "projects": ["project names"],
    "interests": ["professional interests"],
    "certifications": ["certifications, degrees"],
    "links": ["all URLs found"]
  }
}

PROFILE EXTRACTION RULES:
- full_name: Extract the person's full name (usually at the top of resume)
- bio: Create a concise professional summary highlighting key experience and expertise
- company: Most recent/current company name only
- job_title: Most recent/current job title only
- location: City, Country format (e.g., "San Francisco, USA" or "Remote")
- phone_number: Extract phone number in any format (e.g., +1-234-567-8900, (123) 456-7890)
- linkedin_url: Look for URLs containing "linkedin.com/in/" or text like "LinkedIn: username" and construct full URL
- github_url: Look for URLs containing "github.com/" or text like "GitHub: username" and construct full URL
- website: Look for personal website URLs (portfolio, blog, domain names)
- twitter_url: Look for URLs containing "twitter.com/" or "x.com/" or text like "Twitter: @username" and construct full URL
- work_history: Extract ALL past work experiences including current role. For each job extract: company name, job title, duration/dates, and brief description of responsibilities/achievements. Order from most recent to oldest.
- For URLs: Extract complete URLs if found. If only username/handle is mentioned, construct the full URL
- If any field cannot be determined, use empty string "" for strings or empty array [] for work_history

KEYWORDS EXTRACTION RULES:
- skills: Professional abilities (e.g., "leadership", "data analysis")
- technologies: Tools, languages, frameworks (e.g., "React", "Python", "AWS")
- companies: ALL company names mentioned (not just current)
- institutions: Schools, universities, bootcamps
- roles: ALL job titles mentioned
- projects: Project names or descriptions
- interests: Professional interests/domains
- certifications: Certificates, degrees
- links: All URLs found in the text

IMPORTANT:
- Be accurate and extract only what is explicitly mentioned
- For bio, be professional and concise
- Use proper capitalization for names and titles in profile section
- Use lowercase for keywords section
- If something is not found, use empty string "" for profile fields or empty array [] for keyword arrays

URL EXTRACTION EXAMPLES:
- "linkedin.com/in/johndoe" → "https://linkedin.com/in/johndoe"
- "LinkedIn: johndoe" → "https://linkedin.com/in/johndoe"
- "github.com/johndoe" → "https://github.com/johndoe"
- "GitHub: @johndoe" → "https://github.com/johndoe"
- "twitter.com/johndoe" → "https://twitter.com/johndoe"
- "Twitter: @johndoe" → "https://twitter.com/johndoe"
- "Email: john@example.com" → ignore (not a profile URL)
- Look in headers, footers, contact sections, and anywhere URLs might appear

Text to analyze:

${text}

Return ONLY the JSON object. No markdown, no explanation.`

  try {
    const result = await model.generateContent(prompt)
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
