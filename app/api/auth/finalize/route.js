import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/welcome'

function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function claimPendingInvite(userId, userEmail) {
  const serviceClient = getServiceClient()

  const { data: invite } = await serviceClient
    .from('pending_invites')
    .select('*')
    .eq('email', userEmail.toLowerCase())
    .is('claimed_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invite) return null

  const profileUpdates = { onboarding_completed: true }

  if (invite.full_name) profileUpdates.full_name = invite.full_name
  if (invite.resume_url) profileUpdates.resume_url = invite.resume_url

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

  await serviceClient.from('profiles').update(profileUpdates).eq('id', userId)

  if (invite.keywords && invite.keywords.length > 0) {
    const { data: existingKeywords } = await serviceClient
      .from('keyword_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existingKeywords) {
      await serviceClient
        .from('keyword_profiles')
        .update({
          keywords: invite.keywords,
          total_keywords: invite.total_keywords,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', userId)
    } else {
      await serviceClient.from('keyword_profiles').insert({
        user_id: userId,
        keywords: invite.keywords,
        total_keywords: invite.total_keywords,
      })
    }
  }

  await serviceClient
    .from('pending_invites')
    .update({ claimed_at: new Date().toISOString(), claimed_by: userId })
    .eq('id', invite.id)

  return invite
}

export async function POST() {
  try {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ redirectTo: '/login?error=auth_callback_error' })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  // New user — create profile
  if (profileError && profileError.code === 'PGRST116') {
    const serviceClient = getServiceClient()

    const { error: insertError } = await serviceClient.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      onboarding_completed: false,
    })

    if (insertError) {
      return NextResponse.json({ redirectTo: '/login?error=profile_creation_failed' })
    }

    const claimedInvite = await claimPendingInvite(user.id, user.email)
    if (claimedInvite) {
      return NextResponse.json({ redirectTo: '/dna' })
    }

    sendWelcomeEmail(
      user.email,
      user.user_metadata?.full_name || user.user_metadata?.name
    ).catch(err => console.error('Welcome email failed:', err))

    return NextResponse.json({ redirectTo: '/onboarding' })
  }

  // Existing user — check pending invite if onboarding incomplete
  if (!profile?.onboarding_completed) {
    const claimedInvite = await claimPendingInvite(user.id, user.email)
    if (claimedInvite) {
      return NextResponse.json({ redirectTo: '/dna' })
    }
  }

  return NextResponse.json({
    redirectTo: profile?.onboarding_completed ? '/dashboard' : '/onboarding',
  })
  } catch (err) {
    console.error('Auth finalize error:', err)
    return NextResponse.json({ redirectTo: '/dashboard' })
  }
}
