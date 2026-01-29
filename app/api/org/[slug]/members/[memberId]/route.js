import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getOrganizationBySlug,
  updateMemberRole,
  removeMember
} from '@/lib/organizations'
import {
  requireOrgPermission,
  PERMISSIONS,
  ROLES,
  isRoleHigherOrEqual
} from '@/lib/org-permissions'

/**
 * PATCH /api/org/[slug]/members/[memberId]
 * Update a member's role
 * Body: { role }
 */
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug, memberId } = await params

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
    let currentUserRole
    try {
      const result = await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.MANAGE_MEMBERS)
      currentUserRole = result.role
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    // Get the target member
    const { data: targetMember, error: memberError } = await supabase
      .from('organization_members')
      .select('id, role, user_id')
      .eq('id', memberId)
      .eq('organization_id', org.id)
      .single()

    if (memberError || !targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Cannot modify your own role
    if (targetMember.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot modify your own role' }, { status: 400 })
    }

    // Cannot modify someone with higher or equal role (except owner can do anything)
    if (currentUserRole !== ROLES.OWNER && isRoleHigherOrEqual(targetMember.role, currentUserRole)) {
      return NextResponse.json({ error: 'Cannot modify a member with equal or higher role' }, { status: 403 })
    }

    const body = await request.json()
    const { role: newRole } = body

    // Validate role
    const validRoles = [ROLES.ADMIN, ROLES.RECRUITER, ROLES.VIEWER]
    if (!newRole || !validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: `Role must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Cannot assign owner role
    if (newRole === ROLES.OWNER) {
      return NextResponse.json({ error: 'Cannot assign owner role' }, { status: 400 })
    }

    // Cannot assign a role higher than your own (except owner)
    if (currentUserRole !== ROLES.OWNER && isRoleHigherOrEqual(newRole, currentUserRole)) {
      return NextResponse.json({ error: 'Cannot assign a role equal or higher than your own' }, { status: 403 })
    }

    const { success, error } = await updateMemberRole(supabase, memberId, newRole)

    if (!success) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ success: true, newRole })
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/org/[slug]/members/[memberId]
 * Remove a member from the organization
 */
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug, memberId } = await params

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
    let currentUserRole
    try {
      const result = await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.REMOVE_MEMBERS)
      currentUserRole = result.role
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    // Get the target member
    const { data: targetMember, error: memberError } = await supabase
      .from('organization_members')
      .select('id, role, user_id')
      .eq('id', memberId)
      .eq('organization_id', org.id)
      .single()

    if (memberError || !targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Cannot remove yourself
    if (targetMember.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot remove yourself from the organization' }, { status: 400 })
    }

    // Cannot remove owner
    if (targetMember.role === ROLES.OWNER) {
      return NextResponse.json({ error: 'Cannot remove the organization owner' }, { status: 400 })
    }

    // Cannot remove someone with higher or equal role (except owner can do anything)
    if (currentUserRole !== ROLES.OWNER && isRoleHigherOrEqual(targetMember.role, currentUserRole)) {
      return NextResponse.json({ error: 'Cannot remove a member with equal or higher role' }, { status: 403 })
    }

    const { success, error } = await removeMember(supabase, memberId)

    if (!success) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
