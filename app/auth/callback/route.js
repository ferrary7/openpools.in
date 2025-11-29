import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/welcome'

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

          // Send welcome email (non-blocking)
          sendWelcomeEmail(
            user.email,
            user.user_metadata?.full_name || user.user_metadata?.name
          ).catch(err => console.error('Welcome email failed:', err))

          // Redirect to onboarding for new users
          return NextResponse.redirect(`${origin}/onboarding`)
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
