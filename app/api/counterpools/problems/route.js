// POST: Submit a new problem
// GET: Fetch all published problems with filters

import { createClient } from '@supabase/supabase-js'

// Service client for public inserts (bypasses RLS)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function POST(request) {
  try {
    const formData = await request.json()

    // Import validation after getting formData
    const { validateCounterPoolsForm, sanitizeFormData } = await import('@/lib/counterpools-validation')

    // Validate form data
    const validation = validateCounterPoolsForm(formData)
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ success: false, errors: validation.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Sanitize data
    const sanitized = sanitizeFormData(formData)

    // Insert into Supabase using service client (bypasses RLS)
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('counterpools_problems')
      .insert([
        {
          full_name: sanitized.fullName,
          email: sanitized.email,
          linkedin_url: sanitized.linkedIn || null,
          problem_title: sanitized.problemTitle,
          domain: sanitized.domain,
          difficulty: sanitized.difficulty,
          description: sanitized.description,
          expected_outcome: sanitized.expectedOutcome,
          solution_adoption: sanitized.solutionAdoption,
          hiring_interest: sanitized.hiringInterest,
          status: 'pending',
        },
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to submit problem' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Problem submitted successfully',
        problemId: data[0]?.id
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Error submitting problem:', err)
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function GET(request) {
  try {
    // Import client creation after request
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const difficulty = searchParams.get('difficulty')
    const sort = searchParams.get('sort') || 'newest'

    let query = supabase
      .from('counterpools_problems')
      .select('*')
      .in('status', ['verified', 'open', 'in_progress', 'solved']) // Only show verified/published problems

    // Apply filters
    if (domain && domain !== 'all') {
      query = query.eq('domain', domain)
    }
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty)
    }

    // Apply sorting
    if (sort === 'most_teams') {
      query = query.order('teams_interested', { ascending: false })
    } else if (sort === 'most_challenging') {
      query = query.order('difficulty', { ascending: false })
    } else {
      // Default: newest first
      query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch problems' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        count: data?.length || 0
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  } catch (err) {
    console.error('Error fetching problems:', err)
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
