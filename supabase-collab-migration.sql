-- Collaboration System Migration for OpenPools
-- Run this in your Supabase SQL Editor

-- Add additional profile fields for contact details (only visible after collab)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT;

-- Collaborations table (tracks collab requests)
CREATE TABLE IF NOT EXISTS public.collaborations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT, -- Optional message with collab request
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(sender_id, receiver_id)
);

-- Notifications table (for collab requests and other events)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('collab_request', 'collab_accepted', 'collab_rejected')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  related_collab_id UUID REFERENCES public.collaborations(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_collaborations_sender_id ON public.collaborations(sender_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_receiver_id ON public.collaborations(receiver_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON public.collaborations(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collaborations
CREATE POLICY "Users can view own collaborations" ON public.collaborations
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send collabs" ON public.collaborations
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update collabs" ON public.collaborations
  FOR UPDATE USING (auth.uid() = receiver_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Function to create notifications when collab is sent
CREATE OR REPLACE FUNCTION public.notify_collab_request()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_user_id,
    related_collab_id
  )
  SELECT
    NEW.receiver_id,
    'collab_request',
    'New Collaboration Request',
    (SELECT full_name FROM public.profiles WHERE id = NEW.sender_id) || ' wants to collaborate with you!',
    NEW.sender_id,
    NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications when collab is accepted
CREATE OR REPLACE FUNCTION public.notify_collab_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_user_id,
      related_collab_id
    )
    SELECT
      NEW.sender_id,
      'collab_accepted',
      'Collaboration Accepted!',
      (SELECT full_name FROM public.profiles WHERE id = NEW.receiver_id) || ' accepted your collaboration request!',
      NEW.receiver_id,
      NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for notifications
DROP TRIGGER IF EXISTS on_collab_request ON public.collaborations;
CREATE TRIGGER on_collab_request
  AFTER INSERT ON public.collaborations
  FOR EACH ROW EXECUTE FUNCTION public.notify_collab_request();

DROP TRIGGER IF EXISTS on_collab_status_change ON public.collaborations;
CREATE TRIGGER on_collab_status_change
  AFTER UPDATE ON public.collaborations
  FOR EACH ROW EXECUTE FUNCTION public.notify_collab_accepted();

-- Trigger for updated_at on collaborations
DROP TRIGGER IF EXISTS set_collab_updated_at ON public.collaborations;
CREATE TRIGGER set_collab_updated_at
  BEFORE UPDATE ON public.collaborations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to check if two users are collaborating (accepted collab)
CREATE OR REPLACE FUNCTION public.are_users_collaborating(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.collaborations
    WHERE status = 'accepted'
      AND (
        (sender_id = user1_id AND receiver_id = user2_id)
        OR (sender_id = user2_id AND receiver_id = user1_id)
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get collab status between two users
CREATE OR REPLACE FUNCTION public.get_collab_status(user1_id UUID, user2_id UUID)
RETURNS TABLE(status TEXT, is_sender BOOLEAN, collab_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.status,
    c.sender_id = user1_id as is_sender,
    c.id as collab_id
  FROM public.collaborations c
  WHERE (
    (c.sender_id = user1_id AND c.receiver_id = user2_id)
    OR (c.sender_id = user2_id AND c.receiver_id = user1_id)
  )
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.collaborations IS 'Stores collaboration requests between users';
COMMENT ON TABLE public.notifications IS 'User notifications for collab requests and events';
COMMENT ON FUNCTION public.are_users_collaborating IS 'Check if two users have an accepted collaboration';
COMMENT ON FUNCTION public.get_collab_status IS 'Get collaboration status between two users';
