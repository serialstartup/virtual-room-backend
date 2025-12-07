-- Remove avatar name unique constraint
-- Avatar names are for display purposes only and don't need to be unique
-- Users should be able to have multiple avatars with the same name

-- Drop the unique constraint on (user_id, name)
ALTER TABLE public.user_avatars DROP CONSTRAINT IF EXISTS unique_user_avatar_name;

-- Add comment to explain the change
COMMENT ON TABLE public.user_avatars IS 'Stores user AI avatars created from face photos using Face-to-Model API. Avatar names are for display purposes and can be duplicated.';
COMMENT ON COLUMN public.user_avatars.name IS 'User-defined display name for the avatar (can be duplicated)';