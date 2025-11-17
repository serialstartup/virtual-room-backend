-- Fix foreign key references and RLS policies for Supabase compatibility
-- This script addresses the auth.users foreign key constraint issues

-- Note: In Supabase, we typically use UUID references without explicit foreign keys to auth.users
-- because auth.users is in a different schema and managed by Supabase Auth

-- Add foreign key constraints if the user tables exist in the current setup
-- These are optional and can be added if your setup has proper user management

-- For user_models table - remove the restrictive foreign key
ALTER TABLE IF EXISTS public.user_models DROP CONSTRAINT IF EXISTS user_models_user_id_fkey;

-- For user_avatars table - remove the restrictive foreign key  
ALTER TABLE IF EXISTS public.user_avatars DROP CONSTRAINT IF EXISTS user_avatars_user_id_fkey;

-- For avatar_try_ons table - remove the restrictive foreign key
ALTER TABLE IF EXISTS public.avatar_try_ons DROP CONSTRAINT IF EXISTS avatar_try_ons_user_id_fkey;

-- For product_showcases table - remove the restrictive foreign key
ALTER TABLE IF EXISTS public.product_showcases DROP CONSTRAINT IF EXISTS product_showcases_user_id_fkey;

-- Update RLS policies to be more flexible with user validation
-- Since we're using JWT auth, the auth.uid() function should work

-- First, let's make sure RLS is enabled on all tables
ALTER TABLE IF EXISTS public.user_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_avatars ENABLE ROW LEVEL SECURITY;  
ALTER TABLE IF EXISTS public.avatar_try_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_showcases ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies for user_models
DROP POLICY IF EXISTS "Users can read own user_models" ON public.user_models;
DROP POLICY IF EXISTS "Users can insert own user_models" ON public.user_models;
DROP POLICY IF EXISTS "Users can update own user_models" ON public.user_models;
DROP POLICY IF EXISTS "Users can delete own user_models" ON public.user_models;

CREATE POLICY "Users can read own user_models"
  ON public.user_models FOR SELECT
  USING (user_id::text = COALESCE(auth.uid()::text, current_setting('app.current_user_id', true)));

CREATE POLICY "Users can insert own user_models" 
  ON public.user_models FOR INSERT
  WITH CHECK (user_id::text = COALESCE(auth.uid()::text, current_setting('app.current_user_id', true)));

CREATE POLICY "Users can update own user_models"
  ON public.user_models FOR UPDATE
  USING (user_id::text = COALESCE(auth.uid()::text, current_setting('app.current_user_id', true)));

CREATE POLICY "Users can delete own user_models"
  ON public.user_models FOR DELETE
  USING (user_id::text = COALESCE(auth.uid()::text, current_setting('app.current_user_id', true)));

-- Drop and recreate RLS policies for user_avatars
DROP POLICY IF EXISTS "Users can read own user_avatars" ON public.user_avatars;
DROP POLICY IF EXISTS "Users can insert own user_avatars" ON public.user_avatars;
DROP POLICY IF EXISTS "Users can update own user_avatars" ON public.user_avatars;
DROP POLICY IF EXISTS "Users can delete own user_avatars" ON public.user_avatars;

CREATE POLICY "Users can read own user_avatars"
  ON public.user_avatars FOR SELECT
  USING (user_id::text = COALESCE(auth.uid()::text, current_setting('app.current_user_id', true)));

CREATE POLICY "Users can insert own user_avatars"
  ON public.user_avatars FOR INSERT
  WITH CHECK (user_id::text = COALESCE(auth.uid()::text, current_setting('app.current_user_id', true)));

CREATE POLICY "Users can update own user_avatars"
  ON public.user_avatars FOR UPDATE
  USING (user_id::text = COALESCE(auth.uid()::text, current_setting('app.current_user_id', true)));

CREATE POLICY "Users can delete own user_avatars"
  ON public.user_avatars FOR DELETE
  USING (user_id::text = COALESCE(auth.uid()::text, current_setting('app.current_user_id', true)));

-- Add indexes for performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_models_user_id_v2 ON public.user_models(user_id);
CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id_v2 ON public.user_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_avatar_try_ons_user_id_v2 ON public.avatar_try_ons(user_id);
CREATE INDEX IF NOT EXISTS idx_product_showcases_user_id_v2 ON public.product_showcases(user_id);

-- Add a function to temporarily disable RLS for testing (use with caution)
CREATE OR REPLACE FUNCTION public.disable_rls_for_testing()
RETURNS void AS $$
BEGIN
  ALTER TABLE public.user_models DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.user_avatars DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.avatar_try_ons DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.product_showcases DISABLE ROW LEVEL SECURITY;
  
  RAISE NOTICE 'RLS disabled for testing. Remember to re-enable with enable_rls_for_production()';
END;
$$ LANGUAGE plpgsql;

-- Add a function to re-enable RLS for production
CREATE OR REPLACE FUNCTION public.enable_rls_for_production()
RETURNS void AS $$
BEGIN
  ALTER TABLE public.user_models ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.avatar_try_ons ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.product_showcases ENABLE ROW LEVEL SECURITY;
  
  RAISE NOTICE 'RLS enabled for production use';
END;
$$ LANGUAGE plpgsql;

-- Show current table status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  hasoids
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_models', 'user_avatars', 'avatar_try_ons', 'product_showcases')
ORDER BY tablename;