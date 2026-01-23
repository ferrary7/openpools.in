import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Cookie options for session persistence (7 days)
const cookieOptions = {
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
}

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Merge default cookie options with Supabase options
            const mergedOptions = { ...cookieOptions, ...options }
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, mergedOptions)
          })
        },
      },
    }
  )

  // Refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check admin route access
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Get user role from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Only admins can access /admin routes
    if (error || !profile || profile.role !== 'admin') {
      // Redirect non-admins to dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Protect other routes
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/auth/callback') &&
    !request.nextUrl.pathname.startsWith('/api/auth/callback') &&
    !request.nextUrl.pathname.startsWith('/api/companies') &&
    !request.nextUrl.pathname.startsWith('/dna') &&
    !request.nextUrl.pathname.startsWith('/about') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
