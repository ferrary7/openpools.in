import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateUsernameFormat } from '@/lib/username'

// GET - Check if username is available
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      )
    }

    // Validate format first
    const validation = validateUsernameFormat(username)
    if (!validation.valid) {
      return NextResponse.json({
        available: false,
        error: validation.error
      })
    }

    const supabase = await createClient()

    // Check if username exists in database
    const { data: existingUser, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', validation.normalized)
      .maybeSingle()

    if (error) {
      console.error('Error checking username:', error)
      return NextResponse.json(
        { error: 'Failed to check username availability' },
        { status: 500 }
      )
    }

    const available = !existingUser

    return NextResponse.json({
      available,
      username: validation.normalized,
      ...(available ? {} : { error: 'Username is already taken' })
    })
  } catch (error) {
    console.error('Error in username check:', error)
    return NextResponse.json(
      { error: 'Failed to check username: ' + error.message },
      { status: 500 }
    )
  }
}
