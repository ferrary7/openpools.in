/**
 * Organization Service
 * Functions for managing organizations and memberships
 */

import { ROLES } from './org-permissions'
import { createServiceClient } from './supabase/server'

/**
 * Get organization by slug
 * @param {object} supabase - Supabase client
 * @param {string} slug - Organization slug
 * @returns {Promise<object|null>}
 */
export async function getOrganizationBySlug(supabase, slug) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data
}

/**
 * Get organization by ID
 * @param {object} supabase - Supabase client
 * @param {string} orgId - Organization ID
 * @returns {Promise<object|null>}
 */
export async function getOrganizationById(supabase, orgId) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()

  if (error) return null
  return data
}

/**
 * Get all organizations a user belongs to
 * @param {object} supabase - Supabase client
 * @param {string} userId - User ID
 * @returns {Promise<object[]>}
 */
export async function getUserOrganizations(supabase, userId) {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      id,
      role,
      is_active,
      invited_at,
      created_at,
      organizations (
        id,
        slug,
        name,
        logo_url,
        description,
        website,
        industry,
        size,
        subscription_tier,
        is_active,
        created_at
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user organizations:', error)
    return []
  }

  // Filter out inactive organizations and flatten
  return data
    .filter(m => m.organizations?.is_active)
    .map(m => ({
      ...m.organizations,
      memberRole: m.role,
      memberSince: m.created_at
    }))
}

/**
 * Create a new organization
 * @param {object} supabase - Supabase client
 * @param {object} data - Organization data
 * @param {string} ownerId - User ID of the owner
 * @returns {Promise<{organization: object|null, error: string|null}>}
 */
export async function createOrganization(supabase, data, ownerId) {
  const { name, slug, description, website, industry, size, logo_url } = data

  // Validate slug format
  const slugRegex = /^[a-z0-9-]+$/
  if (!slugRegex.test(slug)) {
    return {
      organization: null,
      error: 'Slug can only contain lowercase letters, numbers, and hyphens'
    }
  }

  // Use service client for all org operations (bypasses RLS)
  // This is safe because we've already verified the user is authenticated
  const serviceClient = createServiceClient()

  // Check if slug is already taken
  const { data: existing } = await serviceClient
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    return { organization: null, error: 'Organization slug is already taken' }
  }

  // Create organization
  const { data: org, error: orgError } = await serviceClient
    .from('organizations')
    .insert({
      name,
      slug,
      description: description || null,
      website: website || null,
      industry: industry || null,
      size: size || null,
      logo_url: logo_url || null
    })
    .select()
    .single()

  if (orgError) {
    console.error('Error creating organization:', orgError)
    return { organization: null, error: 'Failed to create organization' }
  }

  // Add owner as member
  const { error: memberError } = await serviceClient
    .from('organization_members')
    .insert({
      organization_id: org.id,
      user_id: ownerId,
      role: ROLES.OWNER,
      invited_by: ownerId
    })

  if (memberError) {
    console.error('Error adding owner as member:', memberError)
    // Rollback organization creation
    await serviceClient.from('organizations').delete().eq('id', org.id)
    return { organization: null, error: 'Failed to set up organization membership' }
  }

  return { organization: org, error: null }
}

/**
 * Update organization details
 * @param {object} supabase - Supabase client
 * @param {string} orgId - Organization ID
 * @param {object} data - Fields to update
 * @returns {Promise<{organization: object|null, error: string|null}>}
 */
export async function updateOrganization(supabase, orgId, data) {
  const allowedFields = ['name', 'description', 'website', 'industry', 'size', 'logo_url', 'settings']
  const updateData = {}

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field]
    }
  }

  if (Object.keys(updateData).length === 0) {
    return { organization: null, error: 'No valid fields to update' }
  }

  const { data: org, error } = await supabase
    .from('organizations')
    .update(updateData)
    .eq('id', orgId)
    .select()
    .single()

  if (error) {
    console.error('Error updating organization:', error)
    return { organization: null, error: 'Failed to update organization' }
  }

  return { organization: org, error: null }
}

/**
 * Soft delete organization (set is_active to false)
 * @param {object} supabase - Supabase client
 * @param {string} orgId - Organization ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteOrganization(supabase, orgId) {
  const { error } = await supabase
    .from('organizations')
    .update({ is_active: false })
    .eq('id', orgId)

  if (error) {
    console.error('Error deleting organization:', error)
    return { success: false, error: 'Failed to delete organization' }
  }

  return { success: true, error: null }
}

/**
 * Get organization members
 * @param {object} supabase - Supabase client
 * @param {string} orgId - Organization ID
 * @returns {Promise<object[]>}
 */
export async function getOrganizationMembers(supabase, orgId) {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      id,
      role,
      is_active,
      invited_at,
      created_at,
      invited_by,
      profiles:user_id (
        id,
        email,
        full_name,
        job_title,
        company,
        location
      )
    `)
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching organization members:', error)
    return []
  }

  return data.map(m => ({
    id: m.id,
    role: m.role,
    invitedAt: m.invited_at,
    joinedAt: m.created_at,
    invitedBy: m.invited_by,
    user: m.profiles
  }))
}

/**
 * Update member role
 * @param {object} supabase - Supabase client
 * @param {string} memberId - Member record ID
 * @param {string} newRole - New role to assign
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function updateMemberRole(supabase, memberId, newRole) {
  if (!Object.values(ROLES).includes(newRole)) {
    return { success: false, error: 'Invalid role' }
  }

  const { error } = await supabase
    .from('organization_members')
    .update({ role: newRole })
    .eq('id', memberId)

  if (error) {
    console.error('Error updating member role:', error)
    return { success: false, error: 'Failed to update member role' }
  }

  return { success: true, error: null }
}

/**
 * Remove member from organization
 * @param {object} supabase - Supabase client
 * @param {string} memberId - Member record ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function removeMember(supabase, memberId) {
  // Soft delete - set is_active to false
  const { error } = await supabase
    .from('organization_members')
    .update({ is_active: false })
    .eq('id', memberId)

  if (error) {
    console.error('Error removing member:', error)
    return { success: false, error: 'Failed to remove member' }
  }

  return { success: true, error: null }
}

/**
 * Generate a unique invitation token
 * @returns {string}
 */
function generateInvitationToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

/**
 * Create an invitation to join organization
 * @param {object} supabase - Supabase client
 * @param {string} orgId - Organization ID
 * @param {string} email - Email to invite
 * @param {string} role - Role to assign
 * @param {string} invitedBy - User ID of inviter
 * @returns {Promise<{invitation: object|null, error: string|null}>}
 */
export async function createInvitation(supabase, orgId, email, role, invitedBy) {
  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .eq('profiles.email', email)
    .single()

  if (existingMember) {
    return { invitation: null, error: 'User is already a member' }
  }

  // Check for existing pending invitation
  const { data: existingInvite } = await supabase
    .from('org_invitations')
    .select('id')
    .eq('organization_id', orgId)
    .eq('email', email.toLowerCase())
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (existingInvite) {
    return { invitation: null, error: 'Invitation already sent to this email' }
  }

  const token = generateInvitationToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

  const { data: invitation, error } = await supabase
    .from('org_invitations')
    .insert({
      organization_id: orgId,
      email: email.toLowerCase(),
      role,
      token,
      invited_by: invitedBy,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating invitation:', error)
    return { invitation: null, error: 'Failed to create invitation' }
  }

  return { invitation, error: null }
}

/**
 * Get invitation by token
 * @param {object} supabase - Supabase client (unused, kept for API compatibility)
 * @param {string} token - Invitation token
 * @returns {Promise<object|null>}
 */
export async function getInvitationByToken(supabase, token) {
  // Use service client to bypass RLS (invitee isn't a member yet)
  const serviceClient = createServiceClient()

  const { data, error } = await serviceClient
    .from('org_invitations')
    .select(`
      *,
      organizations (
        id,
        name,
        slug,
        logo_url
      ),
      profiles:invited_by (
        full_name,
        email
      )
    `)
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error) {
    console.error('Error fetching invitation:', error)
    return null
  }
  return data
}

/**
 * Accept an invitation
 * @param {object} supabase - Supabase client
 * @param {string} token - Invitation token
 * @param {string} userId - User ID accepting the invitation
 * @returns {Promise<{success: boolean, organization: object|null, error: string|null}>}
 */
export async function acceptInvitation(supabase, token, userId) {
  const invitation = await getInvitationByToken(supabase, token)

  if (!invitation) {
    return { success: false, organization: null, error: 'Invalid or expired invitation' }
  }

  // Use service client for member operations (bypasses RLS)
  const serviceClient = createServiceClient()

  // Check if user is already a member
  const { data: existingMember } = await serviceClient
    .from('organization_members')
    .select('id')
    .eq('organization_id', invitation.organization_id)
    .eq('user_id', userId)
    .single()

  if (existingMember) {
    return { success: false, organization: null, error: 'Already a member of this organization' }
  }

  // Add user as member
  const { error: memberError } = await serviceClient
    .from('organization_members')
    .insert({
      organization_id: invitation.organization_id,
      user_id: userId,
      role: invitation.role,
      invited_by: invitation.invited_by
    })

  if (memberError) {
    console.error('Error adding member:', memberError)
    return { success: false, organization: null, error: 'Failed to join organization' }
  }

  // Mark invitation as accepted
  await serviceClient
    .from('org_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)

  return { success: true, organization: invitation.organizations, error: null }
}

/**
 * Get organization statistics
 * @param {object} supabase - Supabase client
 * @param {string} orgId - Organization ID
 * @returns {Promise<object>}
 */
export async function getOrganizationStats(supabase, orgId) {
  const [
    { count: memberCount },
    { count: candidateCount },
    { count: jobCount },
    { count: searchCount }
  ] = await Promise.all([
    supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('is_active', true),
    supabase
      .from('org_candidates')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'active'),
    supabase
      .from('org_job_descriptions')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('is_active', true),
    supabase
      .from('org_searches')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
  ])

  return {
    members: memberCount || 0,
    candidates: candidateCount || 0,
    activeJobs: jobCount || 0,
    totalSearches: searchCount || 0
  }
}
