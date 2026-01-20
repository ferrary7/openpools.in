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

    // Fetch onboarded users (those with a profile created and with complete info)
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, job_title, company, bio, location, created_at')
      .not('full_name', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching onboarded users:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ users: users || [] })
  } catch (error) {
    console.error('Onboarded users error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
