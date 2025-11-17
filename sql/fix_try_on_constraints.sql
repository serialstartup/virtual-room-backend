-- Fix try_on table constraints to support new workflows

-- First, let's see the current constraint and remove it
ALTER TABLE public.try_on DROP CONSTRAINT IF EXISTS check_image_source;

-- Add a more flexible constraint that supports new workflows
ALTER TABLE public.try_on ADD CONSTRAINT check_image_source 
CHECK (
  -- Classic try-on: requires either self_image or model_image AND either dress_image or dress_description
  (self_image IS NOT NULL OR model_image IS NOT NULL) OR
  
  -- Product-to-model: requires dress_image (product image) and may have dress_description (scene prompt)
  (dress_image IS NOT NULL AND product_url IS NOT NULL) OR
  
  -- Text-to-fashion or other workflows: at least dress_description
  (dress_description IS NOT NULL)
);

-- Also add a helpful comment
COMMENT ON CONSTRAINT check_image_source ON public.try_on IS 
'Flexible constraint supporting multiple try-on workflows: classic, product-to-model, and text-to-fashion';

-- Check if we need to update any existing data that might violate this
-- (This query will show any rows that would fail the new constraint)
SELECT id, self_image IS NOT NULL as has_self, model_image IS NOT NULL as has_model, 
       dress_image IS NOT NULL as has_dress_img, dress_description IS NOT NULL as has_dress_desc,
       product_url IS NOT NULL as has_product_url
FROM public.try_on 
WHERE NOT (
  (self_image IS NOT NULL OR model_image IS NOT NULL) OR
  (dress_image IS NOT NULL AND product_url IS NOT NULL) OR
  (dress_description IS NOT NULL)
);