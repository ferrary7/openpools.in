import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    // Get current user (must be admin)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Search users by name or email
    let searchQuery = supabase
      .from('profiles')
      .select('id, full_name, email, role, company, job_title, location, hired_date, status')

    if (query.trim()) {
      searchQuery = searchQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    }

    const { data: users, error } = await searchQuery
      .order('full_name', { ascending: true })
      .limit(50)

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
