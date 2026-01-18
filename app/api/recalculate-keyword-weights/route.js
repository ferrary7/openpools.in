import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { recalculateKeywordWeights } from '@/lib/keywords'

export async function POST(request) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current keyword profile
    const { data: keywordProfile, error: fetchError } = await supabase
      .from('keyword_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError || !keywordProfile) {
      return NextResponse.json({ error: 'Keyword profile not found' }, { status: 404 })
    }

    // Recalculate weights
    const updatedKeywords = recalculateKeywordWeights(keywordProfile.keywords || [])

    // Update in database
    const { data, error: updateError } = await supabase
      .from('keyword_profiles')
      .update({
        keywords: updatedKeywords,
        last_updated: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating keywords:', updateError)
      return NextResponse.json({ error: 'Failed to update keyword weights' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Keyword weights recalculated successfully',
      keywords: updatedKeywords,
      totalKeywords: updatedKeywords.length,
    })
  } catch (error) {
    console.error('Error recalculating keyword weights:', error)
    return NextResponse.json(
      { error: 'Failed to recalculate weights: ' + error.message },
      { status: 500 }
    )
  }
}
