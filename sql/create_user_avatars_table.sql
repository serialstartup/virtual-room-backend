-- Create user_avatars table for storing face-to-model avatar creations
CREATE TABLE IF NOT EXISTS public.user_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  face_image_url TEXT NOT NULL,
  avatar_image_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  fashion_ai_request_id VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_avatar_name UNIQUE (user_id, name)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own avatars
CREATE POLICY "Users can read own user_avatars"
ON public.user_avatars
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own avatars
CREATE POLICY "Users can insert own user_avatars" 
ON public.user_avatars
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own avatars  
CREATE POLICY "Users can update own user_avatars"
ON public.user_avatars
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete own user_avatars"
ON public.user_avatars
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id ON public.user_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_user_avatars_status ON public.user_avatars(status);
CREATE INDEX IF NOT EXISTS idx_user_avatars_primary ON public.user_avatars(user_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_user_avatars_fashion_ai_request ON public.user_avatars(fashion_ai_request_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_avatars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on updates
CREATE OR REPLACE TRIGGER update_user_avatars_updated_at_trigger
  BEFORE UPDATE ON public.user_avatars
  FOR EACH ROW
  EXECUTE FUNCTION update_user_avatars_updated_at();

-- Create function to ensure only one primary avatar per user
CREATE OR REPLACE FUNCTION ensure_single_primary_avatar()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated avatar is being set as primary
  IF NEW.is_primary = true THEN
    -- Set all other avatars for this user to non-primary
    UPDATE public.user_avatars 
    SET is_primary = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure only one primary avatar per user
CREATE OR REPLACE TRIGGER ensure_single_primary_avatar_trigger
  BEFORE INSERT OR UPDATE ON public.user_avatars
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION ensure_single_primary_avatar();

-- Create avatar_try_ons table for tracking try-ons performed with avatars
CREATE TABLE IF NOT EXISTS public.avatar_try_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  avatar_id UUID NOT NULL REFERENCES public.user_avatars(id) ON DELETE CASCADE,
  garment_image_url TEXT,
  garment_description TEXT,
  result_image_url TEXT,
  processing_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  fashion_ai_request_id VARCHAR(100),
  try_on_type VARCHAR(20) NOT NULL DEFAULT 'classic' CHECK (try_on_type IN ('classic', 'text-to-fashion', 'product-to-model')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for avatar_try_ons
ALTER TABLE public.avatar_try_ons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own avatar_try_ons"
ON public.avatar_try_ons
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for avatar_try_ons
CREATE INDEX IF NOT EXISTS idx_avatar_try_ons_user_id ON public.avatar_try_ons(user_id);
CREATE INDEX IF NOT EXISTS idx_avatar_try_ons_avatar_id ON public.avatar_try_ons(avatar_id);
CREATE INDEX IF NOT EXISTS idx_avatar_try_ons_status ON public.avatar_try_ons(processing_status);
CREATE INDEX IF NOT EXISTS idx_avatar_try_ons_type ON public.avatar_try_ons(try_on_type);
CREATE INDEX IF NOT EXISTS idx_avatar_try_ons_created_at ON public.avatar_try_ons(created_at DESC);

-- Create trigger for avatar_try_ons updated_at
CREATE OR REPLACE TRIGGER update_avatar_try_ons_updated_at_trigger
  BEFORE UPDATE ON public.avatar_try_ons
  FOR EACH ROW
  EXECUTE FUNCTION update_user_avatars_updated_at();

-- Create product_showcases table for business users
CREATE TABLE IF NOT EXISTS public.product_showcases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  product_image_url TEXT NOT NULL,
  showcase_image_url TEXT,
  product_description TEXT,
  scene_prompt TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  fashion_ai_request_id VARCHAR(100),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for product_showcases
ALTER TABLE public.product_showcases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own product_showcases"
ON public.product_showcases
FOR ALL
USING (auth.uid() = user_id);

-- Policy for public showcases (read-only)
CREATE POLICY "Anyone can view public showcases"
ON public.product_showcases
FOR SELECT
USING (is_public = true);

-- Create indexes for product_showcases
CREATE INDEX IF NOT EXISTS idx_product_showcases_user_id ON public.product_showcases(user_id);
CREATE INDEX IF NOT EXISTS idx_product_showcases_status ON public.product_showcases(status);
CREATE INDEX IF NOT EXISTS idx_product_showcases_public ON public.product_showcases(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_product_showcases_created_at ON public.product_showcases(created_at DESC);

-- Create trigger for product_showcases updated_at
CREATE OR REPLACE TRIGGER update_product_showcases_updated_at_trigger
  BEFORE UPDATE ON public.product_showcases
  FOR EACH ROW
  EXECUTE FUNCTION update_user_avatars_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.user_avatars IS 'Stores user AI avatars created from face photos using Face-to-Model API';
COMMENT ON COLUMN public.user_avatars.id IS 'Unique identifier for the avatar';
COMMENT ON COLUMN public.user_avatars.user_id IS 'Reference to the user who created the avatar';
COMMENT ON COLUMN public.user_avatars.name IS 'User-defined name for the avatar';
COMMENT ON COLUMN public.user_avatars.face_image_url IS 'URL to the original face photo';
COMMENT ON COLUMN public.user_avatars.avatar_image_url IS 'URL to the generated full-body avatar';
COMMENT ON COLUMN public.user_avatars.status IS 'Processing status of the avatar generation';
COMMENT ON COLUMN public.user_avatars.is_primary IS 'Whether this is the user primary/default avatar';

COMMENT ON TABLE public.avatar_try_ons IS 'Stores try-on sessions performed using user avatars';
COMMENT ON COLUMN public.avatar_try_ons.avatar_id IS 'Reference to the avatar used for try-on';
COMMENT ON COLUMN public.avatar_try_ons.try_on_type IS 'Type of try-on: classic, text-to-fashion, or product-to-model';

COMMENT ON TABLE public.product_showcases IS 'Stores product showcase generations for business users';
COMMENT ON COLUMN public.product_showcases.product_name IS 'Name/title of the product being showcased';
COMMENT ON COLUMN public.product_showcases.scene_prompt IS 'Scene description for the showcase context';
COMMENT ON COLUMN public.product_showcases.is_public IS 'Whether the showcase is publicly viewable';