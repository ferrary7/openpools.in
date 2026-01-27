import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Check if user is admin
async function checkAdmin(supabase) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Admin access required', status: 403 }
  }

  return { user, profile }
}

// GET - Fetch all premium users
export async function GET() {
  try {
    const supabase = await createClient()

    const adminCheck = await checkAdmin(supabase)
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, is_premium, premium_source, premium_expires_at, created_at')
      .eq('is_premium', true)
      .order('premium_expires_at', { ascending: false })

    if (error) {
      console.error('Error fetching premium users:', error)
      return NextResponse.json({ error: 'Failed to fetch premium users' }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Error in GET /api/admin/premium:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add premium access to multiple users
export async function POST(request) {
  try {
    const supabase = await createClient()

    const adminCheck = await checkAdmin(supabase)
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { emails, source, months, notes } = await request.json()

    if (!emails || !source || !months) {
      return NextResponse.json({ error: 'Missing required fields: emails, source, months' }, { status: 400 })
    }

    // Parse emails - handle both comma and newline separated
    const emailList = emails
      .split(/[,\n]/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e && e.includes('@'))

    if (emailList.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses provided' }, { status: 400 })
    }

    // Calculate expiry date
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + parseInt(months))

    // Find existing users by email
    const { data: existingUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('email', emailList)

    if (fetchError) {
      console.error('Error fetching users:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    const foundEmails = existingUsers?.map(u => u.email.toLowerCase()) || []
    const notFoundEmails = emailList.filter(e => !foundEmails.includes(e))
    const userIds = existingUsers?.map(u => u.id) || []

    if (userIds.length === 0) {
      return NextResponse.json({
        error: 'No matching users found',
        notFound: notFoundEmails
      }, { status: 404 })
    }

    // Update profiles with premium status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_premium: true,
        premium_source: source,
        premium_expires_at: expiresAt.toISOString()
      })
      .in('id', userIds)

    if (updateError) {
      console.error('Error updating profiles:', updateError)
      return NextResponse.json({ error: 'Failed to update profiles' }, { status: 500 })
    }

    // Log the admin action
    try {
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_id: adminCheck.user.id,
          action: 'grant_premium',
          resource_type: 'profiles',
          resource_id: null,
          details: {
            emails_updated: foundEmails,
            emails_not_found: notFoundEmails,
            source,
            months,
            expires_at: expiresAt.toISOString(),
            notes
          }
        })
    } catch (logError) {
      console.warn('Failed to log admin action:', logError)
    }

    return NextResponse.json({
      success: true,
      updated: userIds.length,
      notFound: notFoundEmails,
      expiresAt: expiresAt.toISOString()
    })
  } catch (error) {
    console.error('Error in POST /api/admin/premium:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Revoke premium access
export async function DELETE(request) {
  try {
    const supabase = await createClient()

    const adminCheck = await checkAdmin(supabase)
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Get user email for logging
    const { data: user } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    // Revoke premium
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_premium: false,
        premium_source: null,
        premium_expires_at: null
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error revoking premium:', updateError)
      return NextResponse.json({ error: 'Failed to revoke premium' }, { status: 500 })
    }

    // Log the admin action
    try {
      await supabase
        .from('admin_activity_logs')
        .insert({
          admin_id: adminCheck.user.id,
          action: 'revoke_premium',
          resource_type: 'profiles',
          resource_id: userId,
          details: {
            email: user?.email
          }
        })
    } catch (logError) {
      console.warn('Failed to log admin action:', logError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/premium:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
