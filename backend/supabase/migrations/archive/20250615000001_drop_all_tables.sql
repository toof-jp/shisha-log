-- Drop all existing tables and related objects
-- WARNING: This will delete all data!

-- Drop triggers first
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_shisha_sessions_updated_at ON public.shisha_sessions;
DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS handle_shisha_sessions_updated_at ON public.shisha_sessions;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.cleanup_expired_tokens();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS public.session_flavors CASCADE;
DROP TABLE IF EXISTS public.shisha_sessions CASCADE;
DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;