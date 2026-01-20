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

    // Fetch all goals with employee names
    const { data, error } = await supabase
      .from('employee_goals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json({ data })
  } catch (error) {
    console.error('Goals fetch error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const supabase = await createClient()
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

    const body = await req.json()
    const { employee_id, goal, status, progress_percentage, target_date } = body

    const { data, error } = await supabase
      .from('employee_goals')
      .insert([{
        employee_id,
        goal,
        status: status || 'in_progress',
        progress_percentage: progress_percentage || 0,
        target_date: target_date || null
      }])
      .select()

    if (error) throw error

    return Response.json({ data: data[0] }, { status: 201 })
  } catch (error) {
    console.error('Goal creation error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
