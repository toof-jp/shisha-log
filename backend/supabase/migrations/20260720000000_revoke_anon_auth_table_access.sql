-- The backend accesses these tables with the service_role key only.
-- The anon key must not be able to read or modify authentication data,
-- and the app's custom JWT auth never uses the "authenticated" role.
REVOKE ALL ON public.users FROM anon, authenticated;
REVOKE ALL ON public.password_reset_tokens FROM anon, authenticated;

DO $$
BEGIN
    IF to_regclass('public.refresh_tokens') IS NOT NULL THEN
        REVOKE ALL ON public.refresh_tokens FROM anon, authenticated;
    END IF;
END
$$;
