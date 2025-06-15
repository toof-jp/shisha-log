-- Add creator field to shisha_sessions table
ALTER TABLE public.shisha_sessions 
ADD COLUMN IF NOT EXISTS creator TEXT;

-- Make store_name optional (nullable)
ALTER TABLE public.shisha_sessions 
ALTER COLUMN store_name DROP NOT NULL;

-- Update session_flavors to make flavor_name optional
ALTER TABLE public.session_flavors
ALTER COLUMN flavor_name DROP NOT NULL;