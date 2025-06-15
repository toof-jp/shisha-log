-- Reset database and apply unified schema
-- WARNING: This will DELETE ALL DATA

-- Drop all existing tables
DROP TABLE IF EXISTS public.session_flavors CASCADE;
DROP TABLE IF EXISTS public.shisha_sessions CASCADE;
DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_tokens() CASCADE;

-- Now apply the unified schema
\i 20250615_unified_schema.sql