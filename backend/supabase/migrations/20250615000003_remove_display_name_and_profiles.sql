-- Remove profiles table and display_name columns
DROP TABLE IF EXISTS public.profiles CASCADE;
ALTER TABLE public.users DROP COLUMN IF EXISTS display_name;