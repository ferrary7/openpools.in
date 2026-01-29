import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getInvitationByToken, acceptInvitation } from '@/lib/organizations'

/**
 * GET /api/org/invite/[token]
 * Get invitation details (public - for viewing invitation before accepting)
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { token } = await params

    const invitation = await getInvitationByToken(supabase, token)

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    // Return only safe details (not the full token)
    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expires_at,
        organization: {
          name: invitation.organizations.name,
          slug: invitation.organizations.slug,
          logo_url: invitation.organizations.logo_url
        },
        invitedBy: invitation.profiles ? {
          name: invitation.profiles.full_name,
          email: invitation.profiles.email
        } : null
      }
    })
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/org/invite/[token]
 * Accept an invitation (requires authentication)
 */
export async function POST(request, { params }) {
  try {
    const supabase = await createClient()
    const { token } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get invitation to verify it matches the user's email (optional strict mode)
    const invitation = await getInvitationByToken(supabase, token)
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    // Optional: Check if invitation email matches user email
    // Uncomment below for strict email matching
    // if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
    //   return NextResponse.json(
    //     { error: 'This invitation was sent to a different email address' },
    //     { status: 403 }
    //   )
    // }

    const { success, organization, error } = await acceptInvitation(supabase, token, user.id)

    if (!success) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      organization: {
        name: organization.name,
        slug: organization.slug
      },
      redirectUrl: `/org/${organization.slug}`
    })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
