import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { extractCompleteProfile } from '@/lib/gemini'

// Use dynamic import for pdf-parse to avoid build issues
async function parsePDF(buffer) {
  const pdfParse = (await import('pdf-parse-fork')).default
  const data = await pdfParse(buffer)
  return data.text
}

export async function POST(request) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('pdf')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text from PDF
    let text
    try {
      text = await parsePDF(buffer)
    } catch (parseError) {
      console.error('PDF parsing error:', parseError)
      return NextResponse.json({ error: 'Failed to parse PDF. Please try a different file.' }, { status: 400 })
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 })
    }

    // Extract complete profile data and keywords from the text
    const result = await extractCompleteProfile(text, 'pdf')

    return NextResponse.json({
      success: true,
      text: text,
      profile: result.profile,
      keywords: result.keywords,
      wordCount: text.split(/\s+/).length,
    })
  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json(
      { error: 'Failed to process PDF: ' + error.message },
      { status: 500 }
    )
  }
}
