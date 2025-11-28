import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { findTopMatches } from '@/lib/matching'

export async function GET(request) {
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

    // Get user's keyword profile
    const { data: userProfile, error: userProfileError } = await supabase
      .from('keyword_profiles')
      .select('keywords')
      .eq('user_id', user.id)
      .single()

    if (userProfileError || !userProfile) {
      return NextResponse.json({ error: 'User keyword profile not found' }, { status: 404 })
    }

    // Get all other users' keyword profiles with their profile info
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('keyword_profiles')
      .select(
        `
        user_id,
        keywords,
        profiles:user_id (
          full_name,
          email,
          username
        )
      `
      )
      .neq('user_id', user.id)

    if (allProfilesError) {
      console.error('Error fetching profiles:', allProfilesError)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }

    if (!allProfiles || allProfiles.length === 0) {
      return NextResponse.json({
        matches: [],
        message: 'No other users found yet',
      })
    }

    // Format candidate profiles
    const candidates = allProfiles.map((profile) => ({
      userId: profile.user_id,
      username: profile.profiles?.username,
      fullName: profile.profiles?.full_name || 'Anonymous',
      email: profile.profiles?.email,
      keywords: profile.keywords,
    }))

    // Find top matches (show all matches, not just top 20)
    const matches = findTopMatches(userProfile.keywords, candidates, 100)

    // Save matches to database
    const matchRecords = matches.map((match) => ({
      user_id: user.id,
      matched_user_id: match.userId,
      compatibility_score: match.compatibility,
      common_keywords: match.commonKeywords,
      last_calculated: new Date().toISOString(),
    }))

    if (matchRecords.length > 0) {
      await supabase.from('matches').upsert(matchRecords, {
        onConflict: 'user_id,matched_user_id',
      })
    }

    return NextResponse.json({
      matches: matches,
      total: matches.length,
    })
  } catch (error) {
    console.error('Error finding matches:', error)
    return NextResponse.json(
      { error: 'Failed to find matches: ' + error.message },
      { status: 500 }
    )
  }
}
