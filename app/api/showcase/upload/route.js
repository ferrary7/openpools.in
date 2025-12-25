import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(7)
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${timestamp}-${randomId}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('showcase-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Supabase storage error:', error)
      return NextResponse.json(
        { error: 'Failed to upload image: ' + error.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from('showcase-images')
      .getPublicUrl(data.path)

    return NextResponse.json({
      url: publicUrl.publicUrl,
      path: data.path,
      message: 'Image uploaded successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image: ' + error.message },
      { status: 500 }
    )
  }
}
