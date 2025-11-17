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
