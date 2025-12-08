import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { extractKeywordsFromMultipleSources, extractCompleteProfile } from '@/lib/gemini'
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

    // Extract complete profile from the first/primary source (usually resume)
    let profileData = {}
    let allKeywords = []

    if (sources.length > 0 && sources[0].text) {
      const result = await extractCompleteProfile(sources[0].text, sources[0].source || 'resume')
      profileData = result.profile
      allKeywords = result.keywords
    }

    // If there are additional sources, extract keywords from them and merge
    if (sources.length > 1) {
      const additionalKeywords = await extractKeywordsFromMultipleSources(sources.slice(1))
      allKeywords = mergeKeywords(allKeywords, additionalKeywords)
    }

    // Get existing keyword profile if it exists
    const { data: existingProfile } = await supabase
      .from('keyword_profiles')
      .select('keywords')
      .eq('user_id', user.id)
      .single()

    let finalKeywords = allKeywords

    // Merge with existing keywords if profile exists
    if (existingProfile && existingProfile.keywords) {
      finalKeywords = mergeKeywords(existingProfile.keywords, allKeywords)
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
      profile: profileData,
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
