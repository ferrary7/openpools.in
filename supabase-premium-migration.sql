-- Migration: Add premium/subscription fields to profiles table
-- This allows marking users as premium (e.g., Coding Gita partnership)

-- Add premium fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS premium_source TEXT,
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient premium user queries
CREATE INDEX IF NOT EXISTS idx_profiles_premium ON public.profiles(is_premium) WHERE is_premium = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.is_premium IS 'Whether the user has premium access';
COMMENT ON COLUMN public.profiles.premium_source IS 'Source of premium access (e.g., coding_gita, paid, promo)';
COMMENT ON COLUMN public.profiles.premium_expires_at IS 'When premium access expires';

-- Example: Mark a Coding Gita student as premium for 5 months
-- UPDATE profiles
-- SET is_premium = true,
--     premium_source = 'coding_gita',
--     premium_expires_at = NOW() + INTERVAL '5 months'
-- WHERE email = 'student@example.com';

-- Example: Bulk update for multiple Coding Gita students
-- UPDATE profiles
-- SET is_premium = true,
--     premium_source = 'coding_gita',
--     premium_expires_at = '2026-06-27 00:00:00+00'
-- WHERE email IN ('student1@example.com', 'student2@example.com');
