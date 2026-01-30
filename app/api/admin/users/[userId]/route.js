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

    // Clear foreign key references in organization_members (invited_by)
    await supabase
      .from('organization_members')
      .update({ invited_by: null })
      .eq('invited_by', userId)

    // Remove user from organization memberships
    await supabase
      .from('organization_members')
      .delete()
      .eq('user_id', userId)

    // Clear foreign key references in org_invitations
    await supabase
      .from('org_invitations')
      .update({ invited_by: null })
      .eq('invited_by', userId)

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

    // Build update object (only include fields that are provided)
    const updateData = {}
    if (body.full_name !== undefined) updateData.full_name = body.full_name
    if (body.email !== undefined) updateData.email = body.email
    if (body.job_title !== undefined) updateData.job_title = body.job_title
    if (body.company !== undefined) updateData.company = body.company
    if (body.location !== undefined) updateData.location = body.location
    if (body.bio !== undefined) updateData.bio = body.bio
    if (body.can_create_org !== undefined) updateData.can_create_org = body.can_create_org

    // Update user profile
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
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
