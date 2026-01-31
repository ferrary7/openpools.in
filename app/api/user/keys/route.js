import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isUUID } from '@/lib/username'

/**
 * GET /api/user/keys?userId=<uuid or username>
 * Get a user's public key for encryption
 */
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const identifier = searchParams.get('userId')

    if (!identifier) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Verify requester is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get public key - handle both UUID and username
    let query = supabase
      .from('profiles')
      .select('id, public_key')

    if (isUUID(identifier)) {
      query = query.eq('id', identifier)
    } else {
      query = query.eq('username', identifier)
    }

    const { data: profile, error } = await query.single()

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      userId: profile.id,
      publicKey: profile.public_key,
      hasKey: !!profile.public_key
    })
  } catch (error) {
    console.error('Error fetching public key:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/user/keys
 * Store user's public key (called when generating new key pair)
 */
export async function POST(request) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { publicKey } = await request.json()

    if (!publicKey) {
      return NextResponse.json({ error: 'publicKey required' }, { status: 400 })
    }

    // Check if user already has a public key
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('public_key')
      .eq('id', user.id)
      .single()

    if (existingProfile?.public_key) {
      // User already has a key - don't overwrite (prevents key replacement attacks)
      return NextResponse.json({
        success: true,
        message: 'Public key already exists',
        existed: true
      })
    }

    // Store public key
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ public_key: publicKey })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error storing public key:', updateError)
      return NextResponse.json({ error: 'Failed to store public key' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Public key stored successfully',
      existed: false
    })
  } catch (error) {
    console.error('Error storing public key:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/user/keys
 * Clear user's public key (for key rotation - requires new key to be set after)
 */
export async function DELETE(request) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear public key
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ public_key: null })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error clearing public key:', updateError)
      return NextResponse.json({ error: 'Failed to clear public key' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Public key cleared'
    })
  } catch (error) {
    console.error('Error clearing public key:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
