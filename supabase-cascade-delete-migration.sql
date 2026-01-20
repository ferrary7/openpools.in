-- Migration to add ON DELETE CASCADE to all existing foreign keys referencing profiles

-- First, drop existing foreign keys and recreate them with ON DELETE CASCADE

-- keyword_profiles table
ALTER TABLE IF EXISTS public.keyword_profiles
DROP CONSTRAINT IF EXISTS keyword_profiles_user_id_fkey;

ALTER TABLE IF EXISTS public.keyword_profiles
ADD CONSTRAINT keyword_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- collaborations table  
ALTER TABLE IF EXISTS public.collaborations
DROP CONSTRAINT IF EXISTS collaborations_sender_id_fkey;

ALTER TABLE IF EXISTS public.collaborations
ADD CONSTRAINT collaborations_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.collaborations
DROP CONSTRAINT IF EXISTS collaborations_receiver_id_fkey;

ALTER TABLE IF EXISTS public.collaborations
ADD CONSTRAINT collaborations_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- notifications table
ALTER TABLE IF EXISTS public.notifications
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE IF EXISTS public.notifications
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.notifications
DROP CONSTRAINT IF EXISTS notifications_related_user_id_fkey;

ALTER TABLE IF EXISTS public.notifications
ADD CONSTRAINT notifications_related_user_id_fkey 
FOREIGN KEY (related_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- messages table
ALTER TABLE IF EXISTS public.messages
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

ALTER TABLE IF EXISTS public.messages
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.messages
DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

ALTER TABLE IF EXISTS public.messages
ADD CONSTRAINT messages_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- matches table
ALTER TABLE IF EXISTS public.matches
DROP CONSTRAINT IF EXISTS matches_user_id_fkey;

ALTER TABLE IF EXISTS public.matches
ADD CONSTRAINT matches_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.matches
DROP CONSTRAINT IF EXISTS matches_matched_user_id_fkey;

ALTER TABLE IF EXISTS public.matches
ADD CONSTRAINT matches_matched_user_id_fkey 
FOREIGN KEY (matched_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- journals table
ALTER TABLE IF EXISTS public.journals
DROP CONSTRAINT IF EXISTS journals_user_id_fkey;

ALTER TABLE IF EXISTS public.journals
ADD CONSTRAINT journals_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- showcase_items table
ALTER TABLE IF EXISTS public.showcase_items
DROP CONSTRAINT IF EXISTS showcase_items_user_id_fkey;

ALTER TABLE IF EXISTS public.showcase_items
ADD CONSTRAINT showcase_items_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ai_insights table
ALTER TABLE IF EXISTS public.ai_insights
DROP CONSTRAINT IF EXISTS ai_insights_user_id_fkey;

ALTER TABLE IF EXISTS public.ai_insights
ADD CONSTRAINT ai_insights_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
