/**
 * Doppelganger Event - Minimal Helper Functions
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { normalizeKeyword } from './keywords'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/**
 * Generate invite token
 */
export function generateInviteToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

/**
 * Get active event (includes judging and completed phases for viewing)
 */
export async function getActiveEvent(supabase) {
  const { data, error } = await supabase
    .from('dg_events')
    .select('*')
    .in('status', ['registration', 'active', 'judging', 'completed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching active event:', error)
    return null
  }
  return data
}

/**
 * Get user's team for an event
 */
export async function getUserTeam(supabase, userId, eventId) {
  // Check if user is a team creator
  const { data: createdTeam } = await supabase
    .from('dg_teams')
    .select('*')
    .eq('created_by', userId)
    .eq('event_id', eventId)
    .single()

  if (createdTeam) return createdTeam

  // Check if user is a team member
  const { data: membership } = await supabase
    .from('dg_team_members')
    .select('team:team_id (*)')
    .eq('user_id', userId)
    .eq('invite_status', 'accepted')
    .single()

  if (membership?.team?.event_id === eventId) {
    return membership.team
  }

  return null
}

/**
 * Check if string is a valid UUID
 */
export function isUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Resolve team ID from UUID or team name
 */
export async function resolveTeamId(supabase, teamIdOrName) {
  const identifier = decodeURIComponent(teamIdOrName)

  if (isUUID(identifier)) {
    return identifier
  }

  // Look up by name
  const { data: team } = await supabase
    .from('dg_teams')
    .select('id')
    .ilike('name', identifier)
    .single()

  return team?.id || null
}

/**
 * Check if user is a member of the team
 * Returns true if user is captain, accepted member, or doppelganger
 */
export async function isTeamMember(supabase, teamId, userId) {
  // Check if user is team creator (captain)
  const { data: team } = await supabase
    .from('dg_teams')
    .select('created_by, doppelganger_id')
    .eq('id', teamId)
    .single()

  if (!team) return false

  // User is captain
  if (team.created_by === userId) return true

  // User is doppelganger
  if (team.doppelganger_id === userId) return true

  // Check if user is an accepted member
  const { data: member } = await supabase
    .from('dg_team_members')
    .select('id')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .eq('invite_status', 'accepted')
    .single()

  return !!member
}

/**
 * Get team with all details - accepts UUID or team name
 */
export async function getTeamWithDetails(supabase, teamIdOrName) {
  // Decode URL-encoded name
  const identifier = decodeURIComponent(teamIdOrName)

  // Build query based on whether it's a UUID or name
  let query = supabase
    .from('dg_teams')
    .select(`
      *,
      event:event_id (*),
      creator:created_by (id, full_name, username, email, profile_picture_url),
      doppelganger:doppelganger_id (id, full_name, username, email, profile_picture_url)
    `)

  if (isUUID(identifier)) {
    query = query.eq('id', identifier)
  } else {
    query = query.ilike('name', identifier)
  }

  const { data: team, error } = await query.single()

  if (error || !team) return null

  const teamId = team.id

  // Get members
  const { data: members } = await supabase
    .from('dg_team_members')
    .select('*, user:user_id (id, full_name, username, email, profile_picture_url)')
    .eq('team_id', teamId)

  // Get logs
  const { data: logs } = await supabase
    .from('dg_progress_logs')
    .select('*')
    .eq('team_id', teamId)
    .order('checkpoint_number')

  // Get submission
  const { data: submission } = await supabase
    .from('dg_submissions')
    .select('*')
    .eq('team_id', teamId)
    .single()

  return {
    ...team,
    members: members || [],
    logs: logs || [],
    submission: submission || null
  }
}

/**
 * Combine team keywords - prioritizes unique domain skills over common tech skills
 */
export function combineTeamKeywords(membersKeywords) {
  const keywordMap = new Map()
  const memberCount = membersKeywords.length

  // First pass: collect all keywords with occurrence count
  membersKeywords.flat().forEach(kw => {
    if (!kw?.keyword) return
    const key = normalizeKeyword(kw.keyword)
    if (keywordMap.has(key)) {
      const existing = keywordMap.get(key)
      existing.occurrences++
      existing.weight = Math.max(existing.weight, kw.weight)
    } else {
      keywordMap.set(key, {
        keyword: key,
        weight: kw.weight || 0.5,
        category: kw.category,
        occurrences: 1
      })
    }
  })

  // Soft skills to strip entirely — these are not real technical/domain skills
  const softSkillsFilter = new Set([
    'communication', 'teamwork', 'team player', 'leadership', 'problem solving',
    'problem-solving', 'time management', 'adaptability', 'creativity', 'collaboration',
    'interpersonal', 'interpersonal skills', 'public speaking', 'work ethic', 'multitasking',
    'organizational', 'organizational skills', 'negotiation', 'conflict resolution',
    'empathy', 'active listening', 'decision making', 'initiative', 'motivation',
    'flexibility', 'stress management', 'networking', 'patience', 'positive attitude',
    'attention to detail', 'self-motivated', 'self motivated', 'fast learner',
    'quick learner', 'hardworking', 'dedicated', 'passionate', 'detail oriented',
    'team management', 'people skills', 'verbal communication', 'written communication',
    'presentation skills', 'critical thinking', 'analytical thinking', 'creative thinking',
    'innovative', 'proactive', 'organized', 'responsible', 'reliable', 'punctual'
  ])

  // Common broad tech skills that are universal — not distinguishing
  const broadTechSkills = new Set(['python', 'javascript', 'sql', 'api', 'data', 'analysis', 'excel', 'git', 'html', 'css', 'react', 'node', 'java', 'c++', 'typescript', 'linux'])

  const keywords = Array.from(keywordMap.values())
    .filter(kw => !softSkillsFilter.has(kw.keyword.toLowerCase()))
    .map(kw => {
      const isGeneric = broadTechSkills.has(kw.keyword.toLowerCase())
      const isUnique = kw.occurrences === 1

      // Boost unique domain-specific skills
      if (isUnique && !isGeneric) {
        kw.weight = Math.min(1.0, kw.weight + 0.2)
        kw.isUnique = true
      }
      // Slightly reduce weight of generic skills that everyone has
      if (isGeneric && kw.occurrences === memberCount) {
        kw.weight = Math.max(0.3, kw.weight - 0.1)
      }

      return kw
    })

  // Sort by weight, but ensure some unique skills appear in top results
  return keywords.sort((a, b) => {
    // Prioritize unique domain skills
    if (a.isUnique && !b.isUnique) return -1
    if (!a.isUnique && b.isUnique) return 1
    return b.weight - a.weight
  })
}

/**
 * Generate problem statement with Gemini
 */
export async function generateProblemStatement(combinedKeywords) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  // Separate unique domain skills from common skills
  const uniqueSkills = combinedKeywords.filter(kw => kw.isUnique).slice(0, 10).map(kw => kw.keyword)
  const otherSkills = combinedKeywords.filter(kw => !kw.isUnique).slice(0, 15).map(kw => kw.keyword)

  const prompt = `You are generating a 30-hour sprint challenge for Doppelganger Sprint — a competition where teams are matched by skill compatibility. The challenge must be ambitious, specific, and non-trivial.

Team's UNIQUE specialized skills (build the problem around these):
${uniqueSkills.length > 0 ? uniqueSkills.join(', ') : 'mixed general skills'}

Other skills in the team:
${otherSkills.join(', ')}

STEP 1 — Classify the team type from their skills:
- DEVELOPER: keywords include react, node, backend, API, python, django, postgres, firebase, swift, flutter, etc.
- DESIGNER: keywords include figma, ui/ux, wireframe, prototype, adobe, illustration, branding, motion, typography, etc.
- STRATEGIST: keywords include marketing, growth, GTM, analytics, pitch, business development, product strategy, market research, etc.
- MIXED: has strong signals from 2+ categories — identify the dominant track

STEP 2 — Pick the deliverable format based on team type:
- DEVELOPER → working deployed product (app, API, CLI tool, browser extension, etc.)
- DESIGNER → high-fidelity interactive prototype with full user flow (Figma or equivalent)
- STRATEGIST → pitch-ready strategy deck + market analysis document
- MIXED → deliverable that covers the dominant track; secondary track supports it

STEP 3 — Generate a SPECIFIC, NON-TRIVIAL 30-hour challenge:
- The problem must be grounded in the team's actual skill domain — not a generic topic
- It should require genuine expertise to solve well, not just basic execution
- A developer team should NOT get a to-do app. A designer team should NOT get a simple wireframe.
- The challenge must be hard enough that only a skilled team could do it justice in 30 hours
- Real-world context is mandatory — name the actual industry, user segment, or workflow being addressed

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "5-7 word sharp and specific title — no generic words like 'app' or 'solution'",
  "team_type": "developer | designer | strategist | mixed",
  "problem": "2-3 sentences: a specific real-world pain point that directly maps to the team's domain expertise. Name the industry and affected users.",
  "challenge": "Exactly what to build in 30 hours. Specify the deliverable format clearly. Be precise — not 'build an app' but what kind, for whom, and what core feature makes it non-trivial.",
  "success_criteria": ["4 ambitious but achievable criteria specific to their domain and deliverable"],
  "bonus_challenge": "A hard stretch goal that would only be achievable by a top-performing team"
}

Hard rules:
- NEVER use words like 'beginner', 'simple', 'basic', 'easy' in the challenge
- If no coding skills present → deliverable MUST be non-code (Figma, deck, paper, no-code tool)
- If strong coding skills present → deliverable MUST be a working, deployed or demo-ready product
- The problem must be specific enough that a generic team with no matching skills could NOT solve it
- Do NOT generate the same challenge type for every team — analyze the skills and diverge`

  const result = await model.generateContent(prompt)
  let response = result.response.text().trim()

  // Clean markdown if present
  if (response.startsWith('```')) {
    response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '')
  }

  return {
    ...JSON.parse(response),
    generated_at: new Date().toISOString(),
    keywords_used: combinedKeywords.slice(0, 20).map(kw => kw.keyword)
  }
}

/**
 * Calculate scores
 */
export function calculateConsistencyScore(logsCount, required = 5) {
  return Math.min(100, (logsCount / required) * 100)
}

export function calculateFinalScore(scores) {
  const weights = { synergy: 0.25, consistency: 0.20, technical: 0.35, social: 0.20 }
  let total = 0, weightSum = 0

  if (scores.synergy_score != null) { total += scores.synergy_score * weights.synergy; weightSum += weights.synergy }
  if (scores.consistency_score != null) { total += scores.consistency_score * weights.consistency; weightSum += weights.consistency }
  if (scores.technical_score != null) { total += scores.technical_score * weights.technical; weightSum += weights.technical }
  if (scores.social_score != null) { total += scores.social_score * weights.social; weightSum += weights.social }

  return weightSum > 0 ? Math.round((total / weightSum) * 100) / 100 : 0
}

/**
 * Analyze synergy between prototype and team keywords using Gemini
 */
export async function analyzeSynergy(prototypeDescription, combinedKeywords) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const topKeywords = combinedKeywords.slice(0, 20).map(kw => kw.keyword).join(', ')

  const prompt = `Analyze how well this prototype aligns with the team's combined skills.

Team Keywords: ${topKeywords}

Prototype Description:
${prototypeDescription}

Return ONLY valid JSON (no markdown):
{
  "score": <number 0-100>,
  "alignment": "high" | "medium" | "low",
  "skills_used": ["skill1", "skill2"],
  "skills_missing": ["skill1", "skill2"],
  "feedback": "One sentence summary"
}`

  const result = await model.generateContent(prompt)
  let response = result.response.text().trim()

  if (response.startsWith('```')) {
    response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '')
  }

  return JSON.parse(response)
}

/**
 * Check team verification status
 */
export async function checkTeamVerification(supabase, teamId) {
  const team = await getTeamWithDetails(supabase, teamId)
  if (!team) return { verified: false, reason: 'Team not found' }

  // Check if captain has keywords
  const { data: captainKeywords } = await supabase
    .from('keyword_profiles')
    .select('keywords')
    .eq('user_id', team.created_by)
    .single()

  if (!captainKeywords?.keywords?.length) {
    return { verified: false, reason: 'Team captain has no keywords' }
  }

  // Check accepted members (excluding captain who was already checked)
  const acceptedMembers = team.members.filter(m => m.invite_status === 'accepted' && m.role !== 'captain')
  for (const member of acceptedMembers) {
    const { data: memberKeywords } = await supabase
      .from('keyword_profiles')
      .select('keywords')
      .eq('user_id', member.user_id)
      .single()

    if (!memberKeywords?.keywords?.length) {
      return { verified: false, reason: `Member ${member.user?.full_name || member.email} has no keywords` }
    }
  }

  return { verified: true }
}

/**
 * Get combined keywords for the entire team
 */
export async function getTeamCombinedKeywords(supabase, teamId) {
  const team = await getTeamWithDetails(supabase, teamId)
  if (!team) return []

  const allKeywords = []

  // Get captain's keywords
  const { data: captainKeywords } = await supabase
    .from('keyword_profiles')
    .select('keywords')
    .eq('user_id', team.created_by)
    .single()

  if (captainKeywords?.keywords) {
    allKeywords.push(captainKeywords.keywords)
  }

  // Get accepted members' keywords (exclude captain — already added above)
  for (const member of team.members.filter(m => m.invite_status === 'accepted' && m.user_id !== team.created_by)) {
    const { data: memberKeywords } = await supabase
      .from('keyword_profiles')
      .select('keywords')
      .eq('user_id', member.user_id)
      .single()

    if (memberKeywords?.keywords) {
      allKeywords.push(memberKeywords.keywords)
    }
  }

  return combineTeamKeywords(allKeywords)
}

// ===== Email Templates =====

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send team member invite email
 */
export async function sendTeamInviteEmail(receiverEmail, inviterName, teamName, inviteUrl) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'OpenPools <hi@openpools.in>',
      to: receiverEmail,
      subject: `${inviterName} invited you to join team "${teamName}" on Doppelganger Sprint`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="margin-bottom: 32px; text-align: center;">
                <img src="https://openpools.in/email-logo.jpg" alt="OpenPools" style="max-width: 180px; height: auto;" />
              </div>
              <div style="margin-bottom: 30px;">
                <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 18px; font-weight: 400;">
                  Hi there,
                </h2>
                <p style="color: #1f2937; margin: 0 0 24px 0; font-size: 18px; font-weight: 600;">
                  You've been invited to join the Doppelganger Sprint!
                </p>
                <div style="background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); border-radius: 12px; padding: 24px; margin: 0 0 32px 0;">
                  <p style="color: #ffffff; margin: 0 0 8px 0; font-size: 14px; opacity: 0.9;">
                    TEAM INVITATION
                  </p>
                  <p style="color: #ffffff; margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">
                    ${teamName}
                  </p>
                  <p style="color: #ffffff; margin: 0; font-size: 14px; opacity: 0.9;">
                    Invited by ${inviterName}
                  </p>
                </div>
                <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                  <strong>Doppelganger Sprint</strong> is a 30-hour hackathon where teams find their "signal twin" — a complementary match based on skills — and build something amazing together.
                </p>
                <div style="margin: 0 0 32px 0;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); border-radius: 6px;">
                        <a href="${inviteUrl}" target="_blank" style="display: inline-block; background: transparent; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">Join Team</a>
                      </td>
                    </tr>
                  </table>
                </div>
                <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
                  If you don't have an OpenPools account yet, you'll be able to create one when you accept.
                </p>
              </div>
              <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; margin: 0; font-size: 13px;">
                  © 2025 openpools.in All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    if (error) {
      console.error('Error sending team invite email:', error)
      return { success: false, error }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send team invite email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send team verified notification
 */
export async function sendTeamVerifiedEmail(receiverEmail, receiverName, teamName) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'OpenPools <hi@openpools.in>',
      to: receiverEmail,
      subject: `Team "${teamName}" is verified and ready for the sprint!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="margin-bottom: 32px; text-align: center;">
                <img src="https://openpools.in/email-logo.jpg" alt="OpenPools" style="max-width: 180px; height: auto;" />
              </div>
              <div style="margin-bottom: 30px;">
                <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 18px; font-weight: 400;">
                  Hi ${receiverName || 'there'},
                </h2>
                <p style="color: #1f2937; margin: 0 0 24px 0; font-size: 18px; font-weight: 600;">
                  Your team is verified! 🎉
                </p>
                <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 0 0 32px 0; border-radius: 4px;">
                  <p style="color: #065f46; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                    ✓ Team ${teamName} is ready
                  </p>
                  <p style="color: #047857; margin: 0; font-size: 14px;">
                    All team members have verified profiles with keywords.
                  </p>
                </div>
                <p style="color: #4b5563; margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">
                  <strong>What's next?</strong>
                </p>
                <ul style="color: #4b5563; margin: 0 0 24px 0; padding-left: 20px; font-size: 15px; line-height: 1.8;">
                  <li>Wait for the sprint to start</li>
                  <li>Your AI-generated problem statement will be revealed</li>
                  <li>30 hours to build, document, and submit</li>
                </ul>
                <div style="margin: 0 0 32px 0;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background-color: #1f2937; border-radius: 6px;">
                        <a href="https://openpools.in/doppelganger" target="_blank" style="display: inline-block; background-color: #1f2937; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">View Team Dashboard</a>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; margin: 0; font-size: 13px;">
                  © 2025 openpools.in All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    if (error) {
      console.error('Error sending team verified email:', error)
      return { success: false, error }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send team verified email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send checkpoint reminder email
 */
export async function sendCheckpointReminderEmail(receiverEmail, receiverName, teamName, checkpointNumber, hoursRemaining) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'OpenPools <hi@openpools.in>',
      to: receiverEmail,
      subject: `Checkpoint ${checkpointNumber} reminder - ${hoursRemaining}h remaining`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="margin-bottom: 32px; text-align: center;">
                <img src="https://openpools.in/email-logo.jpg" alt="OpenPools" style="max-width: 180px; height: auto;" />
              </div>
              <div style="margin-bottom: 30px;">
                <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 18px; font-weight: 400;">
                  Hi ${receiverName || 'there'},
                </h2>
                <p style="color: #1f2937; margin: 0 0 24px 0; font-size: 18px; font-weight: 600;">
                  Time for Checkpoint ${checkpointNumber}!
                </p>
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 0 0 32px 0; border-radius: 4px;">
                  <p style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                    ⏰ ${hoursRemaining} hours remaining in the sprint
                  </p>
                  <p style="color: #b45309; margin: 0; font-size: 14px;">
                    Team ${teamName} - Progress Log ${checkpointNumber}/5
                  </p>
                </div>
                <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                  Log your progress to earn consistency points! Share what you've accomplished and what's next.
                </p>
                <div style="margin: 0 0 32px 0;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background-color: #1f2937; border-radius: 6px;">
                        <a href="https://openpools.in/doppelganger" target="_blank" style="display: inline-block; background-color: #1f2937; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">Submit Progress Log</a>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; margin: 0; font-size: 13px;">
                  © 2025 openpools.in All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    if (error) {
      console.error('Error sending checkpoint reminder email:', error)
      return { success: false, error }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send checkpoint reminder email:', error)
    return { success: false, error: error.message }
  }
}
