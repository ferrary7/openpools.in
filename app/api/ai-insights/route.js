import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const CACHE_VERSION = 'v6' // Increment when prompts change

// Disable caching for this endpoint - always fetch fresh data from database
export const dynamic = 'force-dynamic'

// GET endpoint - fetch stored insights from database
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Fetch insights from database
    const { data: insights, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !insights) {
      return NextResponse.json({
        exists: false,
        message: 'No insights found - will generate on demand'
      }, { status: 404 })
    }

    // Return stored insights
    return NextResponse.json({
      exists: true,
      careerFit: insights.career_fit,
      johariWindow: insights.johari_window,
      skillGap: insights.skill_gap,
      smartCombinations: insights.smart_combinations,
      generatedAt: insights.generated_at,
      cacheVersion: insights.cache_version
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    })

  } catch (error) {
    console.error('Error fetching AI insights:', error)
    return NextResponse.json({
      error: 'Failed to fetch insights',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { userId, skills, recentJournals, signalClassification, complementarySkills } = await request.json()

    if (!userId || !skills || skills.length === 0) {
      return NextResponse.json({ error: 'userId and skills required' }, { status: 400 })
    }

    // Generate hash of skills to detect changes
    const skillsHash = Buffer.from(skills.slice(0, 15).sort().join(',')).toString('base64')

    // Check database for existing insights
    const { data: existingInsights } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('cache_version', CACHE_VERSION)
      .eq('skills_hash', skillsHash)
      .single()

    // If fresh insights exist, return them
    if (existingInsights) {
      return NextResponse.json({
        careerFit: existingInsights.career_fit,
        johariWindow: existingInsights.johari_window,
        skillGap: existingInsights.skill_gap,
        smartCombinations: existingInsights.smart_combinations,
        generatedAt: existingInsights.generated_at,
        cached: true
      })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Prepare context data
    // Extract skill names from objects (keywords might be {keyword: "Python", weight: 0.8} or just strings)
    const skillsList = skills
      .slice(0, 15)
      .map(skill => {
        if (typeof skill === 'string') return skill
        if (typeof skill === 'object' && skill) {
          return skill.keyword || skill.skill || skill.name || String(skill)
        }
        return String(skill)
      })
      .join(', ')
    
    const journalContext = recentJournals?.slice(0, 3).map(j => j.content || '').join('\n') || 'No recent journals'
    const coreSkills = signalClassification?.core?.slice(0, 5).join(', ') || 'None'
    const recentSkills = signalClassification?.recent?.slice(0, 5).join(', ') || 'None'
    const hiddenSkills = signalClassification?.hidden?.slice(0, 5).join(', ') || 'None'
    const topComplementary = complementarySkills?.slice(0, 5).map(s => s.skill).join(', ') || ''
    
    // If no complementary skills provided, generate them as potential learning areas
    const complementaryForPrompt = topComplementary || `Suggest 4-5 skills that would complement these skills: ${skillsList}`

    // Run all 4 AI prompts in parallel for efficiency
    const [careerFit, johariWindow, skillGap, smartCombos] = await Promise.all([
      // 1. Career Fit Analysis
      model.generateContent(`Based on these skills: ${skillsList}

Analyze and return ONLY a JSON array of exactly 5 job roles that best fit these skills. Format:
[
  {"role": "Job Title", "match": 85, "reason": "One concise sentence why"},
  ...
]

Return ONLY valid JSON, no markdown, no explanation.`),

      // 2. Johari Window - Return SKILL LISTS, not sentences
      model.generateContent(`Create Johari Window using user's skills: ${skillsList}

IMPORTANT: Distribute these skills into 4 quadrants:

OPEN QUADRANT (Known strengths - visible to self and others):
- Pick the top 4-5 CORE/FUNDAMENTAL technical skills from the user's skill list
- These should be the most important/foundational skills

BLIND QUADRANT (Hidden strengths - what others see but user may not realize):
- Infer 2-3 HIGH-LEVEL META-SKILLS based on the technical skills above
- Examples: "Problem Solving", "System Design", "Technical Architecture", "Analytical Thinking", "Learning Agility"
- DO NOT repeat technical skills, only meta-skills

HIDDEN QUADRANT (Underutilized - skills user has but doesn't showcase):
- Pick 3-4 LESS COMMON or SPECIALIZED skills from the user's list that might be overlooked
- Skills that are valuable but perhaps not highlighted enough

UNKNOWN QUADRANT (Potential - skills to explore):
- ${topComplementary ? `Pick 3-4 skills from this list: ${topComplementary}` : `Suggest 3-4 NEW skills that would complement the user's expertise and create powerful synergies. Think about adjacent technologies, related domains, or skills that unlock career growth opportunities.`}
- These are skills the user doesn't have but should consider learning

Return ONLY valid JSON with ARRAYS of skills:
{
  "open": ["skill1", "skill2", "skill3", "skill4"],
  "blind": ["Meta-Skill 1", "Meta-Skill 2", "Meta-Skill 3"],
  "hidden": ["specialized-skill1", "specialized-skill2", "specialized-skill3"],
  "unknown": ["new-skill1", "new-skill2", "new-skill3"]
}

NO markdown, NO explanations, ONLY the JSON object.`),

      // 3. Skill Gap Roadmap
      model.generateContent(`User's current skills: ${skillsList}
Complementary skills to learn: ${topComplementary}

Create a skill progression roadmap. Return ONLY a JSON object with 3 target roles and their gaps. Format:
{
  "targetRoles": [
    {
      "role": "Target Job Title",
      "currentMatch": 65,
      "missingSkills": ["skill1", "skill2", "skill3"],
      "priority": "Learn X first because Y"
    },
    ...
  ]
}

Return ONLY valid JSON, no markdown.`),

      // 4. Smart Combinations
      model.generateContent(`Current skills: ${skillsList}

Identify powerful skill combinations. Return ONLY a JSON object. Format:
{
  "powerCombos": [
    {"combo": "Skill A + Skill B", "impact": "Why this is powerful in one sentence"},
    {"combo": "Skill C + Skill D", "impact": "Why this is powerful in one sentence"}
  ],
  "missingLinks": [
    {"skill": "Missing Skill", "unlock": "What it would enable in one sentence"},
    {"skill": "Missing Skill", "unlock": "What it would enable in one sentence"}
  ]
}

Return ONLY valid JSON, no markdown.`),
    ])

    // Parse responses
    const parseJSON = (response) => {
      try {
        console.log('🔍 Response type:', typeof response)
        console.log('🔍 Response keys:', Object.keys(response))
        const text = response.response.text()
        console.log('✅ Extracted text length:', text.length)
        // Remove markdown code blocks if present
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        console.log('📄 Cleaned text:', cleaned.substring(0, 100) + '...')
        return JSON.parse(cleaned)
      } catch (error) {
        console.error('❌ JSON parse error:', error)
        console.error('❌ Error details:', error.message)
        return null
      }
    }

    const careerFitData = parseJSON(careerFit)
    const johariData = parseJSON(johariWindow)
    const skillGapData = parseJSON(skillGap)
    const smartCombosData = parseJSON(smartCombos)

    const insights = {
      careerFit: careerFitData || [],
      johariWindow: johariData || {
        open: "Unable to analyze",
        blind: "Unable to analyze",
        hidden: "Unable to analyze",
        unknown: "Unable to analyze"
      },
      skillGap: skillGapData || { targetRoles: [] },
      smartCombinations: smartCombosData || { powerCombos: [], missingLinks: [] },
      generatedAt: new Date().toISOString()
    }

    // Store insights in database (upsert: insert or update)
    const { error: dbError } = await supabase
      .from('ai_insights')
      .upsert({
        user_id: userId,
        career_fit: insights.careerFit,
        johari_window: insights.johariWindow,
        skill_gap: insights.skillGap,
        smart_combinations: insights.smartCombinations,
        skills_hash: skillsHash,
        cache_version: CACHE_VERSION,
        generated_at: insights.generatedAt
      }, {
        onConflict: 'user_id'
      })

    if (dbError) {
      console.error('Error storing insights in database:', dbError)
      // Continue anyway - return insights even if storage fails
    } else {
      console.log(`Stored fresh insights for user ${userId}`)
    }

    // Return all insights
    return NextResponse.json(insights)

  } catch (error) {
    console.error('Error generating AI insights:', error)
    return NextResponse.json({
      error: 'Failed to generate insights',
      details: error.message
    }, { status: 500 })
  }
}
