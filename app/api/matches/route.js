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

    // Get user's keyword profile and profile data
    const { data: userProfileData, error: userProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userProfileError || !userProfileData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { data: userKeywordProfile, error: userKeywordError } = await supabase
      .from('keyword_profiles')
      .select('keywords')
      .eq('user_id', user.id)
      .single()

    if (userKeywordError || !userKeywordProfile) {
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
          id,
          full_name,
          email,
          username,
          bio,
          location,
          job_title,
          company,
          linkedin_url,
          github_url,
          website
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

    // Format candidate profiles with full data
    const candidates = allProfiles.map((profile) => ({
      userId: profile.user_id,
      username: profile.profiles?.username,
      fullName: profile.profiles?.full_name || 'Anonymous',
      email: profile.profiles?.email,
      keywords: profile.keywords,
      profile: {
        full_name: profile.profiles?.full_name,
        bio: profile.profiles?.bio,
        location: profile.profiles?.location,
        job_title: profile.profiles?.job_title,
        company: profile.profiles?.company,
        linkedin_url: profile.profiles?.linkedin_url,
        github_url: profile.profiles?.github_url,
        website: profile.profiles?.website
      }
    }))

    // Find top matches using multi-factor scoring
    const matches = findTopMatches(
      userKeywordProfile.keywords,
      candidates,
      candidates.length,
      {
        full_name: userProfileData.full_name,
        bio: userProfileData.bio,
        location: userProfileData.location,
        job_title: userProfileData.job_title,
        company: userProfileData.company,
        linkedin_url: userProfileData.linkedin_url,
        github_url: userProfileData.github_url,
        website: userProfileData.website
      }
    )

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
