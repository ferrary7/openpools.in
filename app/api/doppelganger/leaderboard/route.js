import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/doppelganger/leaderboard
 * Get event leaderboard (public data, uses service client to bypass RLS)
 */
export async function GET(request) {
  try {
    const serviceClient = createServiceClient()
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('event_id')

    if (!eventId) {
      return NextResponse.json({ error: 'event_id required' }, { status: 400 })
    }

    // Get teams with submissions
    const { data: teams, error } = await serviceClient
      .from('dg_teams')
      .select(`
        id,
        name,
        is_verified,
        problem_statement,
        creator:created_by (id, full_name, username),
        doppelganger:doppelganger_id (id, full_name, username),
        members:dg_team_members (
          id,
          role,
          invite_status,
          user:user_id (id, full_name, username)
        ),
        submission:dg_submissions (
          id,
          prototype_url,
          social_post_url,
          submitted_at
        )
      `)
      .eq('event_id', eventId)
      .not('problem_statement', 'is', null)

    if (error) throw error

    // Get all scores for these teams separately (more reliable than embedded query)
    const teamIds = teams.map(t => t.id)
    const { data: scores } = await serviceClient
      .from('dg_scores')
      .select('*')
      .in('team_id', teamIds)

    // Create a map for quick score lookup
    const scoreMap = {}
    scores?.forEach(s => {
      scoreMap[s.team_id] = s
    })

    // Format leaderboard
    const leaderboard = teams
      .map(team => {
        const score = scoreMap[team.id] || {}
        const submission = team.submission?.[0] || null

        const memberUserIds = [
          team.creator?.id,
          ...(team.members?.filter(m => m.invite_status === 'accepted').map(m => m.user?.id) || []),
          team.doppelganger?.id
        ].filter(Boolean)

        return {
          id: team.id,
          name: team.name,
          captain: team.creator,
          doppelganger: team.doppelganger,
          memberUserIds,
          memberCount: (team.members?.filter(m => m.invite_status === 'accepted').length || 0) + (team.doppelganger ? 1 : 0),
          problemTitle: team.problem_statement?.title,
          hasSubmission: !!submission,
          submittedAt: submission?.submitted_at,
          prototypeUrl: submission?.prototype_url,
          socialUrl: submission?.social_post_url,
          scores: {
            synergy: score.synergy_score,
            consistency: score.consistency_score,
            technical: score.technical_score,
            social: score.social_score,
            final: score.final_score
          }
        }
      })
      .sort((a, b) => (b.scores.final || 0) - (a.scores.final || 0))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
