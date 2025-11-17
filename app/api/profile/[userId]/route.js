import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Fetch user profile with privacy rules
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Get the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get keyword profile
    const { data: keywordProfile } = await supabase
      .from('keyword_profiles')
      .select('keywords, total_keywords')
      .eq('user_id', userId)
      .single()

    // Check if users are collaborating (accepted collab)
    const { data: collab } = await supabase
      .from('collaborations')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
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
      full_name: profile.full_name,
      bio: profile.bio,
      company: profile.company,
      job_title: profile.job_title,
      location: profile.location,
      created_at: profile.created_at,
      keywords: keywordProfile?.keywords || [],
      total_keywords: keywordProfile?.total_keywords || 0
    }

    // Only include contact info if collaborating
    if (isCollaborating) {
      publicProfile.email = profile.email
      publicProfile.phone_number = profile.phone_number
      publicProfile.linkedin_url = profile.linkedin_url
      publicProfile.website = profile.website
      publicProfile.twitter_url = profile.twitter_url
      publicProfile.github_url = profile.github_url
    }

    return NextResponse.json({
      profile: publicProfile,
      isCollaborating,
      collabStatus,
      canViewContactInfo: isCollaborating
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile: ' + error.message },
      { status: 500 }
    )
  }
}
