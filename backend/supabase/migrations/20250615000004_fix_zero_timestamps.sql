-- Fix zero timestamps in existing data
-- This migration updates records that have '0001-01-01' timestamps

-- First, fix all timestamps in shisha_sessions
UPDATE public.shisha_sessions
SET 
    created_at = NOW(),
    updated_at = NOW()
WHERE created_at <= '0001-01-02 00:00:00+00' 
   OR updated_at <= '0001-01-02 00:00:00+00';

-- Fix session_flavors timestamps
UPDATE public.session_flavors
SET created_at = NOW()
WHERE created_at <= '0001-01-02 00:00:00+00';

-- Now add check constraints to prevent zero timestamps in the future
ALTER TABLE public.shisha_sessions
ADD CONSTRAINT check_created_at_not_zero CHECK (created_at > '0001-01-02 00:00:00+00'),
ADD CONSTRAINT check_updated_at_not_zero CHECK (updated_at > '0001-01-02 00:00:00+00');

ALTER TABLE public.session_flavors
ADD CONSTRAINT check_created_at_not_zero CHECK (created_at > '0001-01-02 00:00:00+00');