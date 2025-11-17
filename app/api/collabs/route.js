import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
        sender:sender_id(id, full_name, email, company, job_title, location),
        receiver:receiver_id(id, full_name, email, company, job_title, location)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Separate into sent, received, and active
    const sent = collabs.filter(c => c.sender_id === user.id)
    const received = collabs.filter(c => c.receiver_id === user.id && c.status === 'pending')
    const active = collabs.filter(c => c.status === 'accepted')

    return NextResponse.json({
      sent,
      received,
      active,
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
        sender:sender_id(id, full_name, email),
        receiver:receiver_id(id, full_name, email)
      `)
      .single()

    if (error) throw error

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
