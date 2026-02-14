import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkTeamVerification } from '@/lib/doppelganger'

/**
 * GET /api/doppelganger/invite/[token]
 * Get invite details
 */
export async function GET(request, { params }) {
  try {
    const serviceClient = createServiceClient()
    const { token } = await params

    const { data: member, error } = await serviceClient
      .from('dg_team_members')
      .select(`
        *,
        team:team_id (
          id,
          name,
          created_by,
          event:event_id (id, name, status),
          creator:created_by (full_name)
        )
      `)
      .eq('invite_token', token)
      .single()

    if (error || !member) {
      return NextResponse.json({ error: 'Invalid invite token' }, { status: 404 })
    }

    if (member.invite_status !== 'pending') {
      return NextResponse.json({ error: 'Invite already used' }, { status: 400 })
    }

    return NextResponse.json({
      invite: {
        id: member.id,
        email: member.email,
        teamName: member.team.name,
        eventName: member.team.event.name,
        inviterName: member.team.creator?.full_name || 'A teammate'
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/doppelganger/invite/[token]
 * Accept invite
 */
export async function POST(request, { params }) {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await params

    // Get invite
    const { data: member, error: fetchError } = await serviceClient
      .from('dg_team_members')
      .select(`
        *,
        team:team_id (id, name, event_id, is_locked)
      `)
      .eq('invite_token', token)
      .single()

    if (fetchError || !member) {
      return NextResponse.json({ error: 'Invalid invite token' }, { status: 404 })
    }

    if (member.invite_status !== 'pending') {
      return NextResponse.json({ error: 'Invite already used' }, { status: 400 })
    }

    if (member.team.is_locked) {
      return NextResponse.json({ error: 'Team is locked' }, { status: 400 })
    }

    // Check if user already on another team for this event
    const { data: existingMember } = await serviceClient
      .from('dg_team_members')
      .select('team:team_id (event_id)')
      .eq('user_id', user.id)
      .eq('invite_status', 'accepted')

    const alreadyOnTeam = existingMember?.some(m =>
      m.team?.event_id === member.team.event_id
    )

    if (alreadyOnTeam) {
      return NextResponse.json({ error: 'Already on a team for this event' }, { status: 400 })
    }

    // Check if user has keywords
    const { data: keywordProfile } = await supabase
      .from('keyword_profiles')
      .select('keywords')
      .eq('user_id', user.id)
      .single()

    const isVerified = keywordProfile?.keywords?.length > 0

    // Accept invite
    const { error: updateError } = await serviceClient
      .from('dg_team_members')
      .update({
        user_id: user.id,
        invite_status: 'accepted',
        invite_token: null,
        is_verified: isVerified
      })
      .eq('id', member.id)

    if (updateError) throw updateError

    // Check and update team verification status
    const verification = await checkTeamVerification(serviceClient, member.team.id)
    if (verification.verified) {
      await serviceClient
        .from('dg_teams')
        .update({ is_verified: true })
        .eq('id', member.team.id)
    }

    return NextResponse.json({
      success: true,
      teamId: member.team.id,
      teamName: member.team.name
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/doppelganger/invite/[token]
 * Reject invite
 */
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await params

    const { error } = await serviceClient
      .from('dg_team_members')
      .update({
        invite_status: 'rejected',
        invite_token: null
      })
      .eq('invite_token', token)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
