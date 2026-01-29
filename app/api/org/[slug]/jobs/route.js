import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getOrganizationBySlug } from '@/lib/organizations'
import { requireOrgPermission, PERMISSIONS } from '@/lib/org-permissions'
import { parseJobDescription } from '@/lib/job-parser'

/**
 * GET /api/org/[slug]/jobs
 * List all job descriptions for the organization
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
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.VIEW_DASHBOARD)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    const serviceClient = createServiceClient()

    let query = serviceClient
      .from('org_job_descriptions')
      .select(`
        *,
        creator:created_by (
          full_name,
          email
        )
      `)
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: jobs, error } = await query

    if (error) {
      console.error('Error fetching jobs:', error)
      return NextResponse.json({ error: 'Failed to fetch job descriptions' }, { status: 500 })
    }

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/org/[slug]/jobs
 * Create a new job description
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
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.RUN_SEARCH)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, requirements, department, location, employment_type, extractKeywords = true } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    let keywords = null

    // Extract keywords from description
    if (extractKeywords) {
      try {
        const parsed = await parseJobDescription(description)
        keywords = parsed.keywords
      } catch (err) {
        console.error('Error extracting keywords:', err)
        // Continue without keywords
      }
    }

    const serviceClient = createServiceClient()

    const { data: job, error } = await serviceClient
      .from('org_job_descriptions')
      .insert({
        organization_id: org.id,
        title,
        description,
        requirements,
        keywords,
        department,
        location,
        employment_type,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating job:', error)
      return NextResponse.json({ error: 'Failed to create job description' }, { status: 500 })
    }

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
