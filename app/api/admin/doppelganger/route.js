import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { analyzeSynergy, calculateConsistencyScore, calculateFinalScore } from '@/lib/doppelganger'

/**
 * GET /api/admin/doppelganger
 * Get all doppelganger events and teams
 */
export async function GET(request) {
  try {
    const serviceClient = createServiceClient()
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('event_id')

    // Get all events
    const { data: events } = await serviceClient
      .from('dg_events')
      .select('*')
      .order('created_at', { ascending: false })

    // If no event_id specified, return just events
    if (!eventId) {
      return NextResponse.json({ events })
    }

    // Get all teams for the event
    const { data: teams, error } = await serviceClient
      .from('dg_teams')
      .select(`
        *,
        creator:created_by (id, full_name, email),
        members:dg_team_members (
          id,
          user_id,
          invite_status,
          role,
          user:user_id (id, full_name, email)
        ),
        submission:dg_submissions (*),
        score:dg_scores (*),
        logs:dg_progress_logs (id, checkpoint_number, title, content, submitted_at, is_late)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get the specific event
    const event = events?.find(e => e.id === eventId)

    return NextResponse.json({ events, event, teams })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/admin/doppelganger
 * Score a team
 */
export async function POST(request) {
  try {
    const serviceClient = createServiceClient()
    const { team_id, technical_score, social_score, run_synergy } = await request.json()

    if (!team_id) {
      return NextResponse.json({ error: 'team_id required' }, { status: 400 })
    }

    // Get team data
    const { data: team } = await serviceClient
      .from('dg_teams')
      .select(`
        *,
        submission:dg_submissions (*),
        logs:dg_progress_logs (id)
      `)
      .eq('id', team_id)
      .single()

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Get existing score or create new
    let { data: existingScore } = await serviceClient
      .from('dg_scores')
      .select('*')
      .eq('team_id', team_id)
      .single()

    const scores = {
      team_id,
      consistency_score: calculateConsistencyScore(team.logs?.length || 0, 5),
      technical_score: technical_score ?? existingScore?.technical_score ?? null,
      social_score: social_score ?? existingScore?.social_score ?? null,
      synergy_score: existingScore?.synergy_score ?? null,
      synergy_analysis: existingScore?.synergy_analysis ?? null
    }

    // Run synergy analysis if requested and submission exists
    if (run_synergy && team.submission?.prototype_description && team.combined_keywords) {
      try {
        const analysis = await analyzeSynergy(
          team.submission.prototype_description,
          team.combined_keywords
        )
        scores.synergy_score = analysis.score
        scores.synergy_analysis = analysis
      } catch (e) {
        console.error('Synergy analysis failed:', e)
      }
    }

    // Calculate final score
    scores.final_score = calculateFinalScore(scores)
    scores.scored_at = new Date().toISOString()

    // Upsert score
    const { data: score, error } = await serviceClient
      .from('dg_scores')
      .upsert(scores, { onConflict: 'team_id' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ score })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/admin/doppelganger
 * Create a new event
 */
export async function PUT(request) {
  try {
    const serviceClient = createServiceClient()
    const body = await request.json()

    const { name, description, registration_start, registration_end, sprint_start, sprint_end, submission_deadline } = body

    if (!name || !registration_start || !registration_end || !sprint_start || !sprint_end || !submission_deadline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: event, error } = await serviceClient
      .from('dg_events')
      .insert({
        name,
        description: description || null,
        registration_start,
        registration_end,
        sprint_start,
        sprint_end,
        submission_deadline,
        min_team_size: body.min_team_size || 2,
        max_team_size: body.max_team_size || 4,
        required_logs: body.required_logs || 5,
        status: 'draft'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/doppelganger
 * Update event status
 */
export async function PATCH(request) {
  try {
    const serviceClient = createServiceClient()
    const { event_id, status } = await request.json()

    if (!event_id || !status) {
      return NextResponse.json({ error: 'event_id and status required' }, { status: 400 })
    }

    const validStatuses = ['draft', 'registration', 'active', 'judging', 'completed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data: event, error } = await serviceClient
      .from('dg_events')
      .update({ status })
      .eq('id', event_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/doppelganger
 * Delete an event and all related data (cascade)
 */
export async function DELETE(request) {
  try {
    const serviceClient = createServiceClient()
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('event_id')

    if (!eventId) {
      return NextResponse.json({ error: 'event_id required' }, { status: 400 })
    }

    // Get the event first to confirm it exists
    const { data: event } = await serviceClient
      .from('dg_events')
      .select('id, name, status')
      .eq('id', eventId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get all team IDs for this event first
    const { data: teams } = await serviceClient
      .from('dg_teams')
      .select('id')
      .eq('event_id', eventId)

    const teamIds = teams?.map(t => t.id) || []

    if (teamIds.length > 0) {
      // Delete scores
      await serviceClient
        .from('dg_scores')
        .delete()
        .in('team_id', teamIds)

      // Delete submissions
      await serviceClient
        .from('dg_submissions')
        .delete()
        .in('team_id', teamIds)

      // Delete progress logs
      await serviceClient
        .from('dg_progress_logs')
        .delete()
        .in('team_id', teamIds)

      // Delete team members
      await serviceClient
        .from('dg_team_members')
        .delete()
        .in('team_id', teamIds)

      // Delete teams
      await serviceClient
        .from('dg_teams')
        .delete()
        .eq('event_id', eventId)
    }

    // Finally delete the event
    const { error } = await serviceClient
      .from('dg_events')
      .delete()
      .eq('id', eventId)

    if (error) throw error

    return NextResponse.json({ success: true, deletedEvent: event.name })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
