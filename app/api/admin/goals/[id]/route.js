import { createClient } from '@/lib/supabase/server'

export async function PUT(req, { params }) {
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
    const { goal, status, progress_percentage, target_date } = body

    const { data, error } = await supabase
      .from('employee_goals')
      .update({
        goal,
        status: status || 'in_progress',
        progress_percentage: progress_percentage || 0,
        target_date: target_date || null
      })
      .eq('id', params.id)
      .select()

    if (error) throw error

    return Response.json({ data: data[0] })
  } catch (error) {
    console.error('Goal update error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
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

    const { error } = await supabase
      .from('employee_goals')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('Goal deletion error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
