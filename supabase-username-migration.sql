-- Add username column to profiles table
-- Run this in your Supabase SQL Editor

-- Add username column (nullable, unique, lowercase)
ALTER TABLE public.profiles
ADD COLUMN username TEXT UNIQUE;

-- Add check constraint for username format
-- Username must be 3-30 characters, alphanumeric + underscores/hyphens, start with letter/number
ALTER TABLE public.profiles
ADD CONSTRAINT username_format CHECK (
  username IS NULL OR (
    username ~ '^[a-z0-9][a-z0-9_-]{2,29}$' AND
    username = LOWER(username)
  )
);

-- Create index for username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.username IS 'Unique username for user profile URLs. Must be 3-30 characters, lowercase, alphanumeric with underscores/hyphens, starting with letter or number.';

-- Function to validate and reserve usernames
CREATE OR REPLACE FUNCTION public.validate_username(new_username TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  reserved_words TEXT[] := ARRAY[
    'admin', 'administrator', 'mod', 'moderator', 'support', 'help',
    'api', 'www', 'mail', 'ftp', 'localhost', 'dashboard', 'settings',
    'profile', 'profiles', 'user', 'users', 'login', 'logout', 'signup',
    'signin', 'register', 'auth', 'account', 'accounts', 'home', 'index',
    'about', 'contact', 'privacy', 'terms', 'tos', 'blog', 'news',
    'dna', 'antenna', 'matches', 'journal', 'journals', 'collaborators',
    'messages', 'notifications', 'search', 'explore', 'discover',
    'onboarding', 'premium', 'pricing', 'billing', 'payment', 'checkout', 'openpools.in'
  ];
BEGIN
  -- Check if username is reserved
  IF LOWER(new_username) = ANY(reserved_words) THEN
    RETURN FALSE;
  END IF;

  -- Check format
  IF new_username !~ '^[a-z0-9][a-z0-9_-]{2,29}$' THEN
    RETURN FALSE;
  END IF;

  -- Check if lowercase
  IF new_username != LOWER(new_username) THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate username before insert/update
CREATE OR REPLACE FUNCTION public.check_username_before_save()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN
    -- Convert to lowercase
    NEW.username := LOWER(NEW.username);

    -- Validate
    IF NOT public.validate_username(NEW.username) THEN
      RAISE EXCEPTION 'Invalid username format or reserved word';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to profiles table
CREATE TRIGGER validate_username_trigger
  BEFORE INSERT OR UPDATE OF username ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_username_before_save();
