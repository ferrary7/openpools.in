import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrganizationBySlug } from '@/lib/organizations'
import {
  getCandidatesByOrg,
  createCandidate,
  getCandidateStats
} from '@/lib/org-candidates'
import { requireOrgPermission, PERMISSIONS } from '@/lib/org-permissions'

/**
 * GET /api/org/[slug]/candidates
 * List all candidates for the organization
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const options = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      status: searchParams.get('status') || 'active',
      search: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc'
    }

    const { candidates, total } = await getCandidatesByOrg(supabase, org.id, options)

    // Also get stats
    const stats = await getCandidateStats(supabase, org.id)

    return NextResponse.json({
      candidates,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
      stats
    })
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/org/[slug]/candidates
 * Create a new candidate manually
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
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.UPLOAD_CANDIDATES)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    const body = await request.json()
    const { full_name, email, phone, location, job_title, linkedin_url, notes } = body

    // Validate required fields
    if (!full_name) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }

    const { candidate, error } = await createCandidate(
      supabase,
      org.id,
      {
        full_name,
        email,
        phone,
        location,
        job_title,
        linkedin_url,
        notes,
        source: 'manual'
      },
      user.id
    )

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ candidate }, { status: 201 })
  } catch (error) {
    console.error('Error creating candidate:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
