'use client'

import { createClient } from '@/lib/supabase/client'

export async function uploadProfilePicture(file, userId) {
  const supabase = createClient()

  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be less than 5MB')
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    throw error
  }
}

export async function deleteProfilePicture(url) {
  const supabase = createClient()

  try {
    // Extract file path from URL
    const urlParts = url.split('profile-pictures/')
    if (urlParts.length < 2) return

    const filePath = urlParts[1]

    // Delete from storage
    const { error } = await supabase.storage
      .from('profile-pictures')
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting profile picture:', error)
    throw error
  }
}
