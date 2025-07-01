-- Add amount column to shisha_sessions table
-- This migration adds the ability to track the monetary amount for each session

ALTER TABLE public.shisha_sessions
ADD COLUMN amount INTEGER DEFAULT NULL;

-- Add comment to the column for documentation
COMMENT ON COLUMN public.shisha_sessions.amount IS 'The total amount spent on this shisha session';