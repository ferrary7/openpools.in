import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { extractCompleteProfile } from '@/lib/gemini'
import { sendDNAInviteEmail } from '@/lib/email/welcome'
import crypto from 'crypto'

// Service client for admin operations
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

// Parse PDF
async function parsePDF(buffer) {
  const pdfParse = (await import('pdf-parse-fork')).default
  const data = await pdfParse(buffer)
  return data.text
}

// GET - List all pending invites
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch all invites
    const serviceClient = getServiceClient()
    const { data: invites, error } = await serviceClient
      .from('pending_invites')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ invites: invites || [] })
  } catch (error) {
    console.error('Error fetching invites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invites: ' + error.message },
      { status: 500 }
    )
  }
}

// POST - Create new invite
export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const email = formData.get('email')
    const fullName = formData.get('full_name')
    const file = formData.get('resume')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const serviceClient = getServiceClient()

    // Check if email already has a pending invite
    const { data: existingInvite } = await serviceClient
      .from('pending_invites')
      .select('id')
      .eq('email', email.toLowerCase())
      .is('claimed_at', null)
      .single()

    if (existingInvite) {
      return NextResponse.json({ error: 'An invite already exists for this email' }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 })
    }

    let keywords = []
    let resumeText = null
    let totalKeywords = 0
    let resumeUrl = null
    let extractedProfile = null

    // Parse resume if provided
    if (file && file.size > 0) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      try {
        resumeText = await parsePDF(buffer)

        if (resumeText && resumeText.trim().length > 0) {
          // Extract keywords AND profile data using Gemini
          const result = await extractCompleteProfile(resumeText, 'pdf')
          keywords = result.keywords || []
          totalKeywords = keywords.length
          extractedProfile = result.profile || null
        }

        // Upload resume to storage
        const sanitizedEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '_')
        const fileName = `invites/${sanitizedEmail}_${Date.now()}.pdf`

        const { error: uploadError } = await serviceClient.storage
          .from('resumes')
          .upload(fileName, buffer, {
            contentType: 'application/pdf',
            upsert: true
          })

        if (!uploadError) {
          const { data: { publicUrl } } = serviceClient.storage
            .from('resumes')
            .getPublicUrl(fileName)
          resumeUrl = publicUrl
        }
      } catch (parseError) {
        console.error('PDF parsing error:', parseError)
        // Continue without resume - still create invite
      }
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex')

    // Set expiry to 30 days
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Use extracted name if not provided in form
    const finalFullName = fullName || extractedProfile?.full_name || null

    // Create the invite
    const { data: invite, error: insertError } = await serviceClient
      .from('pending_invites')
      .insert({
        email: email.toLowerCase(),
        full_name: finalFullName,
        token,
        resume_text: resumeText,
        resume_url: resumeUrl,
        keywords,
        total_keywords: totalKeywords,
        extracted_profile: extractedProfile,
        invited_by: user.id,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Generate invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://openpools.in'
    const inviteUrl = `${baseUrl}/invite/${token}`
    const dnaUrl = `${baseUrl}/dna` // Will be their DNA after signup

    // Send email
    const emailResult = await sendDNAInviteEmail(email, fullName, inviteUrl, dnaUrl)

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        email: invite.email,
        full_name: invite.full_name,
        total_keywords: invite.total_keywords,
        token: invite.token,
        expires_at: invite.expires_at
      },
      emailSent: emailResult.success,
      inviteUrl
    })
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json(
      { error: 'Failed to create invite: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE - Remove an invite
export async function DELETE(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const inviteId = searchParams.get('id')

    if (!inviteId) {
      return NextResponse.json({ error: 'Invite ID required' }, { status: 400 })
    }

    const serviceClient = getServiceClient()
    const { error } = await serviceClient
      .from('pending_invites')
      .delete()
      .eq('id', inviteId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invite:', error)
    return NextResponse.json(
      { error: 'Failed to delete invite: ' + error.message },
      { status: 500 }
    )
  }
}
