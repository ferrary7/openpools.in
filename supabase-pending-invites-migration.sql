-- Pending invites table for pre-registration
-- Users invited via admin dashboard before they sign up

CREATE TABLE public.pending_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  token TEXT NOT NULL UNIQUE,

  -- Parsed resume data
  resume_text TEXT,
  resume_url TEXT,
  keywords JSONB,
  total_keywords INTEGER DEFAULT 0,

  -- Extracted profile data
  extracted_profile JSONB,  -- {job_title, company, location, bio, linkedin_url, etc.}

  -- Metadata
  invited_by UUID REFERENCES public.profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,
  claimed_by UUID REFERENCES public.profiles(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast token lookup
CREATE INDEX idx_pending_invites_token ON public.pending_invites(token);
CREATE INDEX idx_pending_invites_email ON public.pending_invites(email);

-- RLS policies
ALTER TABLE public.pending_invites ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage invites" ON public.pending_invites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Anyone can view their own invite by token (for claim flow)
CREATE POLICY "Anyone can view invite by token" ON public.pending_invites
  FOR SELECT USING (true);
