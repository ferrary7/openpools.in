import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { isUUID } from '@/lib/username'

// Service client for public DNA access (bypasses RLS)
function getServiceClient() {
  return createClient(
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

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const supabase = getServiceClient()

    // Determine if identifier is UUID or username
    const isId = isUUID(id)

    // Load profile - query by ID or username
    let profileQuery = supabase
      .from('profiles')
      .select('id, username, full_name, email, job_title, company, location, bio, linkedin_url, website, is_premium, created_at, profile_picture_url')

    if (isId) {
      profileQuery = profileQuery.eq('id', id)
    } else {
      profileQuery = profileQuery.eq('username', id)
    }

    const { data: profile, error: profileError } = await profileQuery.single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Load keywords
    const { data: keywordProfile } = await supabase
      .from('keyword_profiles')
      .select('keywords, total_keywords, last_updated')
      .eq('user_id', profile.id)
      .single()

    // Load collaboration count (not full details for privacy)
    const { count: collaborationCount } = await supabase
      .from('collaborations')
      .select('*', { count: 'exact', head: true })
      .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
      .eq('status', 'accepted')

    // Load showcase items
    const { data: showcaseItems } = await supabase
      .from('showcase_items')
      .select('*')
      .eq('user_id', profile.id)
      .order('display_order', { ascending: true })

    return NextResponse.json({
      profile,
      keywordProfile,
      collaborationCount: collaborationCount || 0,
      showcaseItems: showcaseItems || []
    })
  } catch (error) {
    console.error('Error fetching DNA:', error)
    return NextResponse.json(
      { error: 'Failed to fetch DNA' },
      { status: 500 }
    )
  }
}
