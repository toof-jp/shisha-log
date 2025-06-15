-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create shisha sessions table
CREATE TABLE IF NOT EXISTS public.shisha_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    session_date TIMESTAMPTZ NOT NULL,
    store_name TEXT NOT NULL,
    notes TEXT,
    order_details TEXT,
    mix_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create session flavors table
CREATE TABLE IF NOT EXISTS public.session_flavors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_id TEXT NOT NULL REFERENCES public.shisha_sessions(id) ON DELETE CASCADE,
    flavor_name TEXT NOT NULL,
    brand TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_shisha_sessions_user_id ON public.shisha_sessions(user_id);
CREATE INDEX idx_shisha_sessions_created_by ON public.shisha_sessions(created_by);
CREATE INDEX idx_shisha_sessions_session_date ON public.shisha_sessions(session_date);
CREATE INDEX idx_session_flavors_session_id ON public.session_flavors(session_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shisha_sessions_updated_at BEFORE UPDATE ON public.shisha_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();