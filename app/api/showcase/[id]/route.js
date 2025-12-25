import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Get single showcase item
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data, error } = await supabase
      .from('showcase_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Showcase item not found' }, { status: 404 })
    }

    return NextResponse.json({ item: data })
  } catch (error) {
    console.error('Error fetching showcase item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch showcase item: ' + error.message },
      { status: 500 }
    )
  }
}

// PATCH - Update showcase item
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Get the item to verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('showcase_items')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Showcase item not found' }, { status: 404 })
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to update this item' }, { status: 403 })
    }

    // Validate fields if provided
    if (body.type) {
      const validTypes = ['project', 'certification', 'research', 'publication', 'talk', 'course', 'award', 'patent']
      if (!validTypes.includes(body.type)) {
        return NextResponse.json(
          { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        )
      }
    }

    if (body.title && (!body.title.trim() || body.title.length < 3)) {
      return NextResponse.json(
        { error: 'Title must be at least 3 characters long' },
        { status: 400 }
      )
    }

    if (body.description && body.description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Validate links format
    if (body.links && body.links.length > 0) {
      for (const link of body.links) {
        if (!link.url || !link.label) {
          return NextResponse.json(
            { error: 'Each link must have a label and url' },
            { status: 400 }
          )
        }
      }
    }

    // Validate dates (only if both are provided and not empty)
    if (body.end_date && body.start_date && body.end_date.trim && body.end_date.trim() && body.start_date.trim && body.start_date.trim()) {
      if (new Date(body.end_date) < new Date(body.start_date)) {
        return NextResponse.json(
          { error: 'End date cannot be before start date' },
          { status: 400 }
        )
      }
    }

    // Build update object (only include fields that were provided)
    const updateData = {}
    const allowedFields = ['type', 'title', 'description', 'links', 'image_url', 'start_date', 'end_date', 'is_present', 'tags', 'visible', 'pinned', 'position', 'metadata']

    allowedFields.forEach(field => {
      if (field in body) {
        let value = body[field]
        // Convert empty strings to null for date fields
        if ((field === 'start_date' || field === 'end_date' || field === 'image_url' || field === 'description') && value === '') {
          value = null
        }
        updateData[field] = value
      }
    })

    // Update the item
    const { data, error } = await supabase
      .from('showcase_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Check if it's the pinned limit error
      if (error.message && error.message.includes('can only pin up to 3')) {
        return NextResponse.json(
          { error: 'You can only pin up to 3 showcase items for your certificate' },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json({
      item: data,
      message: 'Showcase item updated successfully'
    })
  } catch (error) {
    console.error('Error updating showcase item:', error)
    return NextResponse.json(
      { error: 'Failed to update showcase item: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete showcase item
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get the item to verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('showcase_items')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Showcase item not found' }, { status: 404 })
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this item' }, { status: 403 })
    }

    // Delete the item
    const { error: deleteError } = await supabase
      .from('showcase_items')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: 'Showcase item deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting showcase item:', error)
    return NextResponse.json(
      { error: 'Failed to delete showcase item: ' + error.message },
      { status: 500 }
    )
  }
}
