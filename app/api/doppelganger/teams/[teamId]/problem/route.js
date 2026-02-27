import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  getTeamCombinedKeywords,
  generateProblemStatement,
  checkTeamVerification,
  resolveTeamId
} from '@/lib/doppelganger'

/**
 * POST /api/doppelganger/teams/[teamId]/problem
 * Generate problem statement for the team
 */
export async function POST(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { teamId: teamIdParam } = await params
    const teamId = await resolveTeamId(supabase, teamIdParam)

    if (!teamId) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Verify user is team captain
    const { data: team } = await supabase
      .from('dg_teams')
      .select('*, event:event_id (*)')
      .eq('id', teamId)
      .single()

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    if (team.created_by !== user.id) {
      return NextResponse.json({ error: 'Only captain can generate problem' }, { status: 403 })
    }

    // Block generation until sprint is officially started by admin
    if (team.event.status !== 'active') {
      return NextResponse.json({
        error: 'Problem statements can only be generated after the sprint has started'
      }, { status: 403 })
    }

    // Check if team already has a problem
    if (team.problem_statement) {
      return NextResponse.json({ error: 'Problem already generated' }, { status: 400 })
    }

    // Verify team is complete
    const verification = await checkTeamVerification(supabase, teamId)
    if (!verification.verified) {
      return NextResponse.json({
        error: 'Team not verified',
        reason: verification.reason
      }, { status: 400 })
    }

    // Check minimum team size
    const { count: memberCount } = await supabase
      .from('dg_team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .eq('invite_status', 'accepted')

    if (memberCount < (team.event.min_team_size || 2)) {
      return NextResponse.json({
        error: `Team needs at least ${team.event.min_team_size || 2} members`
      }, { status: 400 })
    }

    // Get combined keywords
    const { combined, perMember } = await getTeamCombinedKeywords(supabase, teamId)

    if (combined.length < 5) {
      return NextResponse.json({
        error: 'Not enough keywords to generate problem'
      }, { status: 400 })
    }

    // Generate problem statement
    const problem = await generateProblemStatement(combined, perMember)

    // Save to team
    const { error } = await supabase
      .from('dg_teams')
      .update({
        problem_statement: problem,
        combined_keywords: combined,
        is_locked: true
      })
      .eq('id', teamId)

    if (error) throw error

    return NextResponse.json({ problem })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
