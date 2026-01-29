import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrganizationBySlug } from '@/lib/organizations'
import {
  getCandidateById,
  updateCandidate,
  archiveCandidate,
  deleteCandidate
} from '@/lib/org-candidates'
import { requireOrgPermission, PERMISSIONS } from '@/lib/org-permissions'

/**
 * GET /api/org/[slug]/candidates/[id]
 * Get a single candidate by ID
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug, id } = await params

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
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.VIEW_DASHBOARD)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    const candidate = await getCandidateById(supabase, id)

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // Verify candidate belongs to this org
    if (candidate.organization_id !== org.id) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    return NextResponse.json({ candidate })
  } catch (error) {
    console.error('Error fetching candidate:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PATCH /api/org/[slug]/candidates/[id]
 * Update a candidate
 */
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug, id } = await params

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
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.MANAGE_CANDIDATES)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    // Verify candidate belongs to this org
    const existingCandidate = await getCandidateById(supabase, id)
    if (!existingCandidate || existingCandidate.organization_id !== org.id) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const body = await request.json()
    const { candidate, error } = await updateCandidate(supabase, id, body)

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ candidate })
  } catch (error) {
    console.error('Error updating candidate:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/org/[slug]/candidates/[id]
 * Archive or permanently delete a candidate
 * Query param: ?permanent=true for hard delete
 */
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug, id } = await params

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
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.MANAGE_CANDIDATES)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    // Verify candidate belongs to this org
    const existingCandidate = await getCandidateById(supabase, id)
    if (!existingCandidate || existingCandidate.organization_id !== org.id) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const permanent = searchParams.get('permanent') === 'true'

    let result
    if (permanent) {
      result = await deleteCandidate(supabase, id)
    } else {
      result = await archiveCandidate(supabase, id)
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting candidate:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
