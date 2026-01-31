import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Fetch user notifications (including message notifications)
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get regular notifications (collab requests, etc.)
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        *,
        related_user:related_user_id(id, full_name, email, company, job_title, username)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    // Try to get message notifications (table may not exist)
    let messageNotifications = []
    try {
      const { data: msgNotifs } = await supabase
        .from('message_notifications')
        .select(`
          id,
          read,
          created_at,
          sender:sender_id(id, full_name, username)
        `)
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(20)

      if (msgNotifs) {
        // Transform message notifications to match regular notification format
        messageNotifications = msgNotifs.map(mn => ({
          id: `msg_${mn.id}`,
          type: 'new_message',
          title: 'New Message',
          message: `${mn.sender?.full_name || 'Someone'} sent you a message`,
          read: mn.read,
          created_at: mn.created_at,
          related_user_id: mn.sender?.id,
          related_user: mn.sender,
          is_message_notification: true
        }))
      }
    } catch (err) {
      // Table doesn't exist yet, ignore
    }

    // Combine and sort all notifications
    const allNotifications = [...(notifications || []), ...messageNotifications]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50)

    const unreadCount = allNotifications.filter(n => !n.read).length

    return NextResponse.json({
      notifications: allNotifications,
      unreadCount,
      total: allNotifications.length
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

    // Separate message notifications (prefixed with msg_) from regular notifications
    const messageNotifIds = notificationIds
      .filter(id => id.startsWith('msg_'))
      .map(id => id.replace('msg_', ''))
    const regularNotifIds = notificationIds.filter(id => !id.startsWith('msg_'))

    // Update regular notifications
    if (regularNotifIds.length > 0) {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', regularNotifIds)
        .eq('user_id', user.id)

      if (error) throw error
    }

    // Update message notifications
    if (messageNotifIds.length > 0) {
      try {
        await supabase
          .from('message_notifications')
          .update({ read: true })
          .in('id', messageNotifIds)
          .eq('user_id', user.id)
      } catch (err) {
        // Table may not exist
      }
    }

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
