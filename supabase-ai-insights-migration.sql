-- Create table to store AI-generated insights for DNA profiles
-- Run this in your Supabase SQL Editor

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- AI-generated content (stored as JSONB for flexible querying)
  career_fit JSONB,
  johari_window JSONB,
  skill_gap JSONB,
  smart_combinations JSONB,

  -- Metadata for cache invalidation
  skills_hash TEXT NOT NULL,  -- Hash of skills used to generate insights
  cache_version TEXT NOT NULL DEFAULT 'v4',  -- Increment when prompts change

  -- Timestamps
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one record per user (will update on regeneration)
  UNIQUE(user_id)
);

-- Create indexes for efficient lookups
CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX idx_ai_insights_cache_version ON public.ai_insights(cache_version);
CREATE INDEX idx_ai_insights_generated_at ON public.ai_insights(generated_at);

-- Enable Row Level Security
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can read AI insights (for sharing DNA profiles)
CREATE POLICY "AI insights are publicly readable"
  ON public.ai_insights
  FOR SELECT
  USING (true);

-- Only the user can insert/update their own insights
CREATE POLICY "Users can insert their own AI insights"
  ON public.ai_insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI insights"
  ON public.ai_insights
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_ai_insights_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on changes
CREATE TRIGGER update_ai_insights_timestamp_trigger
  BEFORE UPDATE ON public.ai_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_insights_timestamp();

-- Add comments for documentation
COMMENT ON TABLE public.ai_insights IS 'Stores AI-generated insights for user DNA profiles. Cached to avoid redundant API calls when profiles are shared.';
COMMENT ON COLUMN public.ai_insights.user_id IS 'References the user whose DNA profile these insights belong to';
COMMENT ON COLUMN public.ai_insights.career_fit IS 'Array of job roles that match user skills';
COMMENT ON COLUMN public.ai_insights.johari_window IS 'Johari Window skill categorization';
COMMENT ON COLUMN public.ai_insights.skill_gap IS 'Skill progression roadmap with target roles';
COMMENT ON COLUMN public.ai_insights.smart_combinations IS 'Power combos and missing links';
COMMENT ON COLUMN public.ai_insights.skills_hash IS 'Hash of skills to detect when insights need regeneration';
COMMENT ON COLUMN public.ai_insights.cache_version IS 'Version to invalidate cache when AI prompts change';
