import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function extractKeywords(text, source = 'resume') {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `You are an expert keyword extractor for professional profiles. Extract ONLY meaningful keywords from the following text.

RULES:
1. Extract ONLY meaningful entities: skills, tools, activities, domains, or unique interests
2. DO NOT include emotions, filler words, or generic phrases
3. Each keyword should be a concrete, professional term
4. Return multi-word phrases when they represent a single concept (e.g., "machine learning", "product design")
5. Be consistent and precise

EXAMPLES:
Input: "I love playing tennis"
Output: ["tennis"]

Input: "I love coding and eating"
Output: ["coding", "eating"]

Input: "My name is Aryan and I am passionate about building scalable systems, Docker, CI pipelines and learning Go"
Output: ["scalable systems", "docker", "ci pipelines", "go"]

Input: "Worked at Microsoft as a frontend engineer. React, Next.js, user experience, async JS, API integrations, product design"
Output: ["frontend engineering", "react", "next.js", "user experience", "async javascript", "api integrations", "product design"]

Now extract keywords from this text:

${text}

Return ONLY a JSON array of keyword strings. No explanation, no markdown, just the array.`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = response.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '')
    }

    const keywords = JSON.parse(cleanedResponse)

    // Return keywords with metadata
    return keywords.map(keyword => ({
      keyword: keyword.toLowerCase().trim(),
      weight: source === 'resume' ? 1.0 : source === 'linkedin' ? 0.9 : 0.7,
      source: source
    }))
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
  allKeywords.forEach(({ keyword, weight, source }) => {
    if (keywordMap.has(keyword)) {
      const existing = keywordMap.get(keyword)
      existing.weight = Math.max(existing.weight, weight)
      if (!existing.sources.includes(source)) {
        existing.sources.push(source)
      }
    } else {
      keywordMap.set(keyword, {
        keyword,
        weight,
        sources: [source]
      })
    }
  })

  return Array.from(keywordMap.values())
}
