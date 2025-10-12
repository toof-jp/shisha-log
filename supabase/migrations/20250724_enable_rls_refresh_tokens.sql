-- Enable Row Level Security on refresh_tokens table
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own refresh tokens
CREATE POLICY "Users can view own refresh tokens" ON refresh_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy: Users can insert their own refresh tokens
CREATE POLICY "Users can insert own refresh tokens" ON refresh_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own refresh tokens
CREATE POLICY "Users can update own refresh tokens" ON refresh_tokens
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own refresh tokens
CREATE POLICY "Users can delete own refresh tokens" ON refresh_tokens
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add a comment about RLS being enabled
COMMENT ON TABLE refresh_tokens IS 'Stores refresh tokens for JWT authentication. RLS enabled - users can only access their own tokens.';