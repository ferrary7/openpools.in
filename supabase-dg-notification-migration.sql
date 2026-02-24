-- Migration: Add dg_invite type to notifications table
-- Run this in Supabase SQL Editor

-- Drop the existing type constraint and add dg_invite
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('collab_request', 'collab_accepted', 'collab_rejected', 'dg_invite'));
