import { NextResponse } from 'next/server'
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

export async function POST(request) {
  try {
    const { input, intent, searchableData } = await request.json()

    if (!input) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build the database context for Gemini
    const dbContext = searchableData ? `
AVAILABLE DATA IN DATABASE:
- Keywords/Skills: ${searchableData.keywords?.slice(0, 300).join(', ')}
- People Names: ${searchableData.names?.slice(0, 50).join(', ')}
- Companies: ${searchableData.companies?.join(', ')}
- Locations: ${searchableData.locations?.join(', ')}
- Job Titles: ${searchableData.jobTitles?.join(', ')}
` : ''

    const prompt = `Extract search keywords from query, matching against database.

Query: "${input}"
Intent: ${intent || 'general'}

${dbContext}

Extract keywords that match database data or are specific search terms.
- Match skills, locations, companies, job titles, names
- Include partial/synonym matches (ML → machine learning)
- Case-insensitive
- Exclude common verbs, filler words

Return JSON array of lowercase keywords: ["theater", "bangalore", "python"]
Empty [] if none found.

JSON only, no markdown.`

    const result = await retryWithBackoff(() => model.generateContent(prompt))
    const response = result.response.text()

    // Clean up the response
    let cleanedResponse = response.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '')
    }

    const keywords = JSON.parse(cleanedResponse)

    return NextResponse.json({
      success: true,
      keywords: keywords.map(k => k.toLowerCase().trim())
    })
  } catch (error) {
    console.error('Error extracting search keywords:', error)
    return NextResponse.json(
      { error: 'Failed to extract keywords: ' + error.message },
      { status: 500 }
    )
  }
}
