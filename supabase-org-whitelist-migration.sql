-- Add can_create_org flag to profiles table
-- Only users with this flag set to TRUE can create organizations

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS can_create_org BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.can_create_org IS 'Whitelist flag: only users with TRUE can create organizations';

-- Optionally, grant this to existing admins
-- UPDATE public.profiles SET can_create_org = TRUE WHERE is_admin = TRUE;
