import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calculateConsistencyScore, resolveTeamId, isTeamMember } from '@/lib/doppelganger'

/**
 * GET /api/doppelganger/teams/[teamId]/submission
 * Get team submission
 */
export async function GET(request, { params }) {
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

    // Check if user is a team member
    const isMember = await isTeamMember(supabase, teamId, user.id)
    if (!isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data: submission, error } = await supabase
      .from('dg_submissions')
      .select('*')
      .eq('team_id', teamId)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/doppelganger/teams/[teamId]/submission
 * Create submission
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

    const {
      prototype_url,
      prototype_description,
      social_links,
      // Legacy fields for backward compatibility
      social_post_url,
      social_platform
    } = await request.json()

    if (!prototype_url) {
      return NextResponse.json({ error: 'Prototype URL required' }, { status: 400 })
    }

    // Verify user is on team
    const { data: team } = await supabase
      .from('dg_teams')
      .select('*, event:event_id (*), members:dg_team_members(user_id)')
      .eq('id', teamId)
      .single()

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    const isTeamMember = team.created_by === user.id ||
      team.doppelganger_id === user.id ||
      team.members.some(m => m.user_id === user.id)

    if (!isTeamMember) {
      return NextResponse.json({ error: 'Not a team member' }, { status: 403 })
    }

    // Check if submissions are allowed (use admin-controlled status as source of truth)
    const eventStatus = team.event.status

    if (eventStatus === 'judging' || eventStatus === 'completed') {
      return NextResponse.json({ error: 'Submissions are closed' }, { status: 400 })
    }

    if (eventStatus !== 'active') {
      return NextResponse.json({ error: 'Sprint is not active' }, { status: 400 })
    }

    // Check if already submitted
    const { data: existing } = await supabase
      .from('dg_submissions')
      .select('id')
      .eq('team_id', teamId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already submitted. Use PATCH to update.' }, { status: 400 })
    }

    // Create submission
    const { data: submission, error } = await supabase
      .from('dg_submissions')
      .insert({
        team_id: teamId,
        prototype_url,
        prototype_description: prototype_description || null,
        // Support new multiple links format
        social_links: social_links || null,
        // Keep legacy fields for backward compatibility
        social_post_url: social_links?.[0]?.url || social_post_url || null,
        social_platform: social_links?.[0]?.platform || social_platform || null
      })
      .select()
      .single()

    if (error) throw error

    // Calculate and save consistency score
    const { count: logCount } = await supabase
      .from('dg_progress_logs')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)

    const consistencyScore = calculateConsistencyScore(logCount, team.event.required_logs)

    // Create/update score record
    await supabase
      .from('dg_scores')
      .upsert({
        team_id: teamId,
        consistency_score: consistencyScore
      }, { onConflict: 'team_id' })

    return NextResponse.json({ submission }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PATCH /api/doppelganger/teams/[teamId]/submission
 * Submissions cannot be updated once submitted
 */
export async function PATCH() {
  return NextResponse.json(
    { error: 'Submissions cannot be modified once submitted' },
    { status: 400 }
  )
}
