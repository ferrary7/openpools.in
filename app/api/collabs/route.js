import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendCollabRequestEmail } from '@/lib/email/welcome'

// GET - Fetch user's collaborations
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all collabs where user is sender or receiver
    const { data: collabs, error } = await supabase
      .from('collaborations')
      .select(`
        *,
        sender:sender_id(id, username, full_name, email, company, job_title, location),
        receiver:receiver_id(id, username, full_name, email, company, job_title, location)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get message counts for active collaborations
    const active = collabs.filter(c => c.status === 'accepted')

    // Fetch message counts for each active collaboration
    const activeWithCounts = await Promise.all(
      active.map(async (collab) => {
        const otherUserId = collab.sender_id === user.id ? collab.receiver_id : collab.sender_id

        // Get total message count between users
        const { count: totalMessages } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)

        // Get unread message count (messages sent to current user that are unread)
        const { count: unreadMessages } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', otherUserId)
          .eq('receiver_id', user.id)
          .eq('read', false)

        // Get last message
        const { data: lastMessageData } = await supabase
          .from('messages')
          .select('content, created_at, sender_id')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...collab,
          message_stats: {
            total: totalMessages || 0,
            unread: unreadMessages || 0,
            last_message: lastMessageData ? {
              preview: lastMessageData.content?.substring(0, 50) + (lastMessageData.content?.length > 50 ? '...' : ''),
              created_at: lastMessageData.created_at,
              is_from_me: lastMessageData.sender_id === user.id
            } : null
          }
        }
      })
    )

    // Separate into sent, received, and active
    const sent = collabs.filter(c => c.sender_id === user.id && c.status === 'pending')
    const received = collabs.filter(c => c.receiver_id === user.id && c.status === 'pending')

    return NextResponse.json({
      sent,
      received,
      active: activeWithCounts,
      total: collabs.length
    })
  } catch (error) {
    console.error('Error fetching collabs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collabs: ' + error.message },
      { status: 500 }
    )
  }
}

// POST - Send new collab request
export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { receiver_id, message } = body

    if (!receiver_id) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 })
    }

    if (receiver_id === user.id) {
      return NextResponse.json({ error: 'Cannot collaborate with yourself' }, { status: 400 })
    }

    // Check if collab already exists
    const { data: existing } = await supabase
      .from('collaborations')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${user.id})`)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        error: 'Collaboration request already exists',
        collab: existing
      }, { status: 400 })
    }

    // Create collab
    const { data: collab, error } = await supabase
      .from('collaborations')
      .insert({
        sender_id: user.id,
        receiver_id,
        status: 'pending',
        message: message || null
      })
      .select(`
        *,
        sender:sender_id(id, username, full_name, email, job_title, company),
        receiver:receiver_id(id, username, full_name, email, job_title, company)
      `)
      .single()

    if (error) throw error

    // Send email notification to receiver (non-blocking)
    sendCollabRequestEmail(
      collab.receiver.email,
      collab.receiver.full_name,
      collab.sender.full_name,
      collab.sender.job_title,
      collab.sender.company,
      collab.sender.username || collab.sender.id
    ).catch(err => console.error('Collab request email failed:', err))

    return NextResponse.json({
      collab,
      message: 'Collaboration request sent successfully'
    })
  } catch (error) {
    console.error('Error sending collab:', error)
    return NextResponse.json(
      { error: 'Failed to send collab: ' + error.message },
      { status: 500 }
    )
  }
}
