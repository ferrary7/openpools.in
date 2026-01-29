import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getOrganizationBySlug,
  getOrganizationMembers,
  createInvitation
} from '@/lib/organizations'
import {
  requireOrgPermission,
  PERMISSIONS,
  ROLES
} from '@/lib/org-permissions'
import { sendOrgInviteEmail } from '@/lib/email/welcome'

/**
 * GET /api/org/[slug]/members
 * List all members of the organization
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization
    const org = await getOrganizationBySlug(supabase, slug)
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check permission
    try {
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.VIEW_MEMBERS)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    const members = await getOrganizationMembers(supabase, org.id)

    // Also get pending invitations (for admins)
    let pendingInvitations = []
    try {
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.MANAGE_MEMBERS)
      const { data: invitations } = await supabase
        .from('org_invitations')
        .select('id, email, role, invited_at, expires_at')
        .eq('organization_id', org.id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      pendingInvitations = invitations || []
    } catch {
      // User doesn't have permission to see invitations, skip
    }

    return NextResponse.json({ members, pendingInvitations })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/org/[slug]/members
 * Invite a new member to the organization
 * Body: { email, role }
 */
export async function POST(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization
    const org = await getOrganizationBySlug(supabase, slug)
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check permission
    try {
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.INVITE_MEMBERS)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    const body = await request.json()
    const { email, role } = body

    // Validate
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const validRoles = [ROLES.ADMIN, ROLES.RECRUITER, ROLES.VIEWER]
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Role must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Create invitation
    const { invitation, error } = await createInvitation(
      supabase,
      org.id,
      email,
      role,
      user.id
    )

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    // Get inviter's name for the email
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const inviterName = inviterProfile?.full_name || inviterProfile?.email || 'Someone'
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://openpools.in'}/org/join/${invitation.token}`

    // Send invitation email
    const emailResult = await sendOrgInviteEmail(
      email,
      inviterName,
      org.name,
      role,
      inviteUrl
    )

    if (!emailResult.success) {
      console.error('Failed to send invite email:', emailResult.error)
      // Don't fail the request, invitation was still created
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        expiresAt: invitation.expires_at
      },
      inviteUrl,
      emailSent: emailResult.success
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
