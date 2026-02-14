import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getTeamWithDetails, checkTeamVerification, isTeamMember } from '@/lib/doppelganger'

/**
 * GET /api/doppelganger/teams/[teamId]
 * Get team details
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { teamId } = await params

    // Use service client to get team details (bypasses RLS)
    let team = await getTeamWithDetails(serviceClient, teamId)

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Check if user is a team member
    const isMember = await isTeamMember(serviceClient, team.id, user.id)
    if (!isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check and update verification status if not already verified
    if (!team.is_verified && !team.is_locked) {
      const verification = await checkTeamVerification(serviceClient, team.id)
      if (verification.verified) {
        await serviceClient
          .from('dg_teams')
          .update({ is_verified: true })
          .eq('id', team.id)
        team.is_verified = true
      }
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
