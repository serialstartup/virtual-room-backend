-- Create user_models table for storing user-generated custom models
CREATE TABLE IF NOT EXISTS public.user_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT,
  model_type VARCHAR(50) NOT NULL CHECK (model_type IN ('model-create', 'product-to-model')),
  status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  fashion_ai_request_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_model_name UNIQUE (user_id, name)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.user_models ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own models
CREATE POLICY "Users can read own user_models"
ON public.user_models
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own models
CREATE POLICY "Users can insert own user_models" 
ON public.user_models
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own models  
CREATE POLICY "Users can update own user_models"
ON public.user_models
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own models
CREATE POLICY "Users can delete own user_models"
ON public.user_models
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_models_user_id ON public.user_models(user_id);
CREATE INDEX IF NOT EXISTS idx_user_models_status ON public.user_models(status);
CREATE INDEX IF NOT EXISTS idx_user_models_type ON public.user_models(model_type);
CREATE INDEX IF NOT EXISTS idx_user_models_fashion_ai_request ON public.user_models(fashion_ai_request_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_models_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on updates
CREATE OR REPLACE TRIGGER update_user_models_updated_at_trigger
  BEFORE UPDATE ON public.user_models
  FOR EACH ROW
  EXECUTE FUNCTION update_user_models_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.user_models IS 'Stores user-generated custom models created via Fashion AI';
COMMENT ON COLUMN public.user_models.id IS 'Unique identifier for the model';
COMMENT ON COLUMN public.user_models.user_id IS 'Reference to the user who created the model';
COMMENT ON COLUMN public.user_models.name IS 'User-defined name for the model';
COMMENT ON COLUMN public.user_models.prompt IS 'Text prompt used to generate the model';
COMMENT ON COLUMN public.user_models.image_url IS 'URL to the generated model image';
COMMENT ON COLUMN public.user_models.model_type IS 'Type of model creation: model-create or product-to-model';
COMMENT ON COLUMN public.user_models.status IS 'Processing status of the model generation';
COMMENT ON COLUMN public.user_models.fashion_ai_request_id IS 'Fashion AI API request ID for tracking';