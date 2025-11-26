-- Create user_stats table for tracking user wardrobe statistics
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_try_ons INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  disliked_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for service role (backend handles auth)
CREATE POLICY "Enable full access for service role" 
ON public.user_stats
FOR ALL
TO service_role
USING (true);

-- Policy: Users can read their own stats (for client-side access)
CREATE POLICY "Users can read own user_stats"
ON public.user_stats
FOR SELECT
USING (user_id::text = current_setting('app.user_id', true));

-- Policy: Users can update their own stats
CREATE POLICY "Users can update own user_stats"
ON public.user_stats
FOR UPDATE
USING (user_id::text = current_setting('app.user_id', true));

-- Create function to automatically update user_stats when wardrobe items change
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert user stats
  INSERT INTO public.user_stats (user_id, total_try_ons, favorites_count, disliked_count)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE((SELECT COUNT(*) FROM public.wardrobe WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)), 0),
    COALESCE((SELECT COUNT(*) FROM public.wardrobe WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND liked = true), 0),
    COALESCE((SELECT COUNT(*) FROM public.wardrobe WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND liked = false), 0)
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_try_ons = COALESCE((SELECT COUNT(*) FROM public.wardrobe WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)), 0),
    favorites_count = COALESCE((SELECT COUNT(*) FROM public.wardrobe WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND liked = true), 0),
    disliked_count = COALESCE((SELECT COUNT(*) FROM public.wardrobe WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND liked = false), 0),
    updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically update stats when wardrobe items change
CREATE OR REPLACE TRIGGER update_user_stats_on_wardrobe_insert
  AFTER INSERT ON public.wardrobe
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE OR REPLACE TRIGGER update_user_stats_on_wardrobe_update
  AFTER UPDATE ON public.wardrobe
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE OR REPLACE TRIGGER update_user_stats_on_wardrobe_delete
  AFTER DELETE ON public.wardrobe
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- Add comments
COMMENT ON TABLE public.user_stats IS 'Stores aggregated statistics for each user''s wardrobe activity';
COMMENT ON COLUMN public.user_stats.user_id IS 'Reference to the user in auth.users';
COMMENT ON COLUMN public.user_stats.total_try_ons IS 'Total number of items in user''s wardrobe';
COMMENT ON COLUMN public.user_stats.favorites_count IS 'Number of liked items in wardrobe';
COMMENT ON COLUMN public.user_stats.disliked_count IS 'Number of disliked items in wardrobe';