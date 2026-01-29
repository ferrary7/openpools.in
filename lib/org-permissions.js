/**
 * Organization Role-Based Permissions
 * Defines roles and permission checks for organization access control
 */

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  RECRUITER: 'recruiter',
  VIEWER: 'viewer'
}

export const ROLE_HIERARCHY = {
  [ROLES.OWNER]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.RECRUITER]: 2,
  [ROLES.VIEWER]: 1
}

export const PERMISSIONS = {
  // Dashboard & viewing
  VIEW_DASHBOARD: [ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.VIEWER],
  VIEW_ANALYTICS: [ROLES.OWNER, ROLES.ADMIN],

  // Candidate management
  VIEW_CANDIDATES: [ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.VIEWER],
  MANAGE_CANDIDATES: [ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER],
  UPLOAD_CANDIDATES: [ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER],
  DELETE_CANDIDATES: [ROLES.OWNER, ROLES.ADMIN],

  // Search & matching
  RUN_SEARCH: [ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER],
  VIEW_SEARCH_HISTORY: [ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.VIEWER],
  SAVE_SEARCH: [ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER],

  // OpenPools integration
  VIEW_OPENPOOLS: [ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER],

  // Job descriptions
  VIEW_JOBS: [ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.VIEWER],
  MANAGE_JOBS: [ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER],

  // Team management
  VIEW_MEMBERS: [ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.VIEWER],
  MANAGE_MEMBERS: [ROLES.OWNER, ROLES.ADMIN],
  INVITE_MEMBERS: [ROLES.OWNER, ROLES.ADMIN],
  REMOVE_MEMBERS: [ROLES.OWNER, ROLES.ADMIN],

  // Organization settings
  VIEW_SETTINGS: [ROLES.OWNER, ROLES.ADMIN],
  MANAGE_SETTINGS: [ROLES.OWNER, ROLES.ADMIN],
  DELETE_ORGANIZATION: [ROLES.OWNER]
}

/**
 * Check if a role has a specific permission
 * @param {string} userRole - User's role in the organization
 * @param {string|string[]} permission - Permission key OR array of allowed roles
 * @returns {boolean}
 */
export function hasPermission(userRole, permission) {
  // If permission is already an array of roles, use it directly
  const allowedRoles = Array.isArray(permission) ? permission : PERMISSIONS[permission]
  if (!allowedRoles) {
    console.warn(`Unknown permission: ${permission}`)
    return false
  }
  return allowedRoles.includes(userRole)
}

/**
 * Check if role A is higher or equal to role B in hierarchy
 * @param {string} roleA - First role
 * @param {string} roleB - Second role
 * @returns {boolean}
 */
export function isRoleHigherOrEqual(roleA, roleB) {
  return (ROLE_HIERARCHY[roleA] || 0) >= (ROLE_HIERARCHY[roleB] || 0)
}

/**
 * Get all permissions for a role
 * @param {string} role - Role to get permissions for
 * @returns {string[]} Array of permission keys
 */
export function getPermissionsForRole(role) {
  return Object.entries(PERMISSIONS)
    .filter(([_, roles]) => roles.includes(role))
    .map(([permission]) => permission)
}

/**
 * Verify user has permission for an organization action
 * Throws error if permission denied
 * @param {object} supabase - Supabase client
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @param {string} permission - Permission to check
 * @returns {Promise<{role: string, membership: object}>}
 */
export async function requireOrgPermission(supabase, orgId, userId, permission) {
  const { data: membership, error } = await supabase
    .from('organization_members')
    .select('id, role, organization_id, user_id, is_active')
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error || !membership) {
    throw new Error('Not a member of this organization')
  }

  if (!hasPermission(membership.role, permission)) {
    const allowedRoles = Array.isArray(permission) ? permission : PERMISSIONS[permission]
    throw new Error(`Insufficient permissions: requires ${allowedRoles?.join(' or ') || 'unknown permission'}`)
  }

  return { role: membership.role, membership }
}

/**
 * Get user's membership in an organization
 * @param {object} supabase - Supabase client
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @returns {Promise<object|null>}
 */
export async function getOrgMembership(supabase, orgId, userId) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('id, role, organization_id, user_id, is_active, invited_at, created_at')
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data
}

/**
 * Check if user is a member of an organization (by slug)
 * @param {object} supabase - Supabase client
 * @param {string} slug - Organization slug
 * @param {string} userId - User ID
 * @returns {Promise<{isMember: boolean, role: string|null, orgId: string|null}>}
 */
export async function checkOrgMembershipBySlug(supabase, slug, userId) {
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (orgError || !org) {
    return { isMember: false, role: null, orgId: null }
  }

  const { data: membership, error: memberError } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', org.id)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (memberError || !membership) {
    return { isMember: false, role: null, orgId: org.id }
  }

  return { isMember: true, role: membership.role, orgId: org.id }
}
