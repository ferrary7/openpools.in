-- ============================================
-- RLS FIX: Resolve infinite recursion
-- Run this AFTER the main migration
-- Safe to run multiple times (idempotent)
-- ============================================

-- Drop ALL existing policies (old and new names)
-- Organizations
DROP POLICY IF EXISTS "Org members can view organization" ON public.organizations;
DROP POLICY IF EXISTS "Org owners can update organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Members view organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admins update organizations" ON public.organizations;

-- Organization members
DROP POLICY IF EXISTS "Org members can view members" ON public.organization_members;
DROP POLICY IF EXISTS "Org admins can add members" ON public.organization_members;
DROP POLICY IF EXISTS "Org admins can update members" ON public.organization_members;
DROP POLICY IF EXISTS "Users view own membership" ON public.organization_members;
DROP POLICY IF EXISTS "Members view org members" ON public.organization_members;
DROP POLICY IF EXISTS "Admins add members" ON public.organization_members;
DROP POLICY IF EXISTS "Admins update members" ON public.organization_members;
DROP POLICY IF EXISTS "Admins delete members" ON public.organization_members;

-- Org candidates
DROP POLICY IF EXISTS "Org members can view candidates" ON public.org_candidates;
DROP POLICY IF EXISTS "Recruiters can insert candidates" ON public.org_candidates;
DROP POLICY IF EXISTS "Recruiters can update candidates" ON public.org_candidates;
DROP POLICY IF EXISTS "Admins can delete candidates" ON public.org_candidates;
DROP POLICY IF EXISTS "Members view candidates" ON public.org_candidates;
DROP POLICY IF EXISTS "Recruiters insert candidates" ON public.org_candidates;
DROP POLICY IF EXISTS "Recruiters update candidates" ON public.org_candidates;
DROP POLICY IF EXISTS "Admins delete candidates" ON public.org_candidates;

-- Org candidate keywords
DROP POLICY IF EXISTS "View candidate keywords" ON public.org_candidate_keywords;
DROP POLICY IF EXISTS "Insert candidate keywords" ON public.org_candidate_keywords;
DROP POLICY IF EXISTS "Update candidate keywords" ON public.org_candidate_keywords;

-- Org job descriptions
DROP POLICY IF EXISTS "Org members can view jobs" ON public.org_job_descriptions;
DROP POLICY IF EXISTS "Recruiters can insert jobs" ON public.org_job_descriptions;
DROP POLICY IF EXISTS "Recruiters can update jobs" ON public.org_job_descriptions;
DROP POLICY IF EXISTS "Members view jobs" ON public.org_job_descriptions;
DROP POLICY IF EXISTS "Recruiters insert jobs" ON public.org_job_descriptions;
DROP POLICY IF EXISTS "Recruiters update jobs" ON public.org_job_descriptions;
DROP POLICY IF EXISTS "Admins delete jobs" ON public.org_job_descriptions;

-- Org searches
DROP POLICY IF EXISTS "Org members can view searches" ON public.org_searches;
DROP POLICY IF EXISTS "Recruiters can create searches" ON public.org_searches;
DROP POLICY IF EXISTS "Members view searches" ON public.org_searches;
DROP POLICY IF EXISTS "Recruiters create searches" ON public.org_searches;
DROP POLICY IF EXISTS "Recruiters update searches" ON public.org_searches;

-- Org search results
DROP POLICY IF EXISTS "View search results" ON public.org_search_results;
DROP POLICY IF EXISTS "Insert search results" ON public.org_search_results;

-- Org invitations
DROP POLICY IF EXISTS "Org admins can view invitations" ON public.org_invitations;
DROP POLICY IF EXISTS "Org admins can create invitations" ON public.org_invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.org_invitations;
DROP POLICY IF EXISTS "Admins view invitations" ON public.org_invitations;
DROP POLICY IF EXISTS "Admins create invitations" ON public.org_invitations;
DROP POLICY IF EXISTS "Admins update invitations" ON public.org_invitations;
DROP POLICY IF EXISTS "View invitation by token" ON public.org_invitations;

-- ============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- These functions bypass RLS to check membership
-- ============================================

-- Drop existing functions first (for clean re-run)
DROP FUNCTION IF EXISTS public.get_user_org_ids(UUID);
DROP FUNCTION IF EXISTS public.get_user_org_role(UUID, UUID);
DROP FUNCTION IF EXISTS public.is_org_member(UUID, UUID);
DROP FUNCTION IF EXISTS public.is_org_admin(UUID, UUID);
DROP FUNCTION IF EXISTS public.is_org_recruiter_or_above(UUID, UUID);

CREATE OR REPLACE FUNCTION public.get_user_org_ids(user_uuid UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = user_uuid AND is_active = TRUE;
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_role(user_uuid UUID, org_uuid UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role
  FROM organization_members
  WHERE user_id = user_uuid AND organization_id = org_uuid AND is_active = TRUE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = user_uuid AND organization_id = org_uuid AND is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = user_uuid
    AND organization_id = org_uuid
    AND role IN ('owner', 'admin')
    AND is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_recruiter_or_above(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = user_uuid
    AND organization_id = org_uuid
    AND role IN ('owner', 'admin', 'recruiter')
    AND is_active = TRUE
  );
$$;

-- ============================================
-- ORGANIZATIONS POLICIES
-- ============================================

-- Anyone authenticated can create an org
CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Members can view their orgs
CREATE POLICY "Members view organizations" ON public.organizations
  FOR SELECT USING (
    id IN (SELECT public.get_user_org_ids(auth.uid()))
  );

-- Admins can update their orgs
CREATE POLICY "Admins update organizations" ON public.organizations
  FOR UPDATE USING (
    public.is_org_admin(auth.uid(), id)
  );

-- ============================================
-- ORGANIZATION_MEMBERS POLICIES
-- ============================================

-- Users can see their own membership directly
CREATE POLICY "Users view own membership" ON public.organization_members
  FOR SELECT USING (user_id = auth.uid());

-- Users can view members of orgs they belong to
CREATE POLICY "Members view org members" ON public.organization_members
  FOR SELECT USING (
    public.is_org_member(auth.uid(), organization_id)
  );

-- Admins can insert new members
-- Note: First member (owner) creation uses service role client to bypass RLS
CREATE POLICY "Admins add members" ON public.organization_members
  FOR INSERT WITH CHECK (
    public.is_org_admin(auth.uid(), organization_id)
  );

-- Admins can update members
CREATE POLICY "Admins update members" ON public.organization_members
  FOR UPDATE USING (
    public.is_org_admin(auth.uid(), organization_id)
  );

-- Admins can remove members
CREATE POLICY "Admins delete members" ON public.organization_members
  FOR DELETE USING (
    public.is_org_admin(auth.uid(), organization_id)
  );

-- ============================================
-- ORG_CANDIDATES POLICIES
-- ============================================

CREATE POLICY "Members view candidates" ON public.org_candidates
  FOR SELECT USING (
    public.is_org_member(auth.uid(), organization_id)
  );

CREATE POLICY "Recruiters insert candidates" ON public.org_candidates
  FOR INSERT WITH CHECK (
    public.is_org_recruiter_or_above(auth.uid(), organization_id)
  );

CREATE POLICY "Recruiters update candidates" ON public.org_candidates
  FOR UPDATE USING (
    public.is_org_recruiter_or_above(auth.uid(), organization_id)
  );

CREATE POLICY "Admins delete candidates" ON public.org_candidates
  FOR DELETE USING (
    public.is_org_admin(auth.uid(), organization_id)
  );

-- ============================================
-- ORG_CANDIDATE_KEYWORDS POLICIES
-- ============================================

CREATE POLICY "View candidate keywords" ON public.org_candidate_keywords
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_candidates c
      WHERE c.id = candidate_id
      AND public.is_org_member(auth.uid(), c.organization_id)
    )
  );

CREATE POLICY "Insert candidate keywords" ON public.org_candidate_keywords
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_candidates c
      WHERE c.id = candidate_id
      AND public.is_org_recruiter_or_above(auth.uid(), c.organization_id)
    )
  );

CREATE POLICY "Update candidate keywords" ON public.org_candidate_keywords
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM org_candidates c
      WHERE c.id = candidate_id
      AND public.is_org_recruiter_or_above(auth.uid(), c.organization_id)
    )
  );

-- ============================================
-- ORG_JOB_DESCRIPTIONS POLICIES
-- ============================================

CREATE POLICY "Members view jobs" ON public.org_job_descriptions
  FOR SELECT USING (
    public.is_org_member(auth.uid(), organization_id)
  );

CREATE POLICY "Recruiters insert jobs" ON public.org_job_descriptions
  FOR INSERT WITH CHECK (
    public.is_org_recruiter_or_above(auth.uid(), organization_id)
  );

CREATE POLICY "Recruiters update jobs" ON public.org_job_descriptions
  FOR UPDATE USING (
    public.is_org_recruiter_or_above(auth.uid(), organization_id)
  );

CREATE POLICY "Admins delete jobs" ON public.org_job_descriptions
  FOR DELETE USING (
    public.is_org_admin(auth.uid(), organization_id)
  );

-- ============================================
-- ORG_SEARCHES POLICIES
-- ============================================

CREATE POLICY "Members view searches" ON public.org_searches
  FOR SELECT USING (
    public.is_org_member(auth.uid(), organization_id)
  );

CREATE POLICY "Recruiters create searches" ON public.org_searches
  FOR INSERT WITH CHECK (
    public.is_org_recruiter_or_above(auth.uid(), organization_id)
  );

CREATE POLICY "Recruiters update searches" ON public.org_searches
  FOR UPDATE USING (
    public.is_org_recruiter_or_above(auth.uid(), organization_id)
  );

-- ============================================
-- ORG_SEARCH_RESULTS POLICIES
-- ============================================

CREATE POLICY "View search results" ON public.org_search_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM org_searches s
      WHERE s.id = search_id
      AND public.is_org_member(auth.uid(), s.organization_id)
    )
  );

CREATE POLICY "Insert search results" ON public.org_search_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM org_searches s
      WHERE s.id = search_id
      AND public.is_org_recruiter_or_above(auth.uid(), s.organization_id)
    )
  );

-- ============================================
-- ORG_INVITATIONS POLICIES
-- ============================================

CREATE POLICY "Admins view invitations" ON public.org_invitations
  FOR SELECT USING (
    public.is_org_admin(auth.uid(), organization_id)
  );

CREATE POLICY "Admins create invitations" ON public.org_invitations
  FOR INSERT WITH CHECK (
    public.is_org_admin(auth.uid(), organization_id)
  );

CREATE POLICY "Admins update invitations" ON public.org_invitations
  FOR UPDATE USING (
    public.is_org_admin(auth.uid(), organization_id)
  );

-- Anyone can view invitation by token (for accepting)
CREATE POLICY "View invitation by token" ON public.org_invitations
  FOR SELECT USING (
    token IS NOT NULL
    AND expires_at > NOW()
    AND accepted_at IS NULL
  );

-- ============================================
-- GRANT EXECUTE ON FUNCTIONS
-- ============================================

GRANT EXECUTE ON FUNCTION public.get_user_org_ids(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_org_role(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_recruiter_or_above(UUID, UUID) TO authenticated;
