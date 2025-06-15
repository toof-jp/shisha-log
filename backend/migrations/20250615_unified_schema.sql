-- Unified Shisha Log Database Schema
-- This file consolidates all previous migrations into a single schema
-- Last updated: 2025-06-16
-- Added: flavor_order column to session_flavors table

-- Create users table (custom authentication with user_id)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shisha sessions table
CREATE TABLE IF NOT EXISTS public.shisha_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id),
    session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    store_name TEXT, -- nullable (optional)
    notes TEXT,
    order_details TEXT,
    mix_name TEXT,
    creator TEXT, -- added in 2025-01-15 migration
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create session flavors table
CREATE TABLE IF NOT EXISTS public.session_flavors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.shisha_sessions(id) ON DELETE CASCADE,
    flavor_name TEXT, -- nullable (optional)
    brand TEXT,
    flavor_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.shisha_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON public.shisha_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_flavors_session_id ON public.session_flavors(session_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER handle_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_shisha_sessions_updated_at 
    BEFORE UPDATE ON public.shisha_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to clean up expired password reset tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM public.password_reset_tokens
    WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (if using Supabase)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shisha_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (id = auth.uid());

-- Create RLS policies for shisha_sessions table
CREATE POLICY "Users can view their own sessions" ON public.shisha_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own sessions" ON public.shisha_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions" ON public.shisha_sessions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own sessions" ON public.shisha_sessions
    FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for session_flavors table
CREATE POLICY "Users can view flavors of their sessions" ON public.session_flavors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.shisha_sessions
            WHERE shisha_sessions.id = session_flavors.session_id
            AND shisha_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage flavors of their sessions" ON public.session_flavors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.shisha_sessions
            WHERE shisha_sessions.id = session_flavors.session_id
            AND shisha_sessions.user_id = auth.uid()
        )
    );

-- Create RLS policies for password_reset_tokens table
CREATE POLICY "Users can view their own reset tokens" ON public.password_reset_tokens
    FOR SELECT USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- For anon and authenticated roles, grant specific permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shisha_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_flavors TO authenticated;
GRANT SELECT ON public.password_reset_tokens TO authenticated;