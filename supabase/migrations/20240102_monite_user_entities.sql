-- Drop existing trigger and function first
DROP TRIGGER IF EXISTS handle_updated_at ON public.monite_user_entities;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own entity mappings" ON public.monite_user_entities;
DROP POLICY IF EXISTS "Users can create their own entity mappings" ON public.monite_user_entities;
DROP POLICY IF EXISTS "Service role can do everything" ON public.monite_user_entities;

-- Drop and recreate the table
DROP TABLE IF EXISTS public.monite_user_entities CASCADE;

-- Create monite_user_entities table
CREATE TABLE IF NOT EXISTS public.monite_user_entities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, entity_id)
);

-- Enable RLS
ALTER TABLE public.monite_user_entities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own entity mappings"
    ON public.monite_user_entities
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entity mappings"
    ON public.monite_user_entities
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow service role to bypass RLS
CREATE POLICY "Service role can do everything"
    ON public.monite_user_entities
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.monite_user_entities
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 