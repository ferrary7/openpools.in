import { createClient } from '@/lib/supabase/server'

export async function GET(req) {
  try {
    const supabase = await createClient()

    // Check admin authorization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get query params
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const search = url.searchParams.get('search') || ''
    const sortBy = url.searchParams.get('sortBy') || 'created_at'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'
    const exportAll = url.searchParams.get('export') === 'true'

    // Filters
    const filterCompany = url.searchParams.get('company') || ''
    const filterLocation = url.searchParams.get('location') || ''
    const filterPremium = url.searchParams.get('premium') || ''

    // Build base query
    let query = supabase
      .from('profiles')
      .select('id, username, full_name, email, job_title, company, bio, location, created_at, onboarding_completed, is_premium, premium_source, premium_expires_at', { count: 'exact' })
      .eq('onboarding_completed', true)

    // Apply search filter (server-side)
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,location.ilike.%${search}%,job_title.ilike.%${search}%`)
    }

    // Apply column filters
    if (filterCompany) {
      query = query.ilike('company', `%${filterCompany}%`)
    }
    if (filterLocation) {
      query = query.ilike('location', `%${filterLocation}%`)
    }
    if (filterPremium === 'true') {
      query = query.eq('is_premium', true)
    } else if (filterPremium === 'false') {
      query = query.or('is_premium.is.null,is_premium.eq.false')
    }

    // Apply sorting
    const validSortColumns = ['full_name', 'email', 'job_title', 'company', 'location', 'created_at', 'is_premium']
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

    // For export, fetch all records; otherwise apply pagination
    if (!exportAll) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data: users, error, count: totalCount } = await query

    if (error) {
      console.error('Error fetching onboarded users:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Get unique companies and locations for filter dropdowns
    const { data: filterOptions } = await supabase
      .from('profiles')
      .select('company, location')
      .eq('onboarding_completed', true)

    const companies = [...new Set(filterOptions?.filter(p => p.company).map(p => p.company) || [])].sort()
    const locations = [...new Set(filterOptions?.filter(p => p.location).map(p => p.location) || [])].sort()

    // Defensive: always at least 1 page
    let totalPages = Math.ceil((totalCount || 0) / limit);
    if (!Number.isFinite(totalPages) || totalPages < 1) totalPages = 1;

    return Response.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages
      },
      filterOptions: {
        companies,
        locations
      }
    })
  } catch (error) {
    console.error('Onboarded users error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
