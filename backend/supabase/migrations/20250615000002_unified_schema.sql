-- Unified Shisha Log Database Schema for Supabase
-- This file consolidates all migrations into a single schema
-- Last updated: 2025-06-15

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table with user_id authentication
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create shisha sessions table
CREATE TABLE IF NOT EXISTS public.shisha_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    session_date TIMESTAMPTZ NOT NULL,
    store_name TEXT, -- nullable (optional) - changed from NOT NULL
    notes TEXT,
    order_details TEXT,
    mix_name TEXT,
    creator TEXT, -- new field added in 2025-01-15
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create session flavors table
CREATE TABLE IF NOT EXISTS public.session_flavors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_id TEXT NOT NULL REFERENCES public.shisha_sessions(id) ON DELETE CASCADE,
    flavor_name TEXT, -- nullable (optional) - changed from NOT NULL
    brand TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_shisha_sessions_user_id ON public.shisha_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_shisha_sessions_created_by ON public.shisha_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_shisha_sessions_session_date ON public.shisha_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_session_flavors_session_id ON public.session_flavors(session_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shisha_sessions_updated_at 
    BEFORE UPDATE ON public.shisha_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Clean up expired tokens periodically
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM public.password_reset_tokens 
    WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shisha_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_flavors ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be created based on your authentication setup
-- If using custom JWT auth (not Supabase Auth), you may need different policies
-- or handle authorization in your application layer instead