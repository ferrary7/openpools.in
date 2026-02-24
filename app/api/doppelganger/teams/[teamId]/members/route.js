import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateInviteToken, sendTeamInviteEmail, resolveTeamId, isTeamMember } from '@/lib/doppelganger'

/**
 * GET /api/doppelganger/teams/[teamId]/members
 * Get team members
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { teamId: teamIdParam } = await params
    const teamId = await resolveTeamId(serviceClient, teamIdParam)

    if (!teamId) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Check if user is a team member
    const isMember = await isTeamMember(serviceClient, teamId, user.id)
    if (!isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Use service client to get all members (bypasses RLS)
    const { data: members, error } = await serviceClient
      .from('dg_team_members')
      .select('*, user:user_id (id, full_name, username, email)')
      .eq('team_id', teamId)

    if (error) throw error

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/doppelganger/teams/[teamId]/members
 * Invite a member to the team
 */
export async function POST(request, { params }) {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { teamId: teamIdParam } = await params
    const teamId = await resolveTeamId(supabase, teamIdParam)

    if (!teamId) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
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
      return NextResponse.json({ error: 'Only team captain can invite' }, { status: 403 })
    }

    if (team.is_locked) {
      return NextResponse.json({ error: 'Team is locked' }, { status: 400 })
    }

    // Check team size
    const { count } = await supabase
      .from('dg_team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .neq('invite_status', 'rejected')

    if (count >= team.event.max_team_size) {
      return NextResponse.json({ error: 'Team is full' }, { status: 400 })
    }

    // Check if email already invited
    const { data: existing } = await serviceClient
      .from('dg_team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already invited' }, { status: 400 })
    }

    // Check if user exists
    const { data: existingUser } = await serviceClient
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', email.toLowerCase())
      .single()

    // Check if existing user already on team
    if (existingUser) {
      const { data: memberExists } = await supabase
        .from('dg_team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', existingUser.id)
        .single()

      if (memberExists) {
        return NextResponse.json({ error: 'User already on team' }, { status: 400 })
      }
    }

    const token = generateInviteToken()

    // Create member invite
    const { data: member, error } = await serviceClient
      .from('dg_team_members')
      .insert({
        team_id: teamId,
        user_id: existingUser?.id || null,
        email: email.toLowerCase(),
        invite_token: token,
        invite_status: 'pending',
        role: 'member'
      })
      .select()
      .single()

    if (error) throw error

    // Get inviter's name
    const { data: inviter } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Create in-app notification for the invited user (if they have an account)
    if (existingUser) {
      await serviceClient
        .from('notifications')
        .insert({
          user_id: existingUser.id,
          type: 'dg_invite',
          title: `Team invite: ${team.name}`,
          message: `${inviter?.full_name || 'Someone'} invited you to join "${team.name}" for ${team.event?.name || 'Doppelganger Sprint'}. Token: ${token}`,
          related_user_id: user.id
        })
    }

    // Send invite email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://openpools.in'}/doppelganger/invite/${token}`
    await sendTeamInviteEmail(
      email,
      inviter?.full_name || 'A teammate',
      team.name,
      inviteUrl
    )

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/doppelganger/teams/[teamId]/members
 * Remove a member from the team
 */
export async function DELETE(request, { params }) {
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

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('member_id')

    if (!memberId) {
      return NextResponse.json({ error: 'member_id required' }, { status: 400 })
    }

    // Verify user is team captain
    const { data: team } = await supabase
      .from('dg_teams')
      .select('created_by, is_locked')
      .eq('id', teamId)
      .single()

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    if (team.created_by !== user.id) {
      return NextResponse.json({ error: 'Only team captain can remove members' }, { status: 403 })
    }

    if (team.is_locked) {
      return NextResponse.json({ error: 'Team is locked' }, { status: 400 })
    }

    // Cannot remove captain
    const { data: member } = await supabase
      .from('dg_team_members')
      .select('role')
      .eq('id', memberId)
      .single()

    if (member?.role === 'captain') {
      return NextResponse.json({ error: 'Cannot remove captain' }, { status: 400 })
    }

    const { error } = await supabase
      .from('dg_team_members')
      .delete()
      .eq('id', memberId)
      .eq('team_id', teamId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
