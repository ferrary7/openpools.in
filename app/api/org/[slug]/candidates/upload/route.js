import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getOrganizationBySlug } from '@/lib/organizations'
import { processResumeUpload } from '@/lib/org-candidates'
import { requireOrgPermission, PERMISSIONS } from '@/lib/org-permissions'
import pdf from 'pdf-parse-fork'

/**
 * POST /api/org/[slug]/candidates/upload
 * Upload and parse a resume PDF to create a candidate
 */
export async function POST(request, { params }) {
  try {
    const supabase = await createClient()
    const { slug } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization
    const org = await getOrganizationBySlug(supabase, slug)
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check permission
    try {
      await requireOrgPermission(supabase, org.id, user.id, PERMISSIONS.UPLOAD_CANDIDATES)
    } catch (permError) {
      return NextResponse.json({ error: permError.message }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('resume')

    if (!file) {
      return NextResponse.json({ error: 'Resume file is required' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Read and parse PDF
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let resumeText
    try {
      const pdfData = await pdf(buffer)
      resumeText = pdfData.text
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError)
      return NextResponse.json({ error: 'Failed to parse PDF file' }, { status: 400 })
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({ error: 'Could not extract text from PDF. The file might be empty or scanned.' }, { status: 400 })
    }

    // Upload PDF to storage
    const serviceClient = createServiceClient()
    const fileName = `${org.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const { data: uploadData, error: uploadError } = await serviceClient
      .storage
      .from('org-resumes')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      // Continue without storing the file - we still have the text
    }

    // Get public URL for the uploaded file
    let resumeUrl = null
    if (uploadData) {
      const { data: urlData } = serviceClient
        .storage
        .from('org-resumes')
        .getPublicUrl(fileName)
      resumeUrl = urlData?.publicUrl
    }

    // Process resume and create candidate
    const { candidate, keywords, error } = await processResumeUpload(
      supabase,
      org.id,
      resumeText,
      resumeUrl,
      user.id
    )

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({
      candidate,
      keywords,
      message: 'Resume uploaded and processed successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading resume:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
