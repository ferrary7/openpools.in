import { createClient } from '@/lib/supabase/server'

export async function DELETE(req, context) {
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

    const { userId } = await context.params

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('Deleting user completely:', userId)

    // Delete the profile - all related data cascades automatically
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Profile deletion error:', profileError)
      return Response.json({ error: `Failed to delete user: ${profileError.message}` }, { status: 400 })
    }

    // Try to delete from Supabase auth
    try {
      await supabase.auth.admin.deleteUser(userId)
    } catch (authError) {
      console.warn('Auth deletion info:', authError.message)
    }

    return Response.json({ success: true, message: 'User completely removed from application' })
  } catch (error) {
    console.error('Delete user error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req, context) {
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

    const { userId } = await context.params

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    const body = await req.json()

    // Update user profile
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: body.full_name,
        email: body.email,
        job_title: body.job_title,
        company: body.company,
        location: body.location,
        bio: body.bio,
      })
      .eq('id', userId)

    if (error) {
      console.error('Profile update error:', error)
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ success: true, message: 'User updated successfully' })
  } catch (error) {
    console.error('Update user error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
