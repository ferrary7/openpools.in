import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { resolveTeamId, isTeamMember } from '@/lib/doppelganger'

/**
 * GET /api/doppelganger/teams/[teamId]/logs
 * Get team progress logs
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

    const { data: logs, error } = await supabase
      .from('dg_progress_logs')
      .select('*, submitter:submitted_by (id, full_name, username)')
      .eq('team_id', teamId)
      .order('checkpoint_number')

    if (error) throw error

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/doppelganger/teams/[teamId]/logs
 * Submit a progress log
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

    const { checkpoint_number, title, content } = await request.json()

    if (!checkpoint_number || checkpoint_number < 1 || checkpoint_number > 5) {
      return NextResponse.json({ error: 'Invalid checkpoint number (1-5)' }, { status: 400 })
    }

    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 })
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json({ error: 'Content must be at least 10 characters' }, { status: 400 })
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

    // Check if sprint is active (use admin-controlled status as source of truth)
    const eventStatus = team.event.status

    if (eventStatus !== 'active') {
      if (eventStatus === 'registration' || eventStatus === 'draft') {
        return NextResponse.json({ error: 'Sprint has not started' }, { status: 400 })
      }
      if (eventStatus === 'judging' || eventStatus === 'completed') {
        return NextResponse.json({ error: 'Sprint has ended' }, { status: 400 })
      }
    }

    // Logs submitted after sprint_end are marked as late (for display purposes)
    const now = new Date()
    const sprintEnd = new Date(team.event.sprint_end)
    const isLate = now > sprintEnd

    // Check if checkpoint already submitted
    const { data: existingLog } = await supabase
      .from('dg_progress_logs')
      .select('id')
      .eq('team_id', teamId)
      .eq('checkpoint_number', checkpoint_number)
      .single()

    if (existingLog) {
      return NextResponse.json({ error: 'Checkpoint already submitted' }, { status: 400 })
    }

    // Create log
    const { data: log, error } = await supabase
      .from('dg_progress_logs')
      .insert({
        team_id: teamId,
        checkpoint_number,
        title: title.trim(),
        content: content.trim(),
        submitted_by: user.id,
        is_late: isLate
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ log }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
