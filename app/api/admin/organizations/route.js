import { createClient } from '@/lib/supabase/server'

export async function GET(req) {
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

    // Get all organizations with member counts
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        slug,
        description,
        website,
        industry,
        size,
        is_active,
        subscription_tier,
        created_at,
        organization_members (
          id,
          role,
          user_id,
          profiles:user_id (
            full_name,
            email
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (orgError) {
      console.error('Error fetching organizations:', orgError)
      return Response.json({ error: orgError.message }, { status: 500 })
    }

    // Get users with org creation permission
    const { data: whitelistedUsers, error: whitelistError } = await supabase
      .from('profiles')
      .select('id, full_name, email, can_create_org, created_at')
      .eq('can_create_org', true)
      .order('created_at', { ascending: false })

    if (whitelistError) {
      console.error('Error fetching whitelisted users:', whitelistError)
    }

    // Calculate stats
    const stats = {
      totalOrgs: organizations?.length || 0,
      activeOrgs: organizations?.filter(o => o.is_active).length || 0,
      totalMembers: organizations?.reduce((acc, org) => acc + (org.organization_members?.length || 0), 0) || 0,
      whitelistedUsers: whitelistedUsers?.length || 0
    }

    return Response.json({
      organizations: organizations || [],
      whitelistedUsers: whitelistedUsers || [],
      stats
    })
  } catch (error) {
    console.error('Organizations admin error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// Grant org creation permission to users
export async function POST(req) {
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

    const body = await req.json()
    const { emails } = body

    if (!emails) {
      return Response.json({ error: 'Emails are required' }, { status: 400 })
    }

    // Parse emails (comma or newline separated)
    const emailList = emails
      .split(/[,\n]/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e && e.includes('@'))

    if (emailList.length === 0) {
      return Response.json({ error: 'No valid emails provided' }, { status: 400 })
    }

    // Update profiles
    const results = {
      updated: [],
      notFound: []
    }

    for (const email of emailList) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ can_create_org: true })
        .eq('email', email)
        .select('id, email, full_name')
        .single()

      if (error || !data) {
        results.notFound.push(email)
      } else {
        results.updated.push(data)
      }
    }

    return Response.json({
      success: true,
      updated: results.updated.length,
      notFound: results.notFound,
      details: results
    })
  } catch (error) {
    console.error('Grant org permission error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// Revoke org creation permission
export async function DELETE(req) {
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

    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('profiles')
      .update({ can_create_org: false })
      .eq('id', userId)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Revoke org permission error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
