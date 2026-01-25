import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

    // Fetch insights from database (by user_id only)
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

    // Return stored insights (no cacheVersion)
    return NextResponse.json({
      exists: true,
      careerFit: insights.career_fit,
      johariWindow: insights.johari_window,
      skillGap: insights.skill_gap,
      smartCombinations: insights.smart_combinations,
      generatedAt: insights.generated_at
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

    // No skillsHash or cache versioning - DB is the only cache

    // Check database for existing insights (by user_id only)
    const { data: existingInsights } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .single()

    // If insights exist, return them
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
    // Categorize skills to give AI a complete picture of the person's profile
    const categorizedSkills = {
      technical: [],      // technologies, tools
      domain: [],         // domains, expertise, methodologies
      soft: [],           // skills (soft skills, competencies)
      experience: [],     // roles, companies
      education: [],      // institutions, certifications
      projects: []        // projects
    }

    skills.forEach(skill => {
      if (typeof skill === 'object' && skill) {
        const keyword = skill.keyword || skill.skill || skill.name || String(skill)
        const category = skill.category || ''

        if (['technologies', 'tools'].includes(category)) {
          categorizedSkills.technical.push(keyword)
        } else if (['domains', 'expertise', 'methodologies'].includes(category)) {
          categorizedSkills.domain.push(keyword)
        } else if (category === 'skills') {
          categorizedSkills.soft.push(keyword)
        } else if (['roles', 'companies'].includes(category)) {
          categorizedSkills.experience.push(keyword)
        } else if (['institutions', 'certifications'].includes(category)) {
          categorizedSkills.education.push(keyword)
        } else if (category === 'projects') {
          categorizedSkills.projects.push(keyword)
        } else {
          // Default to domain
          categorizedSkills.domain.push(keyword)
        }
      } else if (typeof skill === 'string') {
        categorizedSkills.domain.push(skill)
      }
    })

    // Build a rich context string for the AI
    const technicalSkills = categorizedSkills.technical.slice(0, 10).join(', ') || 'None listed'
    const domainExpertise = categorizedSkills.domain.slice(0, 8).join(', ') || 'None listed'
    const softSkills = categorizedSkills.soft.slice(0, 6).join(', ') || 'None listed'
    const experienceContext = categorizedSkills.experience.slice(0, 5).join(', ') || 'None listed'
    const educationContext = categorizedSkills.education.slice(0, 4).join(', ') || 'None listed'
    const projectsContext = categorizedSkills.projects.slice(0, 6).join(', ') || 'None listed'

    // Combined skills list for backward compatibility
    const skillsList = [
      ...categorizedSkills.technical.slice(0, 8),
      ...categorizedSkills.domain.slice(0, 6),
      ...categorizedSkills.soft.slice(0, 4),
      ...categorizedSkills.projects.slice(0, 4)
    ].join(', ')
    
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
      model.generateContent(`Analyze this person's professional profile:

TECHNICAL SKILLS: ${technicalSkills}
DOMAIN EXPERTISE: ${domainExpertise}
SOFT SKILLS: ${softSkills}
WORK EXPERIENCE: ${experienceContext}
EDUCATION: ${educationContext}
PROJECTS: ${projectsContext}

Consider ALL aspects - technical skills, projects, education, experience, and domain expertise.

BE GROUNDED AND REALISTIC:
- Suggest roles that genuinely match their demonstrated abilities
- Don't inflate - if skills are basic, suggest appropriate roles
- Don't underestimate - recognize genuine strengths
- Match percentages should be honest (50-80% is normal, 90%+ is rare)

Return ONLY a JSON array of exactly 5 realistic career fits:
[
  {"role": "Job Title", "match": 70, "reason": "One sentence explaining the fit based on their actual profile"},
  ...
]

Return ONLY valid JSON, no markdown, no explanation.`),

      // 2. Johari Window - Return SKILL LISTS, not sentences
      model.generateContent(`Create a Johari Window based on this person's complete profile:

TECHNICAL SKILLS: ${technicalSkills}
DOMAIN EXPERTISE: ${domainExpertise}
SOFT SKILLS: ${softSkills}
PROJECTS: ${projectsContext}
EDUCATION: ${educationContext}

Consider skills from ALL sources - technical abilities, project work, academic focus, and domain knowledge.

OPEN QUADRANT (Core strengths - evident across multiple areas):
- Pick 4-5 skills that appear prominently across their profile
- Consider both technical skills AND domain expertise

BLIND QUADRANT (Implied meta-skills - abilities shown through their work):
- Infer 2-3 HIGH-LEVEL abilities based on their projects and skills
- Examples: "Problem Solving", "System Design", "Analytical Thinking", "Self-Learning", "Technical Communication"

HIDDEN QUADRANT (Underutilized - valuable but not highlighted):
- Pick 3-4 specialized skills from projects or education that might be overlooked
- Skills that are valuable but perhaps buried in their profile

UNKNOWN QUADRANT (Growth opportunities):
- ${topComplementary ? `Pick 3-4 skills from: ${topComplementary}` : `Suggest 3-4 skills that would complement their technical skills AND domain expertise`}

BE GROUNDED:
- Base assessments on what's actually demonstrated in their profile
- Don't assume expertise from basic exposure to a skill
- Recognize genuine strengths without inflating them

Return ONLY valid JSON:
{
  "open": ["skill1", "skill2", "skill3", "skill4"],
  "blind": ["Meta-Skill 1", "Meta-Skill 2", "Meta-Skill 3"],
  "hidden": ["specialized-skill1", "specialized-skill2", "specialized-skill3"],
  "unknown": ["new-skill1", "new-skill2", "new-skill3"]
}

NO markdown, NO explanations, ONLY the JSON object.`),

      // 3. Skill Gap Roadmap
      model.generateContent(`Create a skill progression roadmap based on this complete profile:

TECHNICAL SKILLS: ${technicalSkills}
DOMAIN EXPERTISE: ${domainExpertise}
PROJECTS: ${projectsContext}
EDUCATION: ${educationContext}
CURRENT EXPERIENCE: ${experienceContext}
Complementary skills to consider: ${topComplementary}

Based on their COMPLETE profile (technical skills + projects + education + domain expertise + experience), suggest 3 aspirational career paths.

Weight all aspects appropriately:
- Strong projects can compensate for limited work experience
- Education/academic focus indicates areas of interest and potential
- Technical skills show capability
- Experience provides context

BE REALISTIC:
- Suggest achievable career paths based on their current level
- Current match percentages should be honest (40-70% is typical for aspirational roles)
- Missing skills should be genuinely learnable progressions, not leaps

Return ONLY a JSON object:
{
  "targetRoles": [
    {
      "role": "Target Career Path",
      "currentMatch": 65,
      "missingSkills": ["skill1", "skill2", "skill3"],
      "priority": "Learn X first because it builds on their strength in Y"
    },
    ...
  ]
}

Return ONLY valid JSON, no markdown.`),

      // 4. Smart Combinations
      model.generateContent(`Analyze skill combinations from this profile:

TECHNICAL SKILLS: ${technicalSkills}
DOMAIN EXPERTISE: ${domainExpertise}
PROJECTS: ${projectsContext}

Identify powerful combinations that exist AND opportunities to unlock more potential.

Consider how:
- Technical skills combine with domain expertise
- Project experience demonstrates applied skills
- Certain skill pairs create unique value

BE GROUNDED:
- Only highlight combinations that are genuinely demonstrated
- Missing links should be realistic next steps, not dramatic transformations
- Focus on practical value, not hype

Return ONLY a JSON object:
{
  "powerCombos": [
    {"combo": "Skill A + Skill B", "impact": "Why this combination creates unique value"},
    {"combo": "Skill C + Skill D", "impact": "Why this combination creates unique value"}
  ],
  "missingLinks": [
    {"skill": "Complementary Skill", "unlock": "What this would enable given their existing profile"},
    {"skill": "Complementary Skill", "unlock": "What this would enable given their existing profile"}
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


    // Sort job fit and skill progression roadmap by match percentage descending
    let careerFitData = parseJSON(careerFit)
    if (Array.isArray(careerFitData)) {
      careerFitData = careerFitData.sort((a, b) => (b.match || 0) - (a.match || 0))
    }
    let skillGapData = parseJSON(skillGap)
    if (skillGapData && Array.isArray(skillGapData.targetRoles)) {
      skillGapData.targetRoles = skillGapData.targetRoles.sort((a, b) => (b.currentMatch || 0) - (a.currentMatch || 0))
    }
    const johariData = parseJSON(johariWindow)
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

    // Store insights in database (upsert: insert or update, no cache fields)
    const { error: dbError } = await supabase
      .from('ai_insights')
      .upsert({
        user_id: userId,
        career_fit: insights.careerFit,
        johari_window: insights.johariWindow,
        skill_gap: insights.skillGap,
        smart_combinations: insights.smartCombinations,
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
