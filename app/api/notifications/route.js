import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Fetch user notifications
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get notifications
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        *,
        related_user:related_user_id(id, full_name, email, company, job_title)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    const unreadCount = notifications.filter(n => !n.read).length

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications: ' + error.message },
      { status: 500 }
    )
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds } = body

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'notificationIds array required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', notificationIds)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ message: 'Notifications marked as read' })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete notification
export async function DELETE(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ message: 'Notification deleted' })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification: ' + error.message },
      { status: 500 }
    )
  }
}
