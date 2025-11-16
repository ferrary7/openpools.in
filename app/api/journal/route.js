import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { extractKeywords } from '@/lib/gemini'
import { mergeKeywords } from '@/lib/keywords'

// GET - Fetch all journals for the user
export async function GET(request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: journals, error } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching journals:', error)
      return NextResponse.json({ error: 'Failed to fetch journals' }, { status: 500 })
    }

    return NextResponse.json({ journals })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a new journal entry
export async function POST(request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Extract keywords from journal content
    const extractedKeywords = await extractKeywords(content, 'journal')

    // Save journal entry
    const { data: journal, error: journalError } = await supabase
      .from('journals')
      .insert({
        user_id: user.id,
        title,
        content,
        extracted_keywords: extractedKeywords,
      })
      .select()
      .single()

    if (journalError) {
      console.error('Error saving journal:', journalError)
      return NextResponse.json({ error: 'Failed to save journal' }, { status: 500 })
    }

    // Update user's keyword profile with new keywords
    const { data: existingProfile } = await supabase
      .from('keyword_profiles')
      .select('keywords')
      .eq('user_id', user.id)
      .single()

    if (existingProfile) {
      const mergedKeywords = mergeKeywords(
        existingProfile.keywords || [],
        extractedKeywords
      )

      await supabase
        .from('keyword_profiles')
        .update({
          keywords: mergedKeywords,
          total_keywords: mergedKeywords.length,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      success: true,
      journal,
      extractedKeywords,
    })
  } catch (error) {
    console.error('Error creating journal:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a journal entry
export async function DELETE(request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const journalId = searchParams.get('id')

    if (!journalId) {
      return NextResponse.json({ error: 'Journal ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('journals')
      .delete()
      .eq('id', journalId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting journal:', error)
      return NextResponse.json({ error: 'Failed to delete journal' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
