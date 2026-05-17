// Admin API: Update, delete, and verify specific problems

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

export async function PATCH(request, { params }) {
  try {
    const adminUser = await verifyAdminAccess()
    const { id } = await params
    const body = await request.json()

    // Use service client to bypass RLS
    const supabase = getServiceClient()

    // Prepare update data
    const updateData = {
      updated_at: new Date().toISOString(),
    }

    if (body.status) {
      updateData.status = body.status
    }

    if (body.admin_notes !== undefined) {
      updateData.admin_notes = body.admin_notes
    }

    if (body.keywords !== undefined) {
      updateData.keywords = body.keywords
    }

    // Update problem
    const { data, error } = await supabase
      .from('counterpools_problems')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) throw error
    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Problem not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data: data[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Admin update error:', err)
    return new Response(
      JSON.stringify({ success: false, message: err.message || 'Failed to update' }),
      { status: err.message === 'Unauthorized' ? 403 : 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const adminUser = await verifyAdminAccess()
    const { id } = await params

    // Use service client to bypass RLS
    const supabase = getServiceClient()

    // Hard delete
    const { error } = await supabase
      .from('counterpools_problems')
      .delete()
      .eq('id', id)

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, message: 'Problem deleted' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Admin delete error:', err)
    return new Response(
      JSON.stringify({ success: false, message: err.message || 'Failed to delete' }),
      { status: err.message === 'Unauthorized' ? 403 : 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
