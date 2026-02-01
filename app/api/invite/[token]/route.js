import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Service client
function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// GET - Get invite details
export async function GET(request, { params }) {
  try {
    const { token } = await params
    const serviceClient = getServiceClient()

    const { data: invite, error } = await serviceClient
      .from('pending_invites')
      .select('id, email, full_name, keywords, total_keywords, expires_at, claimed_at')
      .eq('token', token)
      .single()

    if (error || !invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 410 })
    }

    // Check if already claimed
    if (invite.claimed_at) {
      return NextResponse.json({ error: 'Invite has already been claimed' }, { status: 410 })
    }

    return NextResponse.json({
      invite: {
        email: invite.email,
        full_name: invite.full_name,
        keywords: invite.keywords || [],
        total_keywords: invite.total_keywords,
        expires_at: invite.expires_at
      }
    })
  } catch (error) {
    console.error('Error fetching invite:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invite' },
      { status: 500 }
    )
  }
}

// POST - Claim the invite (after signup/login)
export async function POST(request, { params }) {
  try {
    const { token } = await params
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'You must be logged in to claim this invite' }, { status: 401 })
    }

    const serviceClient = getServiceClient()

    // Get the invite with all data
    const { data: invite, error: inviteError } = await serviceClient
      .from('pending_invites')
      .select('id, email, full_name, keywords, total_keywords, resume_url, extracted_profile, expires_at, claimed_at')
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 410 })
    }

    // Check if already claimed
    if (invite.claimed_at) {
      return NextResponse.json({ error: 'Invite has already been claimed' }, { status: 410 })
    }

    // Verify email matches (optional - could allow any user to claim)
    // For now, let's allow claiming if email matches or is close
    const userEmail = user.email?.toLowerCase()
    const inviteEmail = invite.email?.toLowerCase()

    if (userEmail !== inviteEmail) {
      return NextResponse.json({
        error: `This invite is for ${invite.email}. Please sign up with that email address.`
      }, { status: 403 })
    }

    // Update user profile with invite data and mark onboarding complete
    const profileUpdates = {
      onboarding_completed: true  // Skip onboarding since we have their data
    }

    // Copy basic fields
    if (invite.full_name) {
      profileUpdates.full_name = invite.full_name
    }
    if (invite.resume_url) {
      profileUpdates.resume_url = invite.resume_url
    }

    // Copy extracted profile data if available
    const ep = invite.extracted_profile
    if (ep) {
      if (ep.job_title) profileUpdates.job_title = ep.job_title
      if (ep.company) profileUpdates.company = ep.company
      if (ep.location) profileUpdates.location = ep.location
      if (ep.bio) profileUpdates.bio = ep.bio
      if (ep.linkedin_url) profileUpdates.linkedin_url = ep.linkedin_url
      if (ep.github_url) profileUpdates.github_url = ep.github_url
      if (ep.website) profileUpdates.website = ep.website
      if (ep.phone_number) profileUpdates.phone_number = ep.phone_number
    }

    await serviceClient
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)

    // Create or update keyword profile
    if (invite.keywords && invite.keywords.length > 0) {
      const { data: existingKeywords } = await serviceClient
        .from('keyword_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingKeywords) {
        // Update existing
        await serviceClient
          .from('keyword_profiles')
          .update({
            keywords: invite.keywords,
            total_keywords: invite.total_keywords,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', user.id)
      } else {
        // Create new
        await serviceClient
          .from('keyword_profiles')
          .insert({
            user_id: user.id,
            keywords: invite.keywords,
            total_keywords: invite.total_keywords
          })
      }
    }

    // Mark invite as claimed
    await serviceClient
      .from('pending_invites')
      .update({
        claimed_at: new Date().toISOString(),
        claimed_by: user.id
      })
      .eq('id', invite.id)

    return NextResponse.json({
      success: true,
      message: 'Invite claimed successfully! Your DNA profile has been created.',
      keywordsCopied: invite.keywords?.length || 0
    })
  } catch (error) {
    console.error('Error claiming invite:', error)
    return NextResponse.json(
      { error: 'Failed to claim invite: ' + error.message },
      { status: 500 }
    )
  }
}
