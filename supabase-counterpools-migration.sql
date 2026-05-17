-- Counterpools Problems Table
-- Table for storing problems submitted through the counterpools feature

CREATE TABLE public.counterpools_problems (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Submitter Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin_url TEXT,
  
  -- Problem Details
  problem_title TEXT NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('Technology', 'Healthcare', 'Education', 'Finance', 'Environment', 'Social Impact', 'Agriculture', 'Other')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  description TEXT NOT NULL,
  expected_outcome TEXT NOT NULL,
  
  -- Submitter Intent
  solution_adoption BOOLEAN DEFAULT FALSE,
  hiring_interest BOOLEAN DEFAULT FALSE,
  
  -- Additional Resources
  links TEXT,
  
  -- Problem Management
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'open', 'in_progress', 'solved', 'rejected')),
  teams_interested INTEGER DEFAULT 0,
    
  -- Admin Notes (for admin verification)
  admin_notes TEXT,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  notification_sent BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for better query performance
CREATE INDEX idx_counterpools_problems_status ON public.counterpools_problems(status);
CREATE INDEX idx_counterpools_problems_domain ON public.counterpools_problems(domain);
CREATE INDEX idx_counterpools_problems_difficulty ON public.counterpools_problems(difficulty);
CREATE INDEX idx_counterpools_problems_created_at ON public.counterpools_problems(created_at DESC);
CREATE INDEX idx_counterpools_problems_email ON public.counterpools_problems(email);

-- Enable RLS (Row Level Security) - Public read for "open" problems, admin can manage all
ALTER TABLE public.counterpools_problems ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view verified/open problems (no login required)
CREATE POLICY "anyone_can_view_verified_problems" ON public.counterpools_problems
  FOR SELECT
  USING (status IN ('open', 'in_progress', 'solved', 'verified'));

-- Policy: Anyone can insert new problems (no login required)
CREATE POLICY "anyone_can_insert_problems" ON public.counterpools_problems
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can view and update all problems
CREATE POLICY "admins_can_manage_all_problems" ON public.counterpools_problems
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
