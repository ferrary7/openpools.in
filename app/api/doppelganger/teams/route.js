import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getActiveEvent, getUserTeam } from '@/lib/doppelganger'

/**
 * POST /api/doppelganger/teams
 * Create a new team
 */
export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Team name must be at least 2 characters' }, { status: 400 })
    }

    // Get active event
    const event = await getActiveEvent(supabase)
    if (!event) {
      return NextResponse.json({ error: 'No active event' }, { status: 400 })
    }

    // Check registration is open (using admin-controlled status)
    if (event.status !== 'registration') {
      return NextResponse.json({ error: 'Registration is not open' }, { status: 400 })
    }

    // Check if user already has a team
    const existingTeam = await getUserTeam(supabase, user.id, event.id)
    if (existingTeam) {
      return NextResponse.json({ error: 'You already have a team' }, { status: 400 })
    }

    // Check if user has keywords
    const { data: keywordProfile } = await supabase
      .from('keyword_profiles')
      .select('keywords')
      .eq('user_id', user.id)
      .single()

    const isVerified = keywordProfile?.keywords?.length > 0

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('dg_teams')
      .insert({
        event_id: event.id,
        name: name.trim(),
        created_by: user.id
      })
      .select()
      .single()

    if (teamError) {
      if (teamError.code === '23505') {
        return NextResponse.json({ error: 'Team name already exists' }, { status: 400 })
      }
      throw teamError
    }

    // Add creator as captain
    await supabase.from('dg_team_members').insert({
      team_id: team.id,
      user_id: user.id,
      role: 'captain',
      invite_status: 'accepted',
      is_verified: isVerified
    })

    return NextResponse.json({ team }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
