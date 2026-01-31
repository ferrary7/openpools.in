-- ============================================
-- E2E Encryption Migration
-- Adds support for end-to-end encrypted messages
-- ============================================

-- 1. Add public_key column to profiles for E2E encryption
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS public_key TEXT;

-- 2. Add encryption metadata to messages table
-- content will now store encrypted data
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;

-- 3. Create conversation metadata table to track first messages and notification state
CREATE TABLE IF NOT EXISTS public.conversation_metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_a_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_message_sent_at TIMESTAMP WITH TIME ZONE,
  first_message_email_sent BOOLEAN DEFAULT FALSE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  user_a_unread_count INTEGER DEFAULT 0,
  user_b_unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure user_a_id < user_b_id for consistent ordering
  CONSTRAINT conversation_users_ordered CHECK (user_a_id < user_b_id),
  CONSTRAINT unique_conversation UNIQUE (user_a_id, user_b_id)
);

-- Index for fast lookup by either user
CREATE INDEX IF NOT EXISTS idx_conversation_metadata_user_a ON public.conversation_metadata(user_a_id);
CREATE INDEX IF NOT EXISTS idx_conversation_metadata_user_b ON public.conversation_metadata(user_b_id);

-- 4. Create notification_settings table for user preferences
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_on_first_message BOOLEAN DEFAULT TRUE,
  email_on_notification_threshold BOOLEAN DEFAULT TRUE,
  notification_threshold INTEGER DEFAULT 9,
  email_digest_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_notification_settings UNIQUE (user_id)
);

-- 5. Add message_notifications table for tracking message-specific notifications
CREATE TABLE IF NOT EXISTS public.message_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_message_notification UNIQUE (user_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_message_notifications_user ON public.message_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_message_notifications_unread ON public.message_notifications(user_id, read) WHERE read = FALSE;

-- 6. RLS Policies for new tables

-- conversation_metadata policies
ALTER TABLE public.conversation_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations" ON public.conversation_metadata
  FOR SELECT USING (
    auth.uid() = user_a_id OR auth.uid() = user_b_id
  );

CREATE POLICY "Users can create conversations" ON public.conversation_metadata
  FOR INSERT WITH CHECK (
    auth.uid() = user_a_id OR auth.uid() = user_b_id
  );

CREATE POLICY "Users can update their conversations" ON public.conversation_metadata
  FOR UPDATE USING (
    auth.uid() = user_a_id OR auth.uid() = user_b_id
  );

-- notification_settings policies
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification settings" ON public.notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notification settings" ON public.notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" ON public.notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- message_notifications policies
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own message notifications" ON public.message_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own message notifications" ON public.message_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own message notifications" ON public.message_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System can insert message notifications (via service role)
CREATE POLICY "System can insert message notifications" ON public.message_notifications
  FOR INSERT WITH CHECK (true);

-- 7. Function to get or create conversation metadata
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_user_a UUID, p_user_b UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_a UUID;
  v_user_b UUID;
  v_conversation_id UUID;
BEGIN
  -- Ensure consistent ordering (smaller UUID first)
  IF p_user_a < p_user_b THEN
    v_user_a := p_user_a;
    v_user_b := p_user_b;
  ELSE
    v_user_a := p_user_b;
    v_user_b := p_user_a;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM conversation_metadata
  WHERE user_a_id = v_user_a AND user_b_id = v_user_b;

  -- Create if not exists
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversation_metadata (user_a_id, user_b_id)
    VALUES (v_user_a, v_user_b)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$;

-- 8. Function to update conversation on new message
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_a UUID;
  v_user_b UUID;
  v_is_first_message BOOLEAN;
BEGIN
  -- Ensure consistent ordering
  IF NEW.sender_id < NEW.receiver_id THEN
    v_user_a := NEW.sender_id;
    v_user_b := NEW.receiver_id;
  ELSE
    v_user_a := NEW.receiver_id;
    v_user_b := NEW.sender_id;
  END IF;

  -- Check if this is the first message in conversation
  SELECT first_message_sent_at IS NULL INTO v_is_first_message
  FROM conversation_metadata
  WHERE user_a_id = v_user_a AND user_b_id = v_user_b;

  -- Upsert conversation metadata
  INSERT INTO conversation_metadata (user_a_id, user_b_id, first_message_sent_at, last_message_at,
    user_a_unread_count, user_b_unread_count)
  VALUES (
    v_user_a,
    v_user_b,
    NOW(),
    NOW(),
    CASE WHEN NEW.receiver_id = v_user_a THEN 1 ELSE 0 END,
    CASE WHEN NEW.receiver_id = v_user_b THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_a_id, user_b_id) DO UPDATE SET
    first_message_sent_at = COALESCE(conversation_metadata.first_message_sent_at, NOW()),
    last_message_at = NOW(),
    user_a_unread_count = CASE
      WHEN NEW.receiver_id = conversation_metadata.user_a_id
      THEN conversation_metadata.user_a_unread_count + 1
      ELSE conversation_metadata.user_a_unread_count
    END,
    user_b_unread_count = CASE
      WHEN NEW.receiver_id = conversation_metadata.user_b_id
      THEN conversation_metadata.user_b_unread_count + 1
      ELSE conversation_metadata.user_b_unread_count
    END,
    updated_at = NOW();

  -- Create message notification for receiver
  INSERT INTO message_notifications (user_id, message_id, sender_id)
  VALUES (NEW.receiver_id, NEW.id, NEW.sender_id);

  RETURN NEW;
END;
$$;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();

-- 9. Function to mark messages as read and update unread count
CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_user_id UUID, p_other_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_a UUID;
  v_user_b UUID;
BEGIN
  -- Ensure consistent ordering
  IF p_user_id < p_other_user_id THEN
    v_user_a := p_user_id;
    v_user_b := p_other_user_id;
  ELSE
    v_user_a := p_other_user_id;
    v_user_b := p_user_id;
  END IF;

  -- Reset unread count for the reading user
  UPDATE conversation_metadata
  SET
    user_a_unread_count = CASE WHEN p_user_id = user_a_id THEN 0 ELSE user_a_unread_count END,
    user_b_unread_count = CASE WHEN p_user_id = user_b_id THEN 0 ELSE user_b_unread_count END,
    updated_at = NOW()
  WHERE user_a_id = v_user_a AND user_b_id = v_user_b;

  -- Mark message notifications as read
  UPDATE message_notifications
  SET read = TRUE
  WHERE user_id = p_user_id AND sender_id = p_other_user_id AND read = FALSE;

  -- Mark actual messages as read
  UPDATE messages
  SET read = TRUE, updated_at = NOW()
  WHERE receiver_id = p_user_id AND sender_id = p_other_user_id AND read = FALSE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(UUID, UUID) TO authenticated;

-- 10. View for user's total unread message count
CREATE OR REPLACE VIEW public.user_unread_counts AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE read = FALSE) as unread_message_count
FROM public.message_notifications
GROUP BY user_id;
