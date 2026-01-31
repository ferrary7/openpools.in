import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isUUID } from '@/lib/username'
import { sendNewMessageEmail, sendUnreadMessagesDigestEmail } from '@/lib/email/welcome'

// GET - Fetch messages between current user and another user
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get userId from query params
    const { searchParams } = new URL(request.url)
    const identifier = searchParams.get('userId')
    const markAsRead = searchParams.get('markAsRead') !== 'false' // Default true

    if (!identifier) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Determine if identifier is UUID or username
    let otherUserId = identifier
    const isId = isUUID(identifier)

    // If it's a username, look up the user ID
    if (!isId) {
      const { data: otherUser, error: lookupError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', identifier)
        .single()

      if (lookupError || !otherUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      otherUserId = otherUser.id
    }

    // Fetch messages between the two users
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, full_name, public_key),
        receiver:receiver_id(id, full_name, public_key)
      `)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Mark messages as read if requested
    if (markAsRead) {
      // Try to use RPC function first (if migration has run)
      try {
        await supabase.rpc('mark_conversation_read', {
          p_user_id: user.id,
          p_other_user_id: otherUserId
        })
      } catch (err) {
        // Fall back to direct update if RPC doesn't exist
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('receiver_id', user.id)
          .eq('sender_id', otherUserId)
          .eq('read', false)
          .catch(() => {}) // Non-blocking
      }
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error in GET /api/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Send a new message
export async function POST(request) {
  try {
    const supabase = await createClient()
    const serviceClient = createServiceClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiver_id, content, is_encrypted = false } = await request.json()

    if (!receiver_id || !content) {
      return NextResponse.json({ error: 'receiver_id and content are required' }, { status: 400 })
    }

    if (!content.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    // Determine if receiver_id is UUID or username
    let actualReceiverId = receiver_id
    const isId = isUUID(receiver_id)

    // If it's a username, look up the user ID
    if (!isId) {
      const { data: receiver, error: lookupError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', receiver_id)
        .single()

      if (lookupError || !receiver) {
        return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
      }

      actualReceiverId = receiver.id
    }

    // Check if this is the first message from this sender to this receiver
    const { data: existingMessages } = await supabase
      .from('messages')
      .select('id')
      .eq('sender_id', user.id)
      .eq('receiver_id', actualReceiverId)
      .limit(1)

    const isFirstMessage = !existingMessages || existingMessages.length === 0

    // Insert the message (is_encrypted only if column exists)
    const messageData = {
      sender_id: user.id,
      receiver_id: actualReceiverId,
      content: content.trim(),
      read: false
    }

    // Only add is_encrypted if the column exists (migration may not have run)
    if (is_encrypted) {
      messageData.is_encrypted = true
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select(`
        *,
        sender:sender_id(id, full_name, username),
        receiver:receiver_id(id, full_name, email, username)
      `)
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Handle smart email notifications (non-blocking)
    handleMessageNotification(
      serviceClient,
      user.id,
      actualReceiverId,
      message,
      isFirstMessage
    ).catch(err => console.error('Notification handling error:', err))

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Handle smart email notifications
 * 1. First message from sender → Send email
 * 2. Unread notifications > 9 → Send digest email
 * 3. Otherwise → Just add to in-app notifications (handled by DB trigger)
 */
async function handleMessageNotification(serviceClient, senderId, receiverId, message, isFirstMessage) {
  try {
    // Get sender and receiver profiles
    const { data: profiles } = await serviceClient
      .from('profiles')
      .select('id, full_name, email, username')
      .in('id', [senderId, receiverId])

    const sender = profiles?.find(p => p.id === senderId)
    const receiver = profiles?.find(p => p.id === receiverId)

    if (!sender || !receiver || !receiver.email) {
      console.log('Missing profile data for notification')
      return
    }

    // Check notification settings (table may not exist yet)
    let settings = null
    try {
      const { data } = await serviceClient
        .from('notification_settings')
        .select('*')
        .eq('user_id', receiverId)
        .single()
      settings = data
    } catch (err) {
      // Table may not exist - use defaults
    }

    // Default settings if not set
    const emailOnFirstMessage = settings?.email_on_first_message ?? true
    const emailOnThreshold = settings?.email_on_notification_threshold ?? true
    const threshold = settings?.notification_threshold ?? 9

    // Case 1: First message from this sender
    if (isFirstMessage && emailOnFirstMessage) {
      console.log('Sending first message email to:', receiver.email)
      await sendNewMessageEmail(
        receiver.email,
        receiver.full_name,
        sender.full_name,
        sender.username
      )
      return
    }

    // Case 2: Check if unread count exceeds threshold
    if (emailOnThreshold) {
      try {
        const { count: unreadCount } = await serviceClient
          .from('message_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', receiverId)
          .eq('read', false)

        // Send digest email when crossing threshold (at exactly threshold + 1)
        if (unreadCount === threshold + 1) {
          console.log('Sending digest email to:', receiver.email, 'with', unreadCount, 'unread')
          await sendUnreadMessagesDigestEmail(
            receiver.email,
            receiver.full_name,
            unreadCount
          )
        }
      } catch (err) {
        // Table may not exist if migration hasn't run - skip silently
        console.log('message_notifications table not available')
      }
    }

    // Case 3: Just in-app notification (handled by database trigger)
    // No action needed here - the trigger already created the notification

  } catch (error) {
    console.error('Error in handleMessageNotification:', error)
  }
}
