-- Remove user_stats triggers and functions since we're doing real-time calculation instead

-- Drop triggers first
DROP TRIGGER IF EXISTS update_user_stats_on_wardrobe_insert ON public.wardrobe;
DROP TRIGGER IF EXISTS update_user_stats_on_wardrobe_update ON public.wardrobe;
DROP TRIGGER IF EXISTS update_user_stats_on_wardrobe_delete ON public.wardrobe;

-- Drop the function
DROP FUNCTION IF EXISTS update_user_stats();

-- Drop the user_stats table if it exists
DROP TABLE IF EXISTS public.user_stats;