-- Doppelganger Event Feature Migration
-- Run this migration in Supabase SQL Editor

-- 1. Events Table (admin-created)
CREATE TABLE public.dg_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  registration_start TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_end TIMESTAMP WITH TIME ZONE NOT NULL,
  sprint_start TIMESTAMP WITH TIME ZONE NOT NULL,
  sprint_end TIMESTAMP WITH TIME ZONE NOT NULL,
  submission_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  min_team_size INTEGER DEFAULT 2,
  max_team_size INTEGER DEFAULT 4,
  required_logs INTEGER DEFAULT 5,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'registration', 'active', 'judging', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Teams Table
CREATE TABLE public.dg_teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.dg_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  is_verified BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  doppelganger_id UUID REFERENCES public.profiles(id),
  doppelganger_status TEXT DEFAULT 'none' CHECK (doppelganger_status IN ('none', 'invited', 'accepted')),
  problem_statement JSONB,
  combined_keywords JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, name)
);

-- 3. Team Members Table
CREATE TABLE public.dg_team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.dg_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  email TEXT,  -- For external invites (user not yet signed up)
  invite_token TEXT UNIQUE,
  invite_status TEXT DEFAULT 'pending' CHECK (invite_status IN ('pending', 'accepted', 'rejected')),
  role TEXT DEFAULT 'member' CHECK (role IN ('captain', 'member')),
  is_verified BOOLEAN DEFAULT FALSE,  -- Has keywords extracted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 4. Progress Logs Table
CREATE TABLE public.dg_progress_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.dg_teams(id) ON DELETE CASCADE,
  checkpoint_number INTEGER NOT NULL CHECK (checkpoint_number BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  submitted_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_late BOOLEAN DEFAULT FALSE,
  UNIQUE(team_id, checkpoint_number)
);

-- 5. Submissions Table
CREATE TABLE public.dg_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.dg_teams(id) ON DELETE CASCADE UNIQUE,
  prototype_url TEXT NOT NULL,
  prototype_description TEXT,
  social_post_url TEXT,
  social_platform TEXT,
  social_verified BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Scores Table
CREATE TABLE public.dg_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.dg_teams(id) ON DELETE CASCADE UNIQUE,
  synergy_score DECIMAL(5,2),      -- 25% - Automated via Gemini
  consistency_score DECIMAL(5,2),  -- 20% - Automated (log count)
  technical_score DECIMAL(5,2),    -- 35% - Manual
  social_score DECIMAL(5,2),       -- 20% - Manual
  final_score DECIMAL(5,2),
  synergy_analysis JSONB,
  scored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_dg_teams_event_id ON public.dg_teams(event_id);
CREATE INDEX idx_dg_teams_created_by ON public.dg_teams(created_by);
CREATE INDEX idx_dg_teams_doppelganger_id ON public.dg_teams(doppelganger_id);
CREATE INDEX idx_dg_team_members_team_id ON public.dg_team_members(team_id);
CREATE INDEX idx_dg_team_members_user_id ON public.dg_team_members(user_id);
CREATE INDEX idx_dg_team_members_invite_token ON public.dg_team_members(invite_token);
CREATE INDEX idx_dg_team_members_email ON public.dg_team_members(email);
CREATE INDEX idx_dg_progress_logs_team_id ON public.dg_progress_logs(team_id);
CREATE INDEX idx_dg_submissions_team_id ON public.dg_submissions(team_id);
CREATE INDEX idx_dg_scores_team_id ON public.dg_scores(team_id);
CREATE INDEX idx_dg_scores_final_score ON public.dg_scores(final_score DESC);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dg_events_updated_at
  BEFORE UPDATE ON public.dg_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dg_teams_updated_at
  BEFORE UPDATE ON public.dg_teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dg_team_members_updated_at
  BEFORE UPDATE ON public.dg_team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dg_submissions_updated_at
  BEFORE UPDATE ON public.dg_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dg_scores_updated_at
  BEFORE UPDATE ON public.dg_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE public.dg_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dg_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dg_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dg_progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dg_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dg_scores ENABLE ROW LEVEL SECURITY;

-- Events: Anyone can read non-draft events
CREATE POLICY "Anyone can read active events" ON public.dg_events
  FOR SELECT USING (status != 'draft');

CREATE POLICY "Admins can manage events" ON public.dg_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Teams: Anyone can read, creators can manage
CREATE POLICY "Anyone can read teams" ON public.dg_teams
  FOR SELECT USING (true);

CREATE POLICY "Users can create teams" ON public.dg_teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team creators can update their teams" ON public.dg_teams
  FOR UPDATE USING (created_by = auth.uid());

-- Team Members: Check via dg_teams.created_by (avoids recursion)
CREATE POLICY "Users can read own membership" ON public.dg_team_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Team creators can read all members" ON public.dg_team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dg_teams
      WHERE dg_teams.id = dg_team_members.team_id
        AND dg_teams.created_by = auth.uid()
    )
  );

CREATE POLICY "Team creators can add members" ON public.dg_team_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dg_teams
      WHERE dg_teams.id = dg_team_members.team_id
        AND dg_teams.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update own membership" ON public.dg_team_members
  FOR UPDATE USING (
    user_id = auth.uid()
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Team creators can update members" ON public.dg_team_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.dg_teams
      WHERE dg_teams.id = dg_team_members.team_id
        AND dg_teams.created_by = auth.uid()
    )
  );

CREATE POLICY "Team creators can delete members" ON public.dg_team_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.dg_teams
      WHERE dg_teams.id = dg_team_members.team_id
        AND dg_teams.created_by = auth.uid()
    )
  );

-- Progress Logs
CREATE POLICY "Team members can read logs" ON public.dg_progress_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dg_teams
      WHERE dg_teams.id = dg_progress_logs.team_id
        AND (dg_teams.created_by = auth.uid() OR dg_teams.doppelganger_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.dg_team_members
      WHERE dg_team_members.team_id = dg_progress_logs.team_id
        AND dg_team_members.user_id = auth.uid()
        AND dg_team_members.invite_status = 'accepted'
    )
  );

CREATE POLICY "Team members can create logs" ON public.dg_progress_logs
  FOR INSERT WITH CHECK (
    submitted_by = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.dg_teams
        WHERE dg_teams.id = dg_progress_logs.team_id
          AND (dg_teams.created_by = auth.uid() OR dg_teams.doppelganger_id = auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.dg_team_members
        WHERE dg_team_members.team_id = dg_progress_logs.team_id
          AND dg_team_members.user_id = auth.uid()
          AND dg_team_members.invite_status = 'accepted'
      )
    )
  );

-- Submissions
CREATE POLICY "Anyone can read submissions" ON public.dg_submissions
  FOR SELECT USING (true);

CREATE POLICY "Team members can create submissions" ON public.dg_submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dg_teams
      WHERE dg_teams.id = dg_submissions.team_id
        AND dg_teams.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.dg_team_members
      WHERE dg_team_members.team_id = dg_submissions.team_id
        AND dg_team_members.user_id = auth.uid()
        AND dg_team_members.invite_status = 'accepted'
    )
  );

CREATE POLICY "Team members can update submissions" ON public.dg_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.dg_teams
      WHERE dg_teams.id = dg_submissions.team_id
        AND dg_teams.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.dg_team_members
      WHERE dg_team_members.team_id = dg_submissions.team_id
        AND dg_team_members.user_id = auth.uid()
        AND dg_team_members.invite_status = 'accepted'
    )
  );

-- Scores
CREATE POLICY "Anyone can read scores" ON public.dg_scores
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage scores" ON public.dg_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert a sample event
INSERT INTO public.dg_events (
  name,
  description,
  registration_start,
  registration_end,
  sprint_start,
  sprint_end,
  submission_deadline,
  min_team_size,
  max_team_size,
  required_logs,
  status
) VALUES (
  'Doppelganger Sprint 2025',
  'Find your signal twin, receive an AI-generated challenge, and build something amazing in 30 hours. Teams of 2-4 compete to create the best prototype while documenting their journey.',
  NOW(),
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days' + INTERVAL '30 hours',
  NOW() + INTERVAL '14 days' + INTERVAL '32 hours',
  2,
  4,
  5,
  'registration'
);
