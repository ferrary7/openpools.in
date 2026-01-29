import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getOrganizationBySlug } from '@/lib/organizations'
import { requireOrgPermission, PERMISSIONS } from '@/lib/org-permissions'
import { parseJobDescription } from '@/lib/job-parser'

/**
 * GET /api/org/[slug]/jobs/[jobId]
 * Get a specific job description
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug, jobId } = await params

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

    const serviceClient = createServiceClient()

    const { data: job, error } = await serviceClient
      .from('org_job_descriptions')
      .select(`
        *,
        creator:created_by (
          full_name,
          email
        )
      `)
      .eq('id', jobId)
      .eq('organization_id', org.id)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PATCH /api/org/[slug]/jobs/[jobId]
 * Update a job description
 */
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug, jobId } = await params

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
    const allowedFields = ['title', 'description', 'requirements', 'keywords', 'department', 'location', 'employment_type', 'is_active']

    const updateData = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Re-extract keywords if description changed
    if (body.description && body.reextractKeywords !== false) {
      try {
        const parsed = await parseJobDescription(body.description)
        updateData.keywords = parsed.keywords
      } catch (err) {
        console.error('Error extracting keywords:', err)
      }
    }

    const serviceClient = createServiceClient()

    const { data: job, error } = await serviceClient
      .from('org_job_descriptions')
      .update(updateData)
      .eq('id', jobId)
      .eq('organization_id', org.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating job:', error)
      return NextResponse.json({ error: 'Failed to update job description' }, { status: 500 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/org/[slug]/jobs/[jobId]
 * Delete a job description (soft delete by default)
 */
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug, jobId } = await params

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

    const { searchParams } = new URL(request.url)
    const permanent = searchParams.get('permanent') === 'true'

    const serviceClient = createServiceClient()

    if (permanent) {
      const { error } = await serviceClient
        .from('org_job_descriptions')
        .delete()
        .eq('id', jobId)
        .eq('organization_id', org.id)

      if (error) {
        console.error('Error deleting job:', error)
        return NextResponse.json({ error: 'Failed to delete job description' }, { status: 500 })
      }
    } else {
      // Soft delete
      const { error } = await serviceClient
        .from('org_job_descriptions')
        .update({ is_active: false })
        .eq('id', jobId)
        .eq('organization_id', org.id)

      if (error) {
        console.error('Error archiving job:', error)
        return NextResponse.json({ error: 'Failed to archive job description' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
