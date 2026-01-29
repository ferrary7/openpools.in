import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getOrganizationBySlug } from '@/lib/organizations'
import { requireOrgPermission, PERMISSIONS } from '@/lib/org-permissions'

/**
 * GET /api/org/[slug]/search/[searchId]
 * Get a specific search by ID
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug, searchId } = await params

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
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.RUN_SEARCH)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    const serviceClient = createServiceClient()

    const { data: search, error } = await serviceClient
      .from('org_searches')
      .select(`
        *,
        creator:created_by (
          full_name,
          email
        )
      `)
      .eq('id', searchId)
      .eq('organization_id', org.id)
      .single()

    if (error || !search) {
      return NextResponse.json({ error: 'Search not found' }, { status: 404 })
    }

    return NextResponse.json({ search })
  } catch (error) {
    console.error('Error fetching search:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PATCH /api/org/[slug]/search/[searchId]
 * Update a search (save/unsave, rename)
 */
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug, searchId } = await params

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
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.RUN_SEARCH)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    const body = await request.json()
    const { is_saved, name } = body

    const serviceClient = createServiceClient()

    const updateData = {}
    if (is_saved !== undefined) updateData.is_saved = is_saved
    if (name !== undefined) updateData.name = name

    const { data: search, error } = await serviceClient
      .from('org_searches')
      .update(updateData)
      .eq('id', searchId)
      .eq('organization_id', org.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating search:', error)
      return NextResponse.json({ error: 'Failed to update search' }, { status: 500 })
    }

    return NextResponse.json({ search })
  } catch (error) {
    console.error('Error updating search:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/org/[slug]/search/[searchId]
 * Delete a search from history
 */
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug, searchId } = await params

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
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.RUN_SEARCH)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    const serviceClient = createServiceClient()

    const { error } = await serviceClient
      .from('org_searches')
      .delete()
      .eq('id', searchId)
      .eq('organization_id', org.id)

    if (error) {
      console.error('Error deleting search:', error)
      return NextResponse.json({ error: 'Failed to delete search' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting search:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
