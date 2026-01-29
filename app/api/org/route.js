import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserOrganizations, createOrganization } from '@/lib/organizations'

/**
 * GET /api/org
 * List all organizations the current user belongs to
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizations = await getUserOrganizations(supabase, user.id)

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/org
 * Create a new organization
 * Body: { name, slug, description?, website?, industry?, size?, logo_url? }
 */
export async function POST(request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create organizations
    const { data: profile } = await supabase
      .from('profiles')
      .select('can_create_org, role')
      .eq('id', user.id)
      .single()

    if (!profile?.can_create_org && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to create organizations' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, slug, description, website, industry, size, logo_url } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Validate slug length
    if (slug.length < 3 || slug.length > 50) {
      return NextResponse.json(
        { error: 'Slug must be between 3 and 50 characters' },
        { status: 400 }
      )
    }

    const { organization, error } = await createOrganization(
      supabase,
      { name, slug, description, website, industry, size, logo_url },
      user.id
    )

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ organization }, { status: 201 })
  } catch (error) {
    console.error('Error creating organization:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
