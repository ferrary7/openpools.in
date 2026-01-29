import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getOrganizationBySlug,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats
} from '@/lib/organizations'
import {
  requireOrgPermission,
  PERMISSIONS,
  checkOrgMembershipBySlug
} from '@/lib/org-permissions'

/**
 * GET /api/org/[slug]
 * Get organization details
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check membership
    const { isMember, role, orgId } = await checkOrgMembershipBySlug(supabase, slug, user.id)
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Get organization details
    const organization = await getOrganizationBySlug(supabase, slug)
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get stats
    const stats = await getOrganizationStats(supabase, orgId)

    return NextResponse.json({
      organization: {
        ...organization,
        userRole: role,
        stats
      }
    })
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PATCH /api/org/[slug]
 * Update organization details
 * Body: { name?, description?, website?, industry?, size?, logo_url?, settings? }
 */
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization and check permission
    const org = await getOrganizationBySlug(supabase, slug)
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    try {
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.MANAGE_SETTINGS)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    const body = await request.json()
    const { organization, error } = await updateOrganization(supabase, org.id, body)

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ organization })
  } catch (error) {
    console.error('Error updating organization:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/org/[slug]
 * Delete organization (soft delete)
 */
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization and check permission (only owner can delete)
    const org = await getOrganizationBySlug(supabase, slug)
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    try {
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.DELETE_ORGANIZATION)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    const { success, error } = await deleteOrganization(supabase, org.id)

    if (!success) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting organization:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
