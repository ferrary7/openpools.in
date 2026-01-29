import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getOrganizationBySlug } from '@/lib/organizations'
import { requireOrgPermission, PERMISSIONS } from '@/lib/org-permissions'
import { parseJobDescription, extractJobKeywords } from '@/lib/job-parser'
import { calculateCompatibility, findTopMatches, getMatchQuality } from '@/lib/matching'

/**
 * POST /api/org/[slug]/search
 * Run a search against job description
 * Body: { jobDescription, options: { includeOrgCandidates, includeOpenPools, limit } }
 */
export async function POST(request, { params }) {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()
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
    const { jobDescription, options = {} } = body

    if (!jobDescription || jobDescription.trim().length < 50) {
      return NextResponse.json({ error: 'Job description must be at least 50 characters' }, { status: 400 })
    }

    const {
      includeOrgCandidates = true,
      includeOpenPools = true,
      limit = 20,
      saveSearch = false,
      searchName = null
    } = options

    // Parse job description and extract keywords
    const { job, requirements, keywords: jobKeywords } = await parseJobDescription(jobDescription)

    if (!jobKeywords || jobKeywords.length === 0) {
      return NextResponse.json({ error: 'Could not extract keywords from job description' }, { status: 400 })
    }

    const results = []

    // Search org candidates
    if (includeOrgCandidates) {
      const { data: orgCandidates, error: orgError } = await serviceClient
        .from('org_candidates')
        .select(`
          id,
          full_name,
          email,
          job_title,
          location,
          linkedin_url,
          resume_url,
          status,
          org_candidate_keywords (
            keywords
          )
        `)
        .eq('organization_id', org.id)
        .eq('status', 'active')

      if (!orgError && orgCandidates) {
        orgCandidates.forEach(candidate => {
          const candidateKeywords = candidate.org_candidate_keywords?.keywords || []
          if (candidateKeywords.length > 0) {
            const compatibility = calculateCompatibility(
              jobKeywords,
              candidateKeywords,
              { location: job.location }, // Job as "profile 1"
              { location: candidate.location } // Candidate as "profile 2"
            )

            results.push({
              id: candidate.id,
              source: 'org_candidate',
              fullName: candidate.full_name,
              email: candidate.email,
              jobTitle: candidate.job_title,
              location: candidate.location,
              linkedinUrl: candidate.linkedin_url,
              resumeUrl: candidate.resume_url,
              score: compatibility.score,
              commonKeywords: compatibility.commonKeywords,
              totalCommon: compatibility.totalCommon,
              matchQuality: getMatchQuality(compatibility.score),
              keywords: candidateKeywords
            })
          }
        })
      }
    }

    // Search OpenPools users
    if (includeOpenPools) {
      const { data: openpoolsUsers, error: opError } = await serviceClient
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          job_title,
          company,
          location,
          linkedin_url,
          bio,
          is_premium,
          keyword_profiles (
            keywords
          )
        `)
        .eq('is_discoverable', true)

      if (!opError && openpoolsUsers) {
        openpoolsUsers.forEach(userProfile => {
          const userKeywords = userProfile.keyword_profiles?.keywords || []
          if (userKeywords.length > 0) {
            const compatibility = calculateCompatibility(
              jobKeywords,
              userKeywords,
              { location: job.location },
              {
                location: userProfile.location,
                bio: userProfile.bio,
                is_premium: userProfile.is_premium
              }
            )

            results.push({
              id: userProfile.id,
              source: 'openpools',
              fullName: userProfile.full_name,
              email: userProfile.email,
              jobTitle: userProfile.job_title,
              company: userProfile.company,
              location: userProfile.location,
              linkedinUrl: userProfile.linkedin_url,
              bio: userProfile.bio,
              isPremium: userProfile.is_premium,
              score: compatibility.score,
              commonKeywords: compatibility.commonKeywords,
              totalCommon: compatibility.totalCommon,
              matchQuality: getMatchQuality(compatibility.score),
              scoreBreakdown: compatibility.breakdown,
              keywords: userKeywords
            })
          }
        })
      }
    }

    // Sort by score and limit
    results.sort((a, b) => b.score - a.score)
    const topResults = results.slice(0, limit)

    // Save search to history
    const { data: savedSearch, error: saveError } = await serviceClient
      .from('org_searches')
      .insert({
        organization_id: org.id,
        query_text: jobDescription,
        query_keywords: jobKeywords,
        filters: { includeOrgCandidates, includeOpenPools },
        results_count: results.length,
        is_saved: saveSearch,
        name: searchName,
        created_by: user.id
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving search:', saveError)
    }

    return NextResponse.json({
      searchId: savedSearch?.id,
      job,
      requirements,
      keywords: jobKeywords,
      results: topResults,
      totalResults: results.length,
      sources: {
        orgCandidates: results.filter(r => r.source === 'org_candidate').length,
        openPools: results.filter(r => r.source === 'openpools').length
      }
    })
  } catch (error) {
    console.error('Error running search:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * GET /api/org/[slug]/search
 * Get search history
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
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.RUN_SEARCH)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const savedOnly = searchParams.get('savedOnly') === 'true'

    const serviceClient = createServiceClient()

    let query = serviceClient
      .from('org_searches')
      .select(`
        id,
        query_text,
        query_keywords,
        filters,
        results_count,
        is_saved,
        name,
        created_at,
        creator:created_by (
          full_name,
          email
        )
      `)
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (savedOnly) {
      query = query.eq('is_saved', true)
    }

    const { data: searches, error } = await query

    if (error) {
      console.error('Error fetching search history:', error)
      return NextResponse.json({ error: 'Failed to fetch search history' }, { status: 500 })
    }

    return NextResponse.json({ searches })
  } catch (error) {
    console.error('Error fetching search history:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
