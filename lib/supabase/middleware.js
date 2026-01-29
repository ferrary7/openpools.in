import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Service client for middleware auth checks (bypasses RLS)
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

  // Check organization route access
  if (request.nextUrl.pathname.startsWith('/org/')) {
    // Require authentication for all /org routes
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Extract org slug from path: /org/[slug]/...
    const pathParts = request.nextUrl.pathname.split('/')
    const orgSlug = pathParts[2]

    // Skip membership check for /org, /org/new, /org/join
    if (orgSlug && !['new', 'join'].includes(orgSlug)) {
      // Use service client for auth checks (bypasses RLS)
      const serviceClient = getServiceClient()

      // Verify organization exists
      const { data: org, error: orgError } = await serviceClient
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .eq('is_active', true)
        .single()

      if (orgError || !org) {
        // Organization not found
        const url = request.nextUrl.clone()
        url.pathname = '/org'
        return NextResponse.redirect(url)
      }

      // Verify user is a member
      const { data: membership, error: memberError } = await serviceClient
        .from('organization_members')
        .select('role')
        .eq('organization_id', org.id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (memberError || !membership) {
        // User is not a member of this organization
        const url = request.nextUrl.clone()
        url.pathname = '/org'
        return NextResponse.redirect(url)
      }

      // Set org context headers for downstream use
      supabaseResponse.headers.set('x-org-id', org.id)
      supabaseResponse.headers.set('x-org-role', membership.role)
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
    !request.nextUrl.pathname.startsWith('/api/org/invite/') &&
    !request.nextUrl.pathname.startsWith('/dna') &&
    !request.nextUrl.pathname.startsWith('/about') &&
    !request.nextUrl.pathname.startsWith('/org/join/') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
