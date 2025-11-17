import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const otherUserId = searchParams.get('userId')

    if (!otherUserId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Fetch messages between the two users
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, full_name),
        receiver:receiver_id(id, full_name)
      `)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
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
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiver_id, content } = await request.json()

    if (!receiver_id || !content) {
      return NextResponse.json({ error: 'receiver_id and content are required' }, { status: 400 })
    }

    if (!content.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    // Insert the message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id,
        content: content.trim(),
        read: false
      })
      .select(`
        *,
        sender:sender_id(id, full_name),
        receiver:receiver_id(id, full_name)
      `)
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
