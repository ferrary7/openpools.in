import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/welcome'

// Service client for invite operations
function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Auto-claim pending invite for user
async function claimPendingInvite(userId, userEmail) {
  const serviceClient = getServiceClient()

  // Check for pending invite with this email
  const { data: invite } = await serviceClient
    .from('pending_invites')
    .select('*')
    .eq('email', userEmail.toLowerCase())
    .is('claimed_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invite) return null

  // Update profile with invite data and extracted profile
  const profileUpdates = { onboarding_completed: true }

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
    .eq('id', userId)

  // Copy keywords if available
  if (invite.keywords && invite.keywords.length > 0) {
    const { data: existingKeywords } = await serviceClient
      .from('keyword_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingKeywords) {
      await serviceClient
        .from('keyword_profiles')
        .update({
          keywords: invite.keywords,
          total_keywords: invite.total_keywords,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId)
    } else {
      await serviceClient
        .from('keyword_profiles')
        .insert({
          user_id: userId,
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
      claimed_by: userId
    })
    .eq('id', invite.id)

  return invite
}

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the user
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if profile exists, create if not
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        // Create profile if it doesn't exist
        if (profileError && profileError.code === 'PGRST116') {
          await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              onboarding_completed: false,
            })

          // Check for pending invite and auto-claim
          const claimedInvite = await claimPendingInvite(user.id, user.email)

          if (claimedInvite) {
            // Invite claimed - skip onboarding, go to DNA
            return NextResponse.redirect(`${origin}/dna`)
          }

          // Send welcome email (non-blocking)
          sendWelcomeEmail(
            user.email,
            user.user_metadata?.full_name || user.user_metadata?.name
          ).catch(err => console.error('Welcome email failed:', err))

          // Redirect to onboarding for new users
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        // For existing users, also check for pending invite
        if (!profile?.onboarding_completed) {
          const claimedInvite = await claimPendingInvite(user.id, user.email)
          if (claimedInvite) {
            return NextResponse.redirect(`${origin}/dna`)
          }
        }

        // Redirect to onboarding if not completed, otherwise to dashboard
        if (profile?.onboarding_completed) {
          return NextResponse.redirect(`${origin}/dashboard`)
        } else {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
