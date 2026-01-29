-- Organization Dashboard Migration
-- Multi-tenant B2B system for external companies to access OpenPools matching engine

-- ============================================
-- TABLES
-- ============================================

-- Core organization entity
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  industry TEXT,
  size TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team membership with roles
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES public.profiles(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Uploaded candidates (NOT OpenPools users)
CREATE TABLE IF NOT EXISTS public.org_candidates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  job_title TEXT,
  resume_url TEXT,
  resume_text TEXT,
  linkedin_url TEXT,
  source TEXT DEFAULT 'upload',
  status TEXT DEFAULT 'active',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keywords for uploaded candidates (same format as keyword_profiles)
CREATE TABLE IF NOT EXISTS public.org_candidate_keywords (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.org_candidates(id) ON DELETE CASCADE,
  keywords JSONB NOT NULL DEFAULT '[]',
  total_keywords INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(candidate_id)
);

-- Saved job descriptions
CREATE TABLE IF NOT EXISTS public.org_job_descriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  keywords JSONB DEFAULT '[]',
  department TEXT,
  location TEXT,
  employment_type TEXT,
  salary_range TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search history
CREATE TABLE IF NOT EXISTS public.org_searches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_description_id UUID REFERENCES public.org_job_descriptions(id) ON DELETE SET NULL,
  query_text TEXT,
  query_keywords JSONB DEFAULT '[]',
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  is_saved BOOLEAN DEFAULT FALSE,
  name TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search results cache
CREATE TABLE IF NOT EXISTS public.org_search_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  search_id UUID NOT NULL REFERENCES public.org_searches(id) ON DELETE CASCADE,
  candidate_type TEXT NOT NULL,
  candidate_id UUID NOT NULL,
  compatibility_score DECIMAL(5,2),
  common_keywords JSONB DEFAULT '[]',
  score_breakdown JSONB DEFAULT '{}',
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team invitations
CREATE TABLE IF NOT EXISTS public.org_invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES public.profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add discoverable flag to profiles (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'is_discoverable'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_discoverable BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON public.organizations(is_active);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON public.organization_members(role);

CREATE INDEX IF NOT EXISTS idx_org_candidates_org_id ON public.org_candidates(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_candidates_email ON public.org_candidates(email);
CREATE INDEX IF NOT EXISTS idx_org_candidates_status ON public.org_candidates(status);

CREATE INDEX IF NOT EXISTS idx_org_candidate_keywords_candidate_id ON public.org_candidate_keywords(candidate_id);

CREATE INDEX IF NOT EXISTS idx_org_job_descriptions_org_id ON public.org_job_descriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_job_descriptions_is_active ON public.org_job_descriptions(is_active);

CREATE INDEX IF NOT EXISTS idx_org_searches_org_id ON public.org_searches(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_searches_created_by ON public.org_searches(created_by);

CREATE INDEX IF NOT EXISTS idx_org_search_results_search_id ON public.org_search_results(search_id);

CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON public.org_invitations(token);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON public.org_invitations(email);

CREATE INDEX IF NOT EXISTS idx_profiles_is_discoverable ON public.profiles(is_discoverable);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_candidate_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_invitations ENABLE ROW LEVEL SECURITY;

-- Organizations: Members can view their org
CREATE POLICY "Org members can view organization" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- Organizations: Only owners can update
CREATE POLICY "Org owners can update organization" ON public.organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role = 'owner' AND is_active = TRUE
    )
  );

-- Organizations: Anyone can insert (create new org)
CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Organization members: Members can view their org's members
CREATE POLICY "Org members can view members" ON public.organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- Organization members: Admins can insert new members
CREATE POLICY "Org admins can add members" ON public.organization_members
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = TRUE
    )
  );

-- Organization members: Admins can update member roles
CREATE POLICY "Org admins can update members" ON public.organization_members
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = TRUE
    )
  );

-- Org candidates: Members can view their org's candidates
CREATE POLICY "Org members can view candidates" ON public.org_candidates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- Org candidates: Recruiters can insert candidates
CREATE POLICY "Recruiters can insert candidates" ON public.org_candidates
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'recruiter') AND is_active = TRUE
    )
  );

-- Org candidates: Recruiters can update candidates
CREATE POLICY "Recruiters can update candidates" ON public.org_candidates
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'recruiter') AND is_active = TRUE
    )
  );

-- Org candidates: Admins can delete candidates
CREATE POLICY "Admins can delete candidates" ON public.org_candidates
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = TRUE
    )
  );

-- Org candidate keywords: Same as candidates
CREATE POLICY "View candidate keywords" ON public.org_candidate_keywords
  FOR SELECT USING (
    candidate_id IN (
      SELECT id FROM public.org_candidates WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid() AND is_active = TRUE
      )
    )
  );

CREATE POLICY "Insert candidate keywords" ON public.org_candidate_keywords
  FOR INSERT WITH CHECK (
    candidate_id IN (
      SELECT id FROM public.org_candidates WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'recruiter') AND is_active = TRUE
      )
    )
  );

CREATE POLICY "Update candidate keywords" ON public.org_candidate_keywords
  FOR UPDATE USING (
    candidate_id IN (
      SELECT id FROM public.org_candidates WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'recruiter') AND is_active = TRUE
      )
    )
  );

-- Job descriptions: Members can view
CREATE POLICY "Org members can view jobs" ON public.org_job_descriptions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- Job descriptions: Recruiters can manage
CREATE POLICY "Recruiters can insert jobs" ON public.org_job_descriptions
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'recruiter') AND is_active = TRUE
    )
  );

CREATE POLICY "Recruiters can update jobs" ON public.org_job_descriptions
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'recruiter') AND is_active = TRUE
    )
  );

-- Searches: Members can view their org's searches
CREATE POLICY "Org members can view searches" ON public.org_searches
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- Searches: Recruiters can create searches
CREATE POLICY "Recruiters can create searches" ON public.org_searches
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'recruiter') AND is_active = TRUE
    )
  );

-- Search results: Based on search access
CREATE POLICY "View search results" ON public.org_search_results
  FOR SELECT USING (
    search_id IN (
      SELECT id FROM public.org_searches WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid() AND is_active = TRUE
      )
    )
  );

CREATE POLICY "Insert search results" ON public.org_search_results
  FOR INSERT WITH CHECK (
    search_id IN (
      SELECT id FROM public.org_searches WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'recruiter') AND is_active = TRUE
      )
    )
  );

-- Invitations: Admins can view and manage
CREATE POLICY "Org admins can view invitations" ON public.org_invitations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = TRUE
    )
  );

CREATE POLICY "Org admins can create invitations" ON public.org_invitations
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = TRUE
    )
  );

-- Invitations: Anyone can view by token (for accepting)
CREATE POLICY "Anyone can view invitation by token" ON public.org_invitations
  FOR SELECT USING (
    token IS NOT NULL AND expires_at > NOW() AND accepted_at IS NULL
  );

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_candidates_updated_at
  BEFORE UPDATE ON public.org_candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_job_descriptions_updated_at
  BEFORE UPDATE ON public.org_job_descriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.organizations IS 'Multi-tenant organizations for B2B dashboard access';
COMMENT ON TABLE public.organization_members IS 'Team membership with role-based access';
COMMENT ON TABLE public.org_candidates IS 'Candidates uploaded by organizations (not OpenPools users)';
COMMENT ON TABLE public.org_candidate_keywords IS 'Extracted keywords for org candidates';
COMMENT ON TABLE public.org_job_descriptions IS 'Job descriptions saved by organizations';
COMMENT ON TABLE public.org_searches IS 'Search history for organizations';
COMMENT ON TABLE public.org_search_results IS 'Cached search results with scores';
COMMENT ON TABLE public.org_invitations IS 'Team member invitations';

COMMENT ON COLUMN public.organization_members.role IS 'owner, admin, recruiter, viewer';
COMMENT ON COLUMN public.org_candidates.source IS 'upload, linkedin, referral';
COMMENT ON COLUMN public.org_candidates.status IS 'active, archived, hired';
COMMENT ON COLUMN public.org_search_results.candidate_type IS 'org_candidate or openpools_user';
