import { createClient } from '@/lib/supabase/server'

export async function GET(req, { params }) {
  try {
    const supabase = await createClient()

    // Check admin authorization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { userId } = await params

    // Fetch user's keywords
    const { data: keywordProfile, error } = await supabase
      .from('keyword_profiles')
      .select('keywords, total_keywords, last_updated')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching keywords:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({
      keywords: keywordProfile?.keywords || [],
      total: keywordProfile?.total_keywords || 0,
      lastUpdated: keywordProfile?.last_updated || null
    })
  } catch (error) {
    console.error('Keywords fetch error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
