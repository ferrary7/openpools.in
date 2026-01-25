import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isUUID } from '@/lib/username'

// Disable caching - always fetch fresh profile data
export const dynamic = 'force-dynamic'

// GET - Fetch user profile with privacy rules
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Determine if userId is UUID or username
    const isId = isUUID(userId)

    // Get the profile - query by ID or username
    let profileQuery = supabase
      .from('profiles')
      .select('*')

    if (isId) {
      profileQuery = profileQuery.eq('id', userId)
    } else {
      profileQuery = profileQuery.eq('username', userId)
    }

    const { data: profile, error: profileError } = await profileQuery.single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get keyword profile using actual profile ID
    const { data: keywordProfile } = await supabase
      .from('keyword_profiles')
      .select('keywords, total_keywords, last_updated')
      .eq('user_id', profile.id)
      .single()

    // Check if users are collaborating (accepted collab) using actual profile ID
    const { data: collab } = await supabase
      .from('collaborations')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${user.id})`)
      .maybeSingle()

    const isCollaborating = collab?.status === 'accepted'
    const collabStatus = collab ? {
      status: collab.status,
      isSender: collab.sender_id === user.id,
      collabId: collab.id
    } : null

    // Build response with privacy rules
    const publicProfile = {
      id: profile.id,
      username: profile.username,
      full_name: profile.full_name,
      bio: profile.bio,
      company: profile.company,
      job_title: profile.job_title,
      location: profile.location,
      created_at: profile.created_at,
      keywords: keywordProfile?.keywords || [],
      total_keywords: keywordProfile?.total_keywords || 0,
      last_updated: keywordProfile?.last_updated || null
    }

    // Check if user is viewing their own profile
    const isOwnProfile = user.id === profile.id

    // Handle profile picture visibility
    // Show to owner always, or to accepted collaborators if not hidden
    if (isOwnProfile || (isCollaborating && profile.profile_picture_url && !profile.hide_profile_picture_from_collaborators)) {
      publicProfile.profile_picture_url = profile.profile_picture_url
    }

    // Include contact info if collaborating OR viewing own profile
    if (isCollaborating || isOwnProfile) {
      publicProfile.email = profile.email

      // Handle phone number visibility based on user preference
      if (profile.phone_number) {
        if (profile.show_phone_to_collaborators) {
          // Show full phone number
          publicProfile.phone_number = profile.phone_number
        } else {
          // Show only first 3 digits
          const phoneStr = profile.phone_number.toString()
          if (phoneStr.length > 3) {
            publicProfile.phone_number = phoneStr.substring(0, 3) + '*'.repeat(phoneStr.length - 3)
          } else {
            publicProfile.phone_number = phoneStr
          }
        }
      }

      publicProfile.linkedin_url = profile.linkedin_url
      publicProfile.website = profile.website
      publicProfile.twitter_url = profile.twitter_url
      publicProfile.github_url = profile.github_url
    }

    return NextResponse.json({
      profile: publicProfile,
      isCollaborating,
      collabStatus,
      canViewContactInfo: isCollaborating || isOwnProfile
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile: ' + error.message },
      { status: 500 }
    )
  }
}
