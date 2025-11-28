import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateUsernameFormat } from '@/lib/username'

// POST - Update user's username
export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { username } = body

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Validate format
    const validation = validateUsernameFormat(username)
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error
      }, { status: 400 })
    }

    const normalizedUsername = validation.normalized

    // Check if username is already taken by another user
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', normalizedUsername)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking username:', checkError)
      return NextResponse.json(
        { error: 'Failed to check username availability' },
        { status: 500 }
      )
    }

    // If username exists and it's not the current user, it's taken
    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json({
        success: false,
        error: 'Username is already taken'
      }, { status: 409 })
    }

    // Update the username
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ username: normalizedUsername })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating username:', updateError)

      // Check for unique constraint violation
      if (updateError.code === '23505') {
        return NextResponse.json({
          success: false,
          error: 'Username is already taken'
        }, { status: 409 })
      }

      return NextResponse.json(
        { error: 'Failed to update username: ' + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      username: updatedProfile.username,
      message: 'Username updated successfully'
    })
  } catch (error) {
    console.error('Error in username update:', error)
    return NextResponse.json(
      { error: 'Failed to update username: ' + error.message },
      { status: 500 }
    )
  }
}
