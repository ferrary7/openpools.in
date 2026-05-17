// Admin API: List, update, delete counterpools problems

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service client for bypassing RLS
function getServiceClient() {
  return createSupabaseClient(
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

async function verifyAdminAccess() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  return user
}

export async function GET(request) {
  try {
    await verifyAdminAccess()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Use service client to bypass RLS
    const supabase = getServiceClient()
    let query = supabase
      .from('counterpools_problems')
      .select('*', { count: 'exact' })

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Search by title or email
    if (search) {
      query = query.or(`problem_title.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    // Add pagination and sorting
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true,
        data,
        total: count,
        limit,
        offset
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Admin fetch error:', err)
    return new Response(
      JSON.stringify({ success: false, message: err.message || 'Failed to fetch' }),
      { status: err.message === 'Unauthorized' ? 403 : 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
