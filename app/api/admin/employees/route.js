import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { userId, role, department, manager_id, phone } = await request.json()

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

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update user profile with employee role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: role, // 'employee' or 'intern'
        department: department || null,
        hired_date: new Date().toISOString(),
        status: 'active'
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Profiles UPDATE error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile: ' + updateError.message }, { status: 500 })
    }

    console.log(`Profile updated: userId=${userId}, role=${role}`)

    // Verify the update worked
    const { data: verifyProfile } = await supabase
      .from('profiles')
      .select('id, full_name, role, hired_date, status')
      .eq('id', userId)
      .single()

    console.log('Verified profile after update:', verifyProfile)

    // Create employee profile record
    // Note: This may fail with RLS if policies not set correctly, but continue anyway
    try {
      const { error: employeeError } = await supabase
        .from('employee_profiles')
        .upsert({
          id: userId,
          manager_id: manager_id || null,
          phone: phone || null
        }, {
          onConflict: 'id'
        })

      if (employeeError) {
        console.error('Employee profile error:', employeeError)
        // Don't fail the whole operation - employee_profiles is optional
      }
    } catch (empErr) {
      console.error('Employee profile insert failed:', empErr)
      // Continue - the main role assignment succeeded
    }

    // Log activity
    await supabase
      .from('admin_activity_logs')
      .insert({
        admin_id: user.id,
        action: 'user_hired',
        resource_type: 'user',
        resource_id: userId,
        changes: { role, department, manager_id }
      })

    return NextResponse.json({ 
      success: true, 
      message: `User hired as ${role}` 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const supabase = await createClient()
    const { userId, role, department, manager_id, status } = await request.json()

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

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Update employee details
    const updateData = {}
    if (role) updateData.role = role
    if (department) updateData.department = department
    if (status) updateData.status = status

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
    }

    // Update manager in employee_profiles if provided
    if (manager_id !== undefined) {
      const { error: empError } = await supabase
        .from('employee_profiles')
        .update({ manager_id })
        .eq('id', userId)

      if (empError) {
        console.error('Employee profile update error:', empError)
      }
    }

    // Log activity
    await supabase
      .from('admin_activity_logs')
      .insert({
        admin_id: user.id,
        action: 'employee_updated',
        resource_type: 'employee',
        resource_id: userId,
        changes: updateData
      })

    return NextResponse.json({ 
      success: true, 
      message: 'Employee updated successfully' 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
