import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { extractKeywordsFromMultipleSources } from '@/lib/gemini'
import { mergeKeywords } from '@/lib/keywords'

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

    // Ensure profile exists (fallback for existing sessions)
    const { data: existingProfileCheck, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfileCheck) {
      console.log('Creating profile for user:', user.id)
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          onboarding_completed: false,
        })

      if (insertError) {
        console.error('Error creating profile:', insertError)
        return NextResponse.json({ error: 'Failed to create profile: ' + insertError.message }, { status: 500 })
      }
    }

    const body = await request.json()
    const { sources } = body // [{ text, source }]

    if (!sources || !Array.isArray(sources)) {
      return NextResponse.json({ error: 'Invalid sources data' }, { status: 400 })
    }

    // Extract keywords from all sources
    const extractedKeywords = await extractKeywordsFromMultipleSources(sources)

    // Get existing keyword profile if it exists
    const { data: existingProfile } = await supabase
      .from('keyword_profiles')
      .select('keywords')
      .eq('user_id', user.id)
      .single()

    let finalKeywords = extractedKeywords

    // Merge with existing keywords if profile exists
    if (existingProfile && existingProfile.keywords) {
      finalKeywords = mergeKeywords(existingProfile.keywords, extractedKeywords)
    }

    // Upsert keyword profile
    const { data, error } = await supabase
      .from('keyword_profiles')
      .upsert(
        {
          user_id: user.id,
          keywords: finalKeywords,
          total_keywords: finalKeywords.length,
          last_updated: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error saving keywords:', error)
      return NextResponse.json({ error: 'Failed to save keywords' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      keywords: finalKeywords,
      totalKeywords: finalKeywords.length,
    })
  } catch (error) {
    console.error('Error extracting keywords:', error)
    return NextResponse.json(
      { error: 'Failed to extract keywords: ' + error.message },
      { status: 500 }
    )
  }
}
