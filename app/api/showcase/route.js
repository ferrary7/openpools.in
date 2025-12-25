import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - List showcase items
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type')

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    // Build query
    let query = supabase
      .from('showcase_items')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })

    // Filter by type if provided
    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ items: data || [] })
  } catch (error) {
    console.error('Error fetching showcase items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch showcase items: ' + error.message },
      { status: 500 }
    )
  }
}

// POST - Create new showcase item
export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      title,
      description,
      links = [],
      image_url,
      start_date,
      end_date,
      is_present = false,
      tags,
      visible = true,
      pinned = false,
      metadata = {}
    } = body

    // Validation
    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      )
    }

    if (!title.trim() || title.length < 3) {
      return NextResponse.json(
        { error: 'Title must be at least 3 characters long' },
        { status: 400 }
      )
    }

    const validTypes = ['project', 'certification', 'research', 'publication', 'talk', 'course', 'award', 'patent']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Validate links format
    if (links && links.length > 0) {
      for (const link of links) {
        if (!link.url || !link.label) {
          return NextResponse.json(
            { error: 'Each link must have a label and url' },
            { status: 400 }
          )
        }
      }
    }

    // Validate dates
    if (end_date && start_date && new Date(end_date) < new Date(start_date)) {
      return NextResponse.json(
        { error: 'End date cannot be before start date' },
        { status: 400 }
      )
    }

    // Get highest position for this user
    const { data: existingItems } = await supabase
      .from('showcase_items')
      .select('position')
      .eq('user_id', user.id)
      .order('position', { ascending: false })
      .limit(1)

    const nextPosition = existingItems && existingItems.length > 0
      ? existingItems[0].position + 1
      : 0

    // Create the item
    const { data, error } = await supabase
      .from('showcase_items')
      .insert({
        user_id: user.id,
        type,
        title,
        description: description && description.trim() ? description : null,
        links: links || [],
        image_url: image_url && image_url.trim() ? image_url : null,
        start_date: start_date && start_date.trim() ? start_date : null,
        end_date: end_date && end_date.trim() ? end_date : null,
        is_present,
        tags: tags || [],
        visible,
        pinned,
        position: nextPosition,
        metadata
      })
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

    // Extract keywords from description if provided
    // TODO: Re-enable once extract-keywords endpoint is working properly
    let keywordsAdded = 0
    /* Temporarily disabled to prevent errors
    if (description && description.trim()) {
      try {
        // Keyword extraction logic here
      } catch (keywordError) {
        console.error('Error extracting keywords:', keywordError.message)
      }
    }
    */

    return NextResponse.json({
      item: data,
      message: 'Showcase item created successfully',
      keywordsAdded
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating showcase item:', error)
    return NextResponse.json(
      { error: 'Failed to create showcase item: ' + error.message },
      { status: 500 }
    )
  }
}
