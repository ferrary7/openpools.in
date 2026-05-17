-- Add keywords column to counterpools_problems table
-- Keywords are manually added by admins to help with team matching

ALTER TABLE public.counterpools_problems ADD COLUMN keywords TEXT;

-- Create index for keywords to support full-text search in future
CREATE INDEX idx_counterpools_problems_keywords ON public.counterpools_problems USING GIN (to_tsvector('english', COALESCE(keywords, '')));
