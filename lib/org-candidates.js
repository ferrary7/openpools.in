/**
 * Organization Candidate Service
 * Functions for managing candidates uploaded by organizations
 */

import { createServiceClient } from './supabase/server'
import { extractCompleteProfile, extractKeywords } from './gemini'

/**
 * Get all candidates for an organization
 * @param {object} supabase - Supabase client
 * @param {string} orgId - Organization ID
 * @param {object} options - Filter and pagination options
 * @returns {Promise<{candidates: object[], total: number}>}
 */
export async function getCandidatesByOrg(supabase, orgId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status = 'active',
    search = '',
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options

  const serviceClient = createServiceClient()
  const offset = (page - 1) * limit

  let query = serviceClient
    .from('org_candidates')
    .select(`
      *,
      org_candidate_keywords (
        keywords,
        total_keywords
      ),
      uploader:uploaded_by (
        full_name,
        email
      )
    `, { count: 'exact' })
    .eq('organization_id', orgId)

  // Filter by status
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  // Search by name or email
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  // Sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching candidates:', error)
    return { candidates: [], total: 0 }
  }

  return {
    candidates: data || [],
    total: count || 0
  }
}

/**
 * Get a single candidate by ID
 * @param {object} supabase - Supabase client
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<object|null>}
 */
export async function getCandidateById(supabase, candidateId) {
  const serviceClient = createServiceClient()

  const { data, error } = await serviceClient
    .from('org_candidates')
    .select(`
      *,
      org_candidate_keywords (
        keywords,
        total_keywords
      ),
      uploader:uploaded_by (
        full_name,
        email
      )
    `)
    .eq('id', candidateId)
    .single()

  if (error) {
    console.error('Error fetching candidate:', error)
    return null
  }

  return data
}

/**
 * Create a new candidate
 * @param {object} supabase - Supabase client
 * @param {string} orgId - Organization ID
 * @param {object} candidateData - Candidate data
 * @param {string} uploadedBy - User ID who uploaded
 * @returns {Promise<{candidate: object|null, error: string|null}>}
 */
export async function createCandidate(supabase, orgId, candidateData, uploadedBy) {
  const serviceClient = createServiceClient()

  const {
    full_name,
    email,
    phone,
    location,
    job_title,
    resume_url,
    resume_text,
    linkedin_url,
    source = 'upload',
    notes,
    metadata = {}
  } = candidateData

  // Create candidate
  const { data: candidate, error: candidateError } = await serviceClient
    .from('org_candidates')
    .insert({
      organization_id: orgId,
      full_name,
      email: email?.toLowerCase(),
      phone,
      location,
      job_title,
      resume_url,
      resume_text,
      linkedin_url,
      source,
      notes,
      metadata,
      uploaded_by: uploadedBy,
      status: 'active'
    })
    .select()
    .single()

  if (candidateError) {
    console.error('Error creating candidate:', candidateError)
    return { candidate: null, error: 'Failed to create candidate' }
  }

  return { candidate, error: null }
}

/**
 * Update a candidate
 * @param {object} supabase - Supabase client
 * @param {string} candidateId - Candidate ID
 * @param {object} updates - Fields to update
 * @returns {Promise<{candidate: object|null, error: string|null}>}
 */
export async function updateCandidate(supabase, candidateId, updates) {
  const serviceClient = createServiceClient()

  const allowedFields = [
    'full_name', 'email', 'phone', 'location', 'job_title',
    'resume_url', 'resume_text', 'linkedin_url', 'source',
    'status', 'notes', 'metadata'
  ]

  const updateData = {}
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field]
    }
  }

  if (Object.keys(updateData).length === 0) {
    return { candidate: null, error: 'No valid fields to update' }
  }

  const { data: candidate, error } = await serviceClient
    .from('org_candidates')
    .update(updateData)
    .eq('id', candidateId)
    .select()
    .single()

  if (error) {
    console.error('Error updating candidate:', error)
    return { candidate: null, error: 'Failed to update candidate' }
  }

  return { candidate, error: null }
}

/**
 * Archive a candidate (soft delete)
 * @param {object} supabase - Supabase client
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function archiveCandidate(supabase, candidateId) {
  const serviceClient = createServiceClient()

  const { error } = await serviceClient
    .from('org_candidates')
    .update({ status: 'archived' })
    .eq('id', candidateId)

  if (error) {
    console.error('Error archiving candidate:', error)
    return { success: false, error: 'Failed to archive candidate' }
  }

  return { success: true, error: null }
}

/**
 * Delete a candidate permanently
 * @param {object} supabase - Supabase client
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteCandidate(supabase, candidateId) {
  const serviceClient = createServiceClient()

  const { error } = await serviceClient
    .from('org_candidates')
    .delete()
    .eq('id', candidateId)

  if (error) {
    console.error('Error deleting candidate:', error)
    return { success: false, error: 'Failed to delete candidate' }
  }

  return { success: true, error: null }
}

/**
 * Extract and save keywords for a candidate from their resume
 * @param {object} supabase - Supabase client
 * @param {string} candidateId - Candidate ID
 * @param {string} resumeText - Resume text content
 * @returns {Promise<{keywords: object[], error: string|null}>}
 */
export async function extractAndSaveCandidateKeywords(supabase, candidateId, resumeText) {
  const serviceClient = createServiceClient()

  try {
    // Extract profile and keywords using Gemini
    const { profile, keywords } = await extractCompleteProfile(resumeText, 'resume')

    // Update candidate with extracted profile data if available
    if (profile && Object.keys(profile).length > 0) {
      const profileUpdates = {}
      if (profile.full_name && !profile.full_name.includes('null')) profileUpdates.full_name = profile.full_name
      if (profile.job_title) profileUpdates.job_title = profile.job_title
      if (profile.location) profileUpdates.location = profile.location
      if (profile.linkedin_url) profileUpdates.linkedin_url = profile.linkedin_url
      if (profile.phone_number) profileUpdates.phone = profile.phone_number

      if (Object.keys(profileUpdates).length > 0) {
        await serviceClient
          .from('org_candidates')
          .update(profileUpdates)
          .eq('id', candidateId)
      }
    }

    // Upsert keywords
    const { error: keywordError } = await serviceClient
      .from('org_candidate_keywords')
      .upsert({
        candidate_id: candidateId,
        keywords: keywords,
        total_keywords: keywords.length,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'candidate_id'
      })

    if (keywordError) {
      console.error('Error saving candidate keywords:', keywordError)
      return { keywords: [], error: 'Failed to save keywords' }
    }

    return { keywords, error: null }
  } catch (error) {
    console.error('Error extracting candidate keywords:', error)
    return { keywords: [], error: error.message }
  }
}

/**
 * Process a resume upload - create candidate and extract keywords
 * @param {object} supabase - Supabase client
 * @param {string} orgId - Organization ID
 * @param {string} resumeText - Parsed resume text
 * @param {string} resumeUrl - URL to stored resume file
 * @param {string} uploadedBy - User ID who uploaded
 * @returns {Promise<{candidate: object|null, keywords: object[], error: string|null}>}
 */
export async function processResumeUpload(supabase, orgId, resumeText, resumeUrl, uploadedBy) {
  try {
    // Extract profile and keywords
    const { profile, keywords } = await extractCompleteProfile(resumeText, 'resume')

    // Create candidate with extracted data
    const { candidate, error: candidateError } = await createCandidate(
      supabase,
      orgId,
      {
        full_name: profile.full_name || 'Unknown',
        email: profile.email || null,
        phone: profile.phone_number || null,
        location: profile.location || null,
        job_title: profile.job_title || null,
        resume_url: resumeUrl,
        resume_text: resumeText,
        linkedin_url: profile.linkedin_url || null,
        source: 'upload',
        metadata: {
          work_history: profile.work_history || [],
          bio: profile.bio || null
        }
      },
      uploadedBy
    )

    if (candidateError) {
      return { candidate: null, keywords: [], error: candidateError }
    }

    // Save keywords
    const serviceClient = createServiceClient()
    await serviceClient
      .from('org_candidate_keywords')
      .insert({
        candidate_id: candidate.id,
        keywords: keywords,
        total_keywords: keywords.length
      })

    return { candidate, keywords, error: null }
  } catch (error) {
    console.error('Error processing resume upload:', error)
    return { candidate: null, keywords: [], error: error.message }
  }
}

/**
 * Get candidate statistics for an organization
 * @param {object} supabase - Supabase client
 * @param {string} orgId - Organization ID
 * @returns {Promise<object>}
 */
export async function getCandidateStats(supabase, orgId) {
  const serviceClient = createServiceClient()

  const [
    { count: totalCount },
    { count: activeCount },
    { count: archivedCount },
    { count: hiredCount }
  ] = await Promise.all([
    serviceClient
      .from('org_candidates')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId),
    serviceClient
      .from('org_candidates')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'active'),
    serviceClient
      .from('org_candidates')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'archived'),
    serviceClient
      .from('org_candidates')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'hired')
  ])

  return {
    total: totalCount || 0,
    active: activeCount || 0,
    archived: archivedCount || 0,
    hired: hiredCount || 0
  }
}
