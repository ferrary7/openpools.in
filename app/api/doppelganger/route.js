import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getActiveEvent, getUserTeam } from '@/lib/doppelganger'

/**
 * GET /api/doppelganger
 * Get active event and user's team (public endpoint)
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Use service client to fetch event (public access)
    const event = await getActiveEvent(serviceClient)
    let userTeam = null

    // Only fetch user's team if logged in
    if (event && user) {
      userTeam = await getUserTeam(supabase, user.id, event.id)
    }

    return NextResponse.json({ event, userTeam })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
