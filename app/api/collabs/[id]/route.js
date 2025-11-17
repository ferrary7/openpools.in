import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH - Accept or reject collab request
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get the collab to verify user is receiver
    const { data: collab, error: fetchError } = await supabase
      .from('collaborations')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !collab) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    if (collab.receiver_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to update this collaboration' }, { status: 403 })
    }

    if (collab.status !== 'pending') {
      return NextResponse.json({ error: 'Collaboration already processed' }, { status: 400 })
    }

    // Update status
    const { data: updated, error: updateError } = await supabase
      .from('collaborations')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        sender:sender_id(id, full_name, email),
        receiver:receiver_id(id, full_name, email)
      `)
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      collab: updated,
      message: `Collaboration ${status}`
    })
  } catch (error) {
    console.error('Error updating collab:', error)
    return NextResponse.json(
      { error: 'Failed to update collab: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE - Remove a collaboration
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get the collab to verify user is part of it
    const { data: collab, error: fetchError } = await supabase
      .from('collaborations')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !collab) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Verify user is either sender or receiver
    if (collab.sender_id !== user.id && collab.receiver_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this collaboration' }, { status: 403 })
    }

    // Delete all messages between these two users
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .or(`and(sender_id.eq.${collab.sender_id},receiver_id.eq.${collab.receiver_id}),and(sender_id.eq.${collab.receiver_id},receiver_id.eq.${collab.sender_id})`)

    if (messagesError) {
      console.error('Error deleting messages:', messagesError)
      // Continue even if message deletion fails
    }

    // Delete notifications related to this collaboration
    // Delete notifications where user_id is one party and related_user_id is the other
    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .or(`and(user_id.eq.${collab.sender_id},related_user_id.eq.${collab.receiver_id}),and(user_id.eq.${collab.receiver_id},related_user_id.eq.${collab.sender_id})`)

    if (notificationsError) {
      console.error('Error deleting notifications:', notificationsError)
      // Continue even if notification deletion fails
    }

    // Delete the collaboration
    const { error: deleteError } = await supabase
      .from('collaborations')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: 'Collaboration removed successfully'
    })
  } catch (error) {
    console.error('Error deleting collab:', error)
    return NextResponse.json(
      { error: 'Failed to delete collab: ' + error.message },
      { status: 500 }
    )
  }
}
